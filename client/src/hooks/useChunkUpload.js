import { useState } from "react";
import axios from "axios";
import { useUser } from "./useUser";
import BASE_URL from '../config';

export const useChunkUpload = () => {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [form, setForm] = useState({
    fileName: "",
    fileSize: 0,
    contentType: "",
    totalChunks: 0,
    chunkSize: 5 * 1024 * 1024, // 5MB
    userId: "",
    fileHash: "",
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  const getChunk = (file, chunkIndex, chunkSize) => {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    return file.slice(start, end);
  };

  const computeHash = async (file) => {
    const chunk = file.slice(0, 4 * 1024 * 1024); // first 4MB
    const arrayBuffer = await chunk.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const chunkSize = 5 * 1024 * 1024; // 5MB
      const calculatedTotalChunks = Math.ceil(selectedFile.size / chunkSize);
      setTotalChunks(calculatedTotalChunks);

      setForm({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        contentType: selectedFile.type || "application/octet-stream",
        totalChunks: calculatedTotalChunks,
        chunkSize: chunkSize,
        userId: user?._id || "", // User ID from auth context
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const fileHash = await computeHash(file);
    console.log("File hash:", fileHash);
    
    try {
      const checkingHashResponse = await axios.post(
        `${BASE_URL}/api/chunks/compute-hash-check`,
        {
          userId: form.userId,
          fileSize: form.fileSize,
          fileHash: fileHash,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("Hash check response:", checkingHashResponse.data);

      // Check if daily upload limit exceeded
      if (checkingHashResponse.data.message === "Daily upload limit exceeded") {
        setUploadStatus("Daily upload limit exceeded. Please try again tomorrow.");
        return;
      }

      setUploading(true);
      setProgress(0);
      setUploadStatus("");
      
      // Step 1: Initiate upload session
      if (!checkingHashResponse.data.exists) {
        const initiateResponse = await axios.post(
          `${BASE_URL}/api/chunks/upload-initiate`,
          { ...form, fileHash },{
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const sessionId = initiateResponse.data.uploadSessionId;
        const logHash = await axios.post(
          `${BASE_URL}/api/chunks/logging-hash`,
          {
            fileHash: fileHash,
            sessionId: sessionId,
          }
        );
        console.log("Hash logging response:", logHash.data);

        // Step 2: Upload all chunks using presigned URLs and collect ETags
        const total = form.totalChunks;
        const uploadId = initiateResponse.data.uploadId;
        const key = initiateResponse.data.key; // Use key from server response
        const partsArray = [];
        const PARALLEL_UPLOADS = 4; // Number of parallel uploads

        // Process chunks in batches of 4
        for (
          let batchStart = 0;
          batchStart < total;
          batchStart += PARALLEL_UPLOADS
        ) {
          const batchEnd = Math.min(batchStart + PARALLEL_UPLOADS, total);
          const batchIndices = Array.from(
            { length: batchEnd - batchStart },
            (_, i) => batchStart + i
          );

          // Step 1: Get presigned URLs for batch in parallel
          const urlPromises = batchIndices.map((chunkIndex) =>
            axios.post(
              `${BASE_URL}/api/chunks/get-presigned-url`,
              {
                key: key,
                uploadId: uploadId,
                PartNumber: chunkIndex + 1,
              }
            )
          );
          const urlResponses = await Promise.all(urlPromises);

          // Step 2: Upload all chunks in batch in parallel
          const uploadPromises = batchIndices.map(async (chunkIndex, idx) => {
            const presignedUrl = urlResponses[idx].data.url;
            const chunk = getChunk(file, chunkIndex, form.chunkSize);

            // Upload chunk directly to R2 using presigned URL
            const uploadResponse = await fetch(presignedUrl, {
              method: "PUT",
              body: chunk,
              headers: {
                "Content-Type": "application/octet-stream",
              },
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `Chunk ${chunkIndex + 1} upload failed: ${
                  uploadResponse.statusText
                }`
              );
            }

            // Capture ETag from response headers
            const etag =
              uploadResponse.headers.get("ETag") ||
              uploadResponse.headers.get("etag");
            if (!etag) {
              throw new Error(`Missing ETag for chunk ${chunkIndex + 1}`);
            }

            return { partNumber: chunkIndex + 1, ETag: etag };
          });

          const batchResults = await Promise.all(uploadPromises);
          partsArray.push(...batchResults);

          // Update progress after each batch
          setProgress(Math.round((batchEnd / total) * 100));
          console.log(
            `Uploaded batch: chunks ${batchStart + 1}-${batchEnd}/${total}`
          );
        }

        // Sort parts by partNumber (S3 expects ordered list)
        partsArray.sort((a, b) => a.partNumber - b.partNumber);

        // Switch to processing loader and complete multipart upload
        setProcessing(true);
        setUploadStatus("");
        await axios.post(
          `${BASE_URL}/api/chunks/upload-complete`,
          {
            sessionId: sessionId,
            uploadId: uploadId,
            fileName: form.fileName,
            mimeType: form.contentType,
            size: form.fileSize,
            key: key,
            parts: partsArray,
          }
        );
        // Cleanup hash session after successful upload
        try {
          await axios.delete(
            `${BASE_URL}/api/chunks/delete-hash-session/${sessionId}`,{
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },  
            }
          );
        } catch (err) {
          console.warn("Failed to cleanup hash session:", err);
        }
        setProcessing(false);
        setUploadStatus("Upload complete!");
      } else {
        // File hash already exists - check if upload is completed
        const sessionId = checkingHashResponse.data.sessionId;
        const checkingCompletion = await axios.post(
          `${BASE_URL}/api/chunks/upload-status/${sessionId}`
        );

        if (checkingCompletion.data.status === "completed") {
          setUploadStatus("Upload already completed!");
        } else {
          setUploadStatus("Upload incomplete. Please retry.");
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      
      // Check if it's a daily limit error from the catch block
      if (err.response?.data?.message === "Daily upload limit exceeded") {
        setUploadStatus("Daily upload limit exceeded. Please try again tomorrow.");
      } else {
        setUploadStatus("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    file,
    totalChunks,
    form,
    uploading,
    progress,
    uploadStatus,
    processing,
    handleFileChange,
    handleUpload,
  };
};

import { useState } from "react";
import axios from "axios";

export const useChunkUpload = () => {
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
        userId: "67b92a46b8ef91e1e4f6c111", // Replace with actual user ID from auth
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const fileHash = await computeHash(file);
    console.log("File hash:", fileHash);
    const checkingHashResponse = await axios.post(
      "http://localhost:3000/api/chunks/compute-hash-check",
      {
        fileHash: fileHash,
      }
    );
    console.log("Hash check response:", checkingHashResponse.data);

    setUploading(true);
    setProgress(0);
    setUploadStatus("");
    try {
      // Step 1: Initiate upload session
      if (!checkingHashResponse.data.exists) {
        const initiateResponse = await axios.post(
          "http://localhost:3000/api/chunks/upload-initiate",
          { ...form, fileHash }
        );
        const sessionId = initiateResponse.data.uploadSessionId;
        const logHash = await axios.post(
          "http://localhost:3000/api/chunks/logging-hash",
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

        // Loop through all chunks from 0 to total
        for (let chunkIndex = 0; chunkIndex < total; chunkIndex++) {
          // Get presigned URL for this chunk
          const urlResponse = await axios.post(
            "http://localhost:3000/api/chunks/get-presigned-url",
            {
              key: key,
              uploadId: uploadId,
              PartNumber: chunkIndex + 1,
            }
          );
          const presignedUrl = urlResponse.data.url;

          // Get chunk data
          const chunk = getChunk(file, chunkIndex, form.chunkSize);

          // Upload chunk directly to R2 using presigned URL with fetch (NOT axios to avoid extra headers)
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
          partsArray.push({ partNumber: chunkIndex + 1, ETag: etag });

          setProgress(Math.round(((chunkIndex + 1) / total) * 100));
          console.log(
            `Uploaded chunk ${chunkIndex + 1}/${total} with ETag: ${etag}`
          );
        }

        // Sort parts by partNumber (S3 expects ordered list)
        partsArray.sort((a, b) => a.partNumber - b.partNumber);

        // Switch to processing loader and complete multipart upload
        setProcessing(true);
        setUploadStatus("");
        await axios.post("http://localhost:3000/api/chunks/upload-complete", {
          sessionId: sessionId,
          uploadId: uploadId,
          key: key,
          parts: partsArray,
        });
        // Cleanup hash session after successful upload
        try {
          await axios.delete(
            `http://localhost:3000/api/chunks/delete-hash-session/${sessionId}`
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
          `http://localhost:3000/api/chunks/upload-status/${sessionId}`
        );

        if (checkingCompletion.data.status === "completed") {
          setUploadStatus("File already exists on server. Upload skipped.");
        } else {
          setUploadStatus(
            "File upload in progress. Please wait or try again later."
          );
        }
        setUploading(false);
        return;
      }
    } catch (error) {
      setUploadStatus("Upload failed. Please try again.");
      console.error("Error:", error);
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

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
    const checkingHashResponse = await axios.post("http://localhost:3000/api/chunks/compute-hash-check", {
      fileHash: fileHash,
    });
    console.log("Hash check response:", checkingHashResponse.data);
    
    setUploading(true);
    setProgress(0);
    setUploadStatus("");
    try {
      // Step 1: Initiate upload session
      if (!checkingHashResponse.data.exists) {
        const initiateResponse = await axios.post(
          "http://localhost:3000/api/chunks/upload-initiate",
          form
        );
        const sessionId = initiateResponse.data.uploadSessionId;
        const logHash = await axios.post("http://localhost:3000/api/chunks/logging-hash", {
          fileHash: fileHash,
          sessionId: sessionId,
        });
        console.log("Hash logging response:", logHash.data);
        
        // Step 2: Upload chunks
        const total = form.totalChunks;
        let uploaded = 0;
        let nextChunk = 0;
        const uploadChunk = async (chunkIndex) => {
          const chunk = getChunk(file, chunkIndex, form.chunkSize);
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("sessionId", sessionId);
          formData.append("index", chunkIndex.toString());
          await axios.post(
            "http://localhost:3000/api/chunks/upload-chunk",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          uploaded++;
          setProgress(Math.round((uploaded / total) * 100));
        };

        // Start up to 4 uploads, and as each finishes, start the next
        await new Promise((resolve, reject) => {
          let inFlight = 0;
          let hasError = false;
          function launchNext() {
            if (hasError) return;
            if (uploaded === total) return resolve();
            if (nextChunk >= total) return;
            const chunkIndex = nextChunk++;
            inFlight++;
            uploadChunk(chunkIndex)
              .then(() => {
                inFlight--;
                if (uploaded === total) return resolve();
                launchNext();
              })
              .catch((err) => {
                hasError = true;
                reject(err);
              });
          }
          // Start initial pool
          for (let i = 0; i < Math.min(4, total); i++) {
            launchNext();
          }
        });

        // Switch to processing loader
        setProcessing(true);
        setUploadStatus("");
        await axios.post("http://localhost:3000/api/chunks/upload-complete", {
          sessionId: sessionId,
        });
        // Cleanup hash session after successful upload
        try {
          await axios.delete(`http://localhost:3000/api/chunks/delete-hash-session/${sessionId}`);
        } catch (err) {
          console.warn("Failed to cleanup hash session:", err);
        }
        setProcessing(false);
        setUploadStatus("Upload complete!");

      } else {
        const sessionId = checkingHashResponse.data.sessionId;
        const checkingCompletion = await axios.post(`http://localhost:3000/api/chunks/upload-status/${sessionId}`);
        if (checkingCompletion.data.status === "completed") {
          setUploadStatus("File already exists on server. Upload skipped.if you want to re-upload, please try one more time.");
          setUploading(false);
          return;
        } else if (checkingCompletion.data.status === "uploading" || checkingCompletion.data.status === "initiated") {
          // Resume uploading only the missing chunks
          const received = checkingCompletion.data.receivedChunks || [];
          const total = checkingCompletion.data.totalChunks || form.totalChunks;

          // Build a set of received indexes (handle array or object/map shapes)
          const receivedSet = new Set();
          if (Array.isArray(received)) {
            received.forEach((r) => receivedSet.add(Number(r)));
          } else if (received && typeof received === "object") {
            Object.keys(received).forEach((k) => {
              if (received[k]) receivedSet.add(Number(k));
            });
          }

          const missingChunks = [];
          for (let i = 0; i < total; i++) {
            if (!receivedSet.has(i)) missingChunks.push(i);
          }

          if (missingChunks.length === 0) {
            // Nothing missing but not marked completed — attempt finalize
            setProcessing(true);
            try {
              await axios.post("http://localhost:3000/api/chunks/upload-complete", { sessionId });
              // Cleanup hash session after successful upload
              try {
                await axios.delete(`http://localhost:3000/api/chunks/delete-hash-session/${sessionId}`);
              } catch (err) {
                console.warn("Failed to cleanup hash session:", err);
              }
              setUploadStatus("Upload complete!");
            } catch (err) {
              setUploadStatus("Failed to finalize upload. Please try again.");
            }
            setProcessing(false);
            setUploading(false);
            return;
          }

          setUploadStatus(`Resuming upload: ${missingChunks.length} missing chunks will be uploaded.`);

          const initialReceived = checkingCompletion.data.totalReceived || 0;
          setProgress(Math.round((initialReceived / total) * 100));

          // Upload missing chunks with a small concurrency pool (4)
          try {
            await new Promise((resolve, reject) => {
              let inFlight = 0;
              let next = 0;
              let uploadedCount = 0;
              let hasError = false;

              const launchNext = () => {
                if (hasError) return;
                if (uploadedCount === missingChunks.length) return resolve();
                if (next >= missingChunks.length) return;

                const chunkIndex = missingChunks[next++];
                inFlight++;

                const chunk = getChunk(file, chunkIndex, form.chunkSize);
                const formData = new FormData();
                formData.append("chunk", chunk);
                formData.append("sessionId", sessionId);
                formData.append("index", chunkIndex.toString());

                axios
                  .post("http://localhost:3000/api/chunks/upload-chunk", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  })
                  .then(() => {
                    inFlight--;
                    uploadedCount++;
                    setProgress(Math.round(((initialReceived + uploadedCount) / total) * 100));
                    if (uploadedCount === missingChunks.length) return resolve();
                    launchNext();
                  })
                  .catch((err) => {
                    hasError = true;
                    reject(err);
                  });
              };

              const start = Math.min(4, missingChunks.length);
              for (let i = 0; i < start; i++) launchNext();
            });

            // After uploading missing chunks, finalize
            setProcessing(true);
            await axios.post("http://localhost:3000/api/chunks/upload-complete", { sessionId });
            // Cleanup hash session after successful upload
            try {
              await axios.delete(`http://localhost:3000/api/chunks/delete-hash-session/${sessionId}`);
            } catch (err) {
              console.warn("Failed to cleanup hash session:", err);
            }
            setProcessing(false);
            setUploadStatus("Upload complete!");
          } catch (err) {
            console.error(err);
            setUploadStatus("Upload failed while resuming. Please try again.");
          }

          setUploading(false);
          return;
        }

        setUploadStatus("File already exists on server. Upload skipped.");
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
    handleUpload
  };
};

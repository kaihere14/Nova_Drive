import React from "react";
import { useChunkUpload } from "../hooks/useChunkUpload";
import FileInfo from "../components/FileInfo";
import ProgressBar from "../components/ProgressBar";
import StatusMessage from "../components/StatusMessage";
import UploadButton from "../components/UploadButton";
import "../App.css"; // Assuming styles are still here or we can move them

const UploadPage = () => {
  const {
    file,
    totalChunks,
    form,
    uploading,
    progress,
    uploadStatus,
    processing,
    handleFileChange,
    handleUpload,
  } = useChunkUpload();

  return (
    <div className="upload-container">
      <h1>File Upload</h1>

      <div className="upload-box">
        <input type="file" onChange={handleFileChange} id="file-input" />

        <FileInfo
          file={file}
          totalChunks={totalChunks}
          chunkSize={form.chunkSize}
        />

        <UploadButton
          onClick={handleUpload}
          disabled={!file || uploading || processing}
          uploading={uploading}
          processing={processing}
        />

        <ProgressBar
          uploading={uploading}
          processing={processing}
          progress={progress}
        />

        <StatusMessage
          status={uploadStatus}
          uploading={uploading}
          processing={processing}
        />
      </div>
    </div>
  );
};

export default UploadPage;

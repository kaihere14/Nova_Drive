import React from "react";

const FileInfo = ({ file, totalChunks, chunkSize }) => {
  if (!file) return null;

  return (
    <div className="file-info">
      <p>
        <strong>Selected file:</strong> {file.name}
      </p>
      <p>
        <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
      </p>
      <p>
        <strong>Type:</strong> {file.type || "N/A"}
      </p>
      <p>
        <strong>Total Chunks:</strong> {totalChunks}
      </p>
      <p>
        <strong>Chunk Size:</strong> {(chunkSize / (1024 * 1024)).toFixed(2)} MB
      </p>
    </div>
  );
};

export default FileInfo;

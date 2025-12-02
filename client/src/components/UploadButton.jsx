import React from "react";

const UploadButton = ({ onClick, disabled, uploading, processing }) => {
  return (
    <button
      onClick={onClick}
      className="upload-button"
      disabled={disabled}
    >
      {uploading ? "Uploading..." : processing ? "Processing..." : "Upload"}
    </button>
  );
};

export default UploadButton;

import React from "react";

const StatusMessage = ({ status, uploading, processing }) => {
  if (!status || uploading || processing) return null;

  return <div className="upload-status">{status}</div>;
};

export default StatusMessage;

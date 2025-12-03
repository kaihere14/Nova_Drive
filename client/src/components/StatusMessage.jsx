import React from "react";

const StatusMessage = ({ status, uploading, processing }) => {
  if (!status || uploading || processing) return null;

  const isSuccess = status.toLowerCase().includes("complete") || status.toLowerCase().includes("success");
  const isError = status.toLowerCase().includes("failed") || status.toLowerCase().includes("error");

  return (
    <div className={`p-4 rounded-lg border font-mono text-sm ${
      isSuccess 
        ? "bg-green-500/10 border-green-500/20 text-green-400" 
        : isError 
        ? "bg-red-500/10 border-red-500/20 text-red-400"
        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isSuccess ? "bg-green-500" : isError ? "bg-red-500" : "bg-blue-500"
        }`}></div>
        {status}
      </div>
    </div>
  );
};

export default StatusMessage;

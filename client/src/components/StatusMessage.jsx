import React from "react";

const StatusMessage = ({ status, uploading, processing }) => {
  if (!status || uploading || processing) return null;

  const isSuccess =
    status.toLowerCase().includes("complete") ||
    status.toLowerCase().includes("success");
  const isError =
    status.toLowerCase().includes("failed") ||
    status.toLowerCase().includes("error") ||
    status.toLowerCase().includes("❌") ||
    status.toLowerCase().includes("🚫") ||
    status.toLowerCase().includes("💾") ||
    status.toLowerCase().includes("📁") ||
    status.toLowerCase().includes("🔐") ||
    status.toLowerCase().includes("🌐") ||
    status.toLowerCase().includes("🛠️") ||
    status.toLowerCase().includes("🔄") ||
    status.toLowerCase().includes("🔍");

  return (
    <div
      className={`group relative p-4 rounded-lg border font-mono text-sm transition-all duration-300 overflow-hidden ${
        isSuccess
          ? "bg-gradient-to-br from-green-900/30 to-green-950/30 border-green-500/30 hover:border-green-500/50 text-green-300 hover:shadow-lg hover:shadow-green-500/10"
          : isError
          ? "bg-gradient-to-br from-red-900/30 to-red-950/30 border-red-500/30 hover:border-red-500/50 text-red-300 hover:shadow-lg hover:shadow-red-500/10"
          : "bg-gradient-to-br from-blue-900/30 to-blue-950/30 border-blue-500/30 hover:border-blue-500/50 text-blue-300 hover:shadow-lg hover:shadow-blue-500/10"
      }`}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          isSuccess
            ? "from-green-500/0 to-transparent group-hover:from-green-500/3"
            : isError
            ? "from-red-500/0 to-transparent group-hover:from-red-500/3"
            : "from-blue-500/0 to-transparent group-hover:from-blue-500/3"
        } transition-all duration-300 pointer-events-none`}
      />

      <div className="relative flex items-start gap-2">
        <div
          className={`w-2 h-2 rounded-full shadow-lg mt-1 flex-shrink-0 ${
            isSuccess
              ? "bg-green-500 shadow-green-500/50"
              : isError
              ? "bg-red-500 shadow-red-500/50"
              : "bg-blue-500 shadow-blue-500/50"
          }`}
        ></div>
        <div className="flex-1 min-w-0">{status}</div>
      </div>
    </div>
  );
};

export default StatusMessage;

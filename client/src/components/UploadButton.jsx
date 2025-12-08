import React from "react";
import { Upload, Loader2, Zap } from "lucide-react";

const UploadButton = ({ onClick, disabled, uploading, processing }) => {
  return (
    <button
      onClick={onClick}
      className="group w-full relative overflow-hidden px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 font-mono group/btn"
      disabled={disabled}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
      {uploading || processing ? (
        <Loader2 className="w-5 h-5 animate-spin relative" />
      ) : (
        <Zap className="w-5 h-5 relative" />
      )}
      <span className="relative">{uploading
        ? "UPLOADING..."
        : processing
        ? "PROCESSING..."
        : "START_UPLOAD"}</span>
    </button>
  );
};

export default UploadButton;

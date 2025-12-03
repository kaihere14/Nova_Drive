import React from "react";
import { Upload, Loader2, Zap } from "lucide-react";

const UploadButton = ({ onClick, disabled, uploading, processing }) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 font-mono"
      disabled={disabled}
    >
      {uploading || processing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Zap className="w-5 h-5" />
      )}
      {uploading
        ? "UPLOADING..."
        : processing
        ? "PROCESSING..."
        : "START_UPLOAD"}
    </button>
  );
};

export default UploadButton;

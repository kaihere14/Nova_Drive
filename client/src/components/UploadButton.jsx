import React from "react";
import { Upload, Loader2 } from "lucide-react";

const UploadButton = ({ onClick, disabled, uploading, processing }) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      disabled={disabled}
    >
      {uploading || processing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Upload className="w-5 h-5" />
      )}
      {uploading
        ? "Uploading..."
        : processing
        ? "Processing..."
        : "Upload File"}
    </button>
  );
};

export default UploadButton;

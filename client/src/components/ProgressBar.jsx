import React from "react";

const ProgressBar = ({ uploading, processing, progress }) => {
  if (!uploading && !processing) return null;

  return (
    <div className="space-y-3">
      {uploading && (
        <>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm font-mono">
            <span className="text-zinc-400">UPLOADING_CHUNKS</span>
            <span className="text-blue-400">{progress}%</span>
          </div>
        </>
      )}
      {processing && (
        <div className="flex items-center gap-3 text-sm font-mono">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-zinc-400">PROCESSING_FILE...</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

import React from "react";

const ProgressBar = ({ uploading, processing, progress }) => {
  if (!uploading && !processing) return null;

  return (
    <div className="space-y-3">
      {uploading && (
        <>
          <div className="relative h-2 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full overflow-hidden border border-cyan-500/20">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm font-mono">
            <span className="text-zinc-400">UPLOADING_CHUNKS</span>
            <span className="text-cyan-400 font-semibold">{progress}%</span>
          </div>
        </>
      )}
      {processing && (
        <div className="flex items-center gap-3 text-sm font-mono p-3 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-lg">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse shadow-lg shadow-blue-500/30"></div>
          <span className="text-zinc-300">PROCESSING_FILE...</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

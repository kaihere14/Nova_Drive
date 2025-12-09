import React from "react";

const FileInfo = ({ file, totalChunks, chunkSize }) => {
  if (!file) return null;

  return (
    <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg p-4 space-y-2 font-mono text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/3 transition-all duration-300 pointer-events-none" />
      
      <div className="relative flex justify-between items-center pb-2 border-b border-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
        <span className="text-zinc-400">FILE_METADATA</span>
        <span className="px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded font-mono">READY</span>
      </div>
      <div className="relative flex justify-between">
        <span className="text-zinc-500">name:</span>
        <span className="text-cyan-300">{file.name}</span>
      </div>
      <div className="relative flex justify-between">
        <span className="text-zinc-500">size:</span>
        <span className="text-cyan-300">{(file.size / 1024).toFixed(2)} KB</span>
      </div>
      <div className="relative flex justify-between">
        <span className="text-zinc-500">type:</span>
        <span className="text-cyan-300">{file.type || "N/A"}</span>
      </div>
      <div className="relative flex justify-between">
        <span className="text-zinc-500">chunks:</span>
        <span className="text-blue-300 font-semibold">{totalChunks}</span>
      </div>
      <div className="relative flex justify-between">
        <span className="text-zinc-500">chunk_size:</span>
        <span className="text-cyan-300">{(chunkSize / (1024 * 1024)).toFixed(2)} MB</span>
      </div>
    </div>
  );
};

export default FileInfo;

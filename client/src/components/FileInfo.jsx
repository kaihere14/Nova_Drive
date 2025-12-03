import React from "react";

const FileInfo = ({ file, totalChunks, chunkSize }) => {
  if (!file) return null;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-2 font-mono text-sm">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
        <span className="text-zinc-400">FILE_METADATA</span>
        <span className="text-green-500 text-xs">READY</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">name:</span>
        <span className="text-zinc-200">{file.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">size:</span>
        <span className="text-zinc-200">{(file.size / 1024).toFixed(2)} KB</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">type:</span>
        <span className="text-zinc-200">{file.type || "N/A"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">chunks:</span>
        <span className="text-blue-400">{totalChunks}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">chunk_size:</span>
        <span className="text-zinc-200">{(chunkSize / (1024 * 1024)).toFixed(2)} MB</span>
      </div>
    </div>
  );
};

export default FileInfo;

import React from "react";
import { X, Upload } from "lucide-react";
import FileInfo from "./FileInfo";
import ProgressBar from "./ProgressBar";
import StatusMessage from "./StatusMessage";
import UploadButton from "./UploadButton";

const UploadModal = ({
  showUploadModal,
  setShowUploadModal,
  file,
  totalChunks,
  form,
  uploading,
  progress,
  uploadStatus,
  processing,
  handleFileChange,
  handleUpload,
}) => {
  if (!showUploadModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => setShowUploadModal(false)}
    >
      <div
        className="group relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 hover:border-cyan-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/3 transition-all duration-300 pointer-events-none" />
        
        <div className="relative flex justify-between items-center px-6 py-5 border-b border-zinc-700/30">
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Upload New File
            </h2>
            <p className="text-sm text-zinc-400 font-mono mt-1">
              Chunked upload with resume support
            </p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/20 rounded-lg transition-all duration-200 hover:scale-110"
            onClick={() => setShowUploadModal(false)}
          >
            <X className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition-colors" />
          </button>
        </div>
        <div className="relative px-6 py-6 space-y-5">
          {/* File Input Area */}
          <div className="group/upload border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/50 rounded-lg p-8 transition-all duration-300 bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/5">
            <div className="text-center">
              <div className="inline-block p-3 mb-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl group-hover/upload:from-cyan-500/30 group-hover/upload:to-cyan-600/20 transition-all duration-300">
                <Upload className="w-8 h-8 text-cyan-400 group-hover/upload:text-cyan-300 transition-colors" />
              </div>
              <label
                htmlFor="file-input"
                className="cursor-pointer inline-block"
              >
                <span className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Click to upload
                </span>
                <span className="text-zinc-400"> or drag and drop</span>
              </label>
              <p className="text-sm text-zinc-400 mt-2 font-mono">
                Any file type // 250MB daily limit
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                id="file-input"
                className="hidden"
              />
            </div>
          </div>

          {file && (
            <>
              <FileInfo
                file={file}
                totalChunks={totalChunks}
                chunkSize={form.chunkSize}
              />

              <UploadButton
                onClick={handleUpload}
                disabled={!file || uploading || processing}
                uploading={uploading}
                processing={processing}
              />
            </>
          )}

          <ProgressBar
            uploading={uploading}
            processing={processing}
            progress={progress}
          />

          <StatusMessage
            status={uploadStatus}
            uploading={uploading}
            processing={processing}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

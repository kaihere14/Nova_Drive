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
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Upload New File
            </h2>
            <p className="text-sm text-zinc-500 font-mono mt-1">
              Chunked upload with resume support
            </p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
            onClick={() => setShowUploadModal(false)}
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-5">
          {/* File Input Area */}
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 hover:border-cyan-500/40 transition-colors bg-zinc-800/30">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <label
                htmlFor="file-input"
                className="cursor-pointer inline-block"
              >
                <span className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Click to upload
                </span>
                <span className="text-zinc-500"> or drag and drop</span>
              </label>
              <p className="text-sm text-zinc-500 mt-2 font-mono">
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

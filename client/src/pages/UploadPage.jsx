import React, { useState } from "react";
import { useChunkUpload } from "../hooks/useChunkUpload";
import FileInfo from "../components/FileInfo";
import ProgressBar from "../components/ProgressBar";
import StatusMessage from "../components/StatusMessage";
import UploadButton from "../components/UploadButton";
import FilesList from "../components/FilesList";
import {
  Files,
  Clock,
  Star,
  Trash2,
  Search,
  Bell,
  Settings,
  X,
  Upload,
  Package,
} from "lucide-react";

const UploadPage = () => {
  const {
    file,
    totalChunks,
    form,
    uploading,
    progress,
    uploadStatus,
    processing,
    handleFileChange,
    handleUpload,
  } = useChunkUpload();

  const [activeView, setActiveView] = useState("files");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [storageInfo, setStorageInfo] = useState({
    usedBytes: 0,
    totalBytes: 10 * 1024 * 1024 * 1024, // 10 GB
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const storagePercentage = Math.round(
    (storageInfo.usedBytes / storageInfo.totalBytes) * 100
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <Package className="w-6 h-6" />
            <span>NovaDrive</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "files"
                ? "bg-indigo-50 text-indigo-600 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("files")}
          >
            <Files className="w-5 h-5" />
            <span>My Files</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "recent"
                ? "bg-indigo-50 text-indigo-600 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("recent")}
          >
            <Clock className="w-5 h-5" />
            <span>Recent Files</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "favorites"
                ? "bg-indigo-50 text-indigo-600 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("favorites")}
          >
            <Star className="w-5 h-5" />
            <span>Favorites</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "trash"
                ? "bg-indigo-50 text-indigo-600 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("trash")}
          >
            <Trash2 className="w-5 h-5" />
            <span>Recycle Bin</span>
          </button>
        </nav>
        <div className="px-5 py-5 border-t border-gray-200">
          <div className="text-xs">
            <div className="text-gray-500 font-medium mb-2">Storage</div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="text-gray-400">
              {formatFileSize(storageInfo.usedBytes)} of{" "}
              {formatFileSize(storageInfo.totalBytes)} used
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2.5 rounded-xl w-96">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything here..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2.5 px-2 py-1.5 bg-gray-100 rounded-xl cursor-pointer">
              <span className="text-sm font-medium text-gray-900">
                Karuna Mahi
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                KM
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeView === "files" && "My Files"}
              {activeView === "recent" && "Recent Files"}
              {activeView === "favorites" && "Favorites"}
              {activeView === "trash" && "Recycle Bin"}
            </h1>
            <button
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center gap-2"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-5 h-5" />
              Upload New File
            </button>
          </div>

          <FilesList
            userId="67b92a46b8ef91e1e4f6c111"
            activeView={activeView}
            onStorageUpdate={setStorageInfo}
          />
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload New File
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => setShowUploadModal(false)}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              {/* File Input Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 transition-colors bg-gray-50">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer inline-block"
                  >
                    <span className="text-indigo-600 hover:text-indigo-700 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Any file type supported
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
      )}
    </div>
  );
};

export default UploadPage;

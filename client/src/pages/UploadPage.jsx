import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  HardDrive,
  Zap,
  LogOut,
} from "lucide-react";
import { useUser } from "../hooks/useUser";

const UploadPage = () => {
  const navigate = useNavigate();
  const { user, checkAuth, loading, logout } = useUser();
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

  // Verify authentication on page load
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }
      
      await checkAuth();
      
      // If still no user after auth check, redirect to login
      if (!user) {
        navigate("/login");
      }
    };

    verifyAuth();
  }, []);



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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Show loading state while verifying
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-mono">VERIFYING_ACCESS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: '0.3' }}></div>
      
      {/* Sidebar */}
      <aside className="relative z-10 w-64 bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800 flex flex-col">
        <div className="px-5 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
            <span>NovaDrive</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "files"
                ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => setActiveView("files")}
          >
            <Files className="w-5 h-5" />
            <span>My Files</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "recent"
                ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => setActiveView("recent")}
          >
            <Clock className="w-5 h-5" />
            <span>Recent Files</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "favorites"
                ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => setActiveView("favorites")}
          >
            <Star className="w-5 h-5" />
            <span>Favorites</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              activeView === "trash"
                ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => setActiveView("trash")}
          >
            <Trash2 className="w-5 h-5" />
            <span>Recycle Bin</span>
          </button>
        </nav>
        <div className="px-5 py-5 border-t border-zinc-800">
          <div className="text-xs">
            <div className="flex items-center gap-2 text-zinc-400 font-mono mb-3">
              <HardDrive className="w-4 h-4" />
              <span>STORAGE STATUS</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="text-zinc-500 font-mono">
              {formatFileSize(storageInfo.usedBytes)} / {formatFileSize(storageInfo.totalBytes)}
            </div>
            <div className="mt-3 flex items-center gap-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-mono text-xs">OPERATIONAL</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-3 rounded-lg text-sm transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 hover:border-red-500/40"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-mono">LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-8 py-4 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800">
          <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2.5 rounded-lg w-96 border border-zinc-700">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search files..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
              <span className="text-sm font-medium text-zinc-200">
                {user?.username || "User"}
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 bg-zinc-950">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {activeView === "files" && "My Files"}
                {activeView === "recent" && "Recent Files"}
                {activeView === "favorites" && "Favorites"}
                {activeView === "trash" && "Recycle Bin"}
              </h1>
              <p className="mt-2 text-zinc-500 font-mono text-sm">
                {activeView === "files" && "All your uploaded files"}
                {activeView === "recent" && "Recently accessed files"}
                {activeView === "favorites" && "Starred files"}
                {activeView === "trash" && "Deleted files"}
              </p>
            </div>
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] flex items-center gap-2"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-5 h-5" />
              Upload New File
            </button>
          </div>

          <FilesList
            userId={user?._id || ""}
            username={user?.username || "User"}
            activeView={activeView}
            onStorageUpdate={setStorageInfo}
          />
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
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
                <p className="text-sm text-zinc-500 font-mono mt-1">Chunked upload with resume support</p>
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
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 hover:border-blue-500/50 transition-colors bg-zinc-800/30">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer inline-block"
                  >
                    <span className="text-blue-400 hover:text-blue-300 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-zinc-500"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-zinc-500 mt-2 font-mono">
                    Any file type // Max 10GB per file
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

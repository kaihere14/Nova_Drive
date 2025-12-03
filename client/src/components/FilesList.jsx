import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  HardDrive,
  Folder,
  Star,
  RefreshCw,
  FileText,
  Download,
  Share2,
  Trash2,
  X,
  Copy,
  Check,
} from "lucide-react";

const FilesList = ({
  userId,
  activeView = "files",
  searchQuery = "",
  onStorageUpdate,
  username = "User",
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModal, setShareModal] = useState({
    open: false,
    file: null,
    url: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/chunks/list-files/${userId}`
      );
      setFiles(response.data.files);
      setError(null);

      // Calculate total storage used
      const totalUsed = response.data.files.reduce(
        (acc, file) => acc + (file.size || 0),
        0
      );

      // Update storage info in parent component
      if (onStorageUpdate) {
        onStorageUpdate({
          usedBytes: totalUsed,
          totalBytes: 10 * 1024 * 1024 * 1024, // 10 GB
        });
      }
    } catch (err) {
      setError("Failed to load files");
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getFileName = (key) => {
    // Extract filename from key: uploads/userId/hash
    const parts = key.split("/");
    return parts[parts.length - 1];
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chunks/get-download-url",
        {
          key: file.key,
          filename: file.originalName,
          userId: userId,
        }
      );

      if (response.data.url) {
        // Redirect to download URL
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (file) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.originalName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:3000/api/chunks/delete-file",
        {
          data: {
            key: file.key,
            userId: userId,
          },
        }
      );

      if (response.data.success) {
        // Refresh files list after successful deletion
        fetchFiles();
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file");
    }
  };

  const handleShare = async (file) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chunks/get-download-url",
        {
          key: file.key,
          filename: file.originalName,
          userId: userId,
        }
      );

      if (response.data.url) {
        setShareModal({ open: true, file: file, url: response.data.url });
        setCopied(false);
      }
    } catch (err) {
      console.error("Error generating share link:", err);
      alert("Failed to generate share link");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareModal.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      alert("Failed to copy link");
    }
  };

  const closeShareModal = () => {
    setShareModal({ open: false, file: null, url: "" });
    setCopied(false);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-10 text-zinc-400">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-10 text-red-400">{error}</div>
      </div>
    );
  }

  // Filter files based on active view
  const getFilteredFiles = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let filtered = [];

    switch (activeView) {
      case "recent":
        // Show files modified in last 24 hours
        filtered = files.filter(
          (file) => new Date(file.lastModified) > oneDayAgo
        );
        break;
      case "favorites":
        // TODO: Implement favorites tracking (for now return empty)
        filtered = [];
        break;
      case "trash":
        // TODO: Implement trash/deleted files tracking (for now return empty)
        filtered = [];
        break;
      case "files":
      default:
        filtered = files;
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((file) => {
        const fileName = (
          file.originalName || getFileName(file.key)
        ).toLowerCase();
        return fileName.includes(query);
      });
    }

    return filtered;
  };

  const filteredFiles = getFilteredFiles();
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-cyan-500/30 transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-zinc-400 mb-1 font-mono">
              TOTAL_FILES
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {filteredFiles.length}
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-zinc-400 mb-1 font-mono">
              STORAGE_USED
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {formatFileSize(totalSize)}
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
            <Folder className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-zinc-400 mb-1 font-mono">FOLDERS</div>
            <div className="text-2xl font-bold text-zinc-100">1</div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
            <Star className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-zinc-400 mb-1 font-mono">
              FAVORITES
            </div>
            <div className="text-2xl font-bold text-zinc-100">0</div>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100 font-mono">
            YOUR_FILES
          </h3>
          <button
            className="w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            onClick={fetchFiles}
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <p className="text-lg font-semibold text-zinc-200 mb-2 font-mono">
              {activeView === "files" && "NO_FILES_UPLOADED"}
              {activeView === "recent" && "NO_RECENT_FILES"}
              {activeView === "favorites" && "NO_FAVORITE_FILES"}
              {activeView === "trash" && "RECYCLE_BIN_EMPTY"}
            </p>
            <span className="text-sm text-zinc-400">
              {activeView === "files" &&
                "Upload your first file to get started"}
              {activeView === "recent" &&
                "Files modified in the last 24 hours will appear here"}
              {activeView === "favorites" &&
                "Star files to add them to favorites"}
              {activeView === "trash" && "Deleted files will appear here"}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    FILE_NAME
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    OWNER
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    LAST_MODIFIED
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    FILE_SIZE
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredFiles.map((file, index) => (
                  <tr
                    key={index}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <span
                          className="font-medium text-zinc-200"
                          title={file.originalName}
                        >
                          {file.originalName && file.originalName.length > 30
                            ? file.originalName.slice(0, 30) + "..."
                            : file.originalName || getFileName(file.key)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {username}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(file.lastModified)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-md transition-colors"
                          title="Download"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-md transition-colors"
                          title="Share"
                          onClick={() => handleShare(file)}
                        >
                          <Share2 className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-red-500/10 rounded-md transition-colors group"
                          title="Delete"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModal.open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={closeShareModal}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-100 font-mono">
                SHARE_FILE
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                onClick={closeShareModal}
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-zinc-200">
                    {shareModal.file?.originalName}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Anyone with this link can download the file. Link expires in
                  60 seconds.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareModal.url}
                  readOnly
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesList;

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import BASE_URL from "../config";

const FilesList = forwardRef(
  (
    {
      userId,
      activeView = "files",
      searchQuery = "",
      onStorageUpdate,
      username = "User",
    },
    ref
  ) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareModal, setShareModal] = useState({
      open: false,
      file: null,
      url: "",
    });
    const [copied, setCopied] = useState(false);
    const [selectedTag, setSelectedTag] = useState("");
    const [showAllTags, setShowAllTags] = useState(false);
    const pollTimers = useRef([]);

    useEffect(() => {
      fetchFiles();
      return () => {
        // Clear all poll timers on unmount
        pollTimers.current.forEach((timer) => clearTimeout(timer));
        pollTimers.current = [];
      };
    }, [userId]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchFiles(false);
      },
      startPolling: () => {
        // Clear any existing timers
        pollTimers.current.forEach((timer) => clearTimeout(timer));
        pollTimers.current = [];

        // Schedule 3 polls: at 3s, 5s, and 7s
        const timer1 = setTimeout(() => fetchFiles(true), 3000);
        const timer2 = setTimeout(() => fetchFiles(true), 5000);
        const timer3 = setTimeout(() => fetchFiles(true), 7000);
        const timer4 = setTimeout(() => fetchFiles(true), 10000);
        const timer5 = setTimeout(() => fetchFiles(true), 10000);
        const timer6 = setTimeout(() => fetchFiles(true), 10000);

        pollTimers.current = [timer1, timer2, timer3, timer4, timer5, timer6];
      },
    }));

    const fetchFiles = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const response = await axios.get(
          `${BASE_URL}/api/files/list-files`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
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
          });
        }
      } catch (err) {
        setError("Failed to load files");
        console.error("Error fetching files:", err);
      } finally {
        if (!silent) setLoading(false);
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

    const getFileName = (r2Key) => {
      // Extract filename from r2Key: uploads/userId/hash
      const parts = r2Key.split("/");
      return parts[parts.length - 1];
    };

    const handleDownload = async (file) => {
      try {
        const response = await axios.post(
          "https://nova-drive-backend.vercel.app/api/chunks/get-download-url",
          {
            key: file.r2Key,
            filename: file.originalFileName,
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
        `Are you sure you want to delete "${file.originalFileName}"?\n\nThis action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }

      try {
        const response = await axios.delete(
          "https://nova-drive-backend.vercel.app/api/chunks/delete-file",
          {
            data: {
              key: file.r2Key,
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
          "https://nova-drive-backend.vercel.app/api/chunks/get-download-url",
          {
            key: file.r2Key,
            filename: file.originalFileName,
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
          <div className="text-center py-10 text-zinc-400">
            Loading files...
          </div>
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

    // Get all unique tags from completed AI processing
    const getAllTags = () => {
      const tagSet = new Set();
      files.forEach((file) => {
        if (file.aiStatus === "completed" && file.tags) {
          file.tags.forEach((tag) => tagSet.add(tag));
        }
      });
      return Array.from(tagSet).sort();
    };

    // Filter files based on active view
    const getFilteredFiles = () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let filtered = [];

      switch (activeView) {
        case "recent":
          // Show files modified in last 24 hours
          filtered = files.filter(
            (file) => new Date(file.createdAt) > oneDayAgo
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

      // Apply tag filter
      if (selectedTag && selectedTag.trim() !== "") {
        filtered = filtered.filter((file) => {
          return file.tags && file.tags.includes(selectedTag);
        });
      }

      // Apply search filter
      if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((file) => {
          const fileName = (
            file.originalFileName || getFileName(file.r2Key)
          ).toLowerCase();
          return fileName.includes(query);
        });
      }

      return filtered;
    };

    const filteredFiles = getFilteredFiles();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const availableTags = getAllTags();

    return (
      <div className="w-full">
        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-mono whitespace-nowrap">
                FILTER_BY_TAG:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedTag("")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-mono transition-all ${
                    selectedTag === ""
                      ? "bg-cyan-500 text-white shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  All Files
                </button>
                {(showAllTags ? availableTags : availableTags.slice(0, 3)).map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-lg font-mono transition-all ${
                        selectedTag === tag
                          ? "bg-cyan-500 text-white shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                )}
                {availableTags.length > 3 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="px-3 py-1.5 text-sm rounded-lg font-mono transition-all bg-zinc-800/50 text-cyan-400 hover:bg-zinc-700 border border-zinc-700"
                  >
                    {showAllTags
                      ? "Show Less"
                      : `+${availableTags.length - 3} More`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-cyan-500/30 transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
                FILES
              </div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-100">
                {filteredFiles.length}
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
              <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
                STORAGE
              </div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-100">
                {formatFileSize(totalSize)}
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
              <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
                FOLDERS
              </div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-100">
                1
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
                FAVORITES
              </div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-100">
                0
              </div>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-800">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100 font-mono">
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
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden md:block">
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
                            <div className="flex flex-col">
                              <span
                                className="font-medium text-zinc-200"
                                title={file.originalFileName}
                              >
                                {file.originalFileName &&
                                file.originalFileName.length > 30
                                  ? file.originalFileName.slice(0, 30) + "..."
                                  : file.originalFileName ||
                                    getFileName(file.r2Key)}
                              </span>
                              {file.aiStatus &&
                                file.aiStatus !== "completed" && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full w-fit font-mono mt-1 ${
                                      file.aiStatus === "pending"
                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                        : file.aiStatus === "processing"
                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                    }`}
                                  >
                                    AI: {file.aiStatus.toUpperCase()}
                                  </span>
                                )}
                              {file.aiStatus === "completed" &&
                                file.tags &&
                                file.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {file.tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              {file.aiStatus === "completed" &&
                                file.summary && (
                                  <p className="text-xs text-zinc-400 mt-1 max-w-md">
                                    {file.summary}
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {username}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {formatDate(file.createdAt)}
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

              {/* Mobile Card Layout */}
              <div className="md:hidden divide-y divide-zinc-800">
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-zinc-200 mb-1 break-words">
                          {file.originalFileName || getFileName(file.r2Key)}
                        </h4>
                        {file.aiStatus && file.aiStatus !== "completed" && (
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-mono mb-2 ${
                              file.aiStatus === "pending"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : file.aiStatus === "processing"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            AI: {file.aiStatus.toUpperCase()}
                          </span>
                        )}
                        {file.aiStatus === "completed" &&
                          file.tags &&
                          file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {file.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        {file.aiStatus === "completed" && file.summary && (
                          <p className="text-xs text-zinc-400 mb-2">
                            {file.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 font-mono">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end border-t border-zinc-800 pt-3">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">Download</span>
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
                        onClick={() => handleShare(file)}
                      >
                        <Share2 className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">Share</span>
                      </button>
                      <button
                        className="px-3 py-2 bg-zinc-800 hover:bg-red-500/10 rounded-md transition-colors"
                        onClick={() => handleDelete(file)}
                      >
                        <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
  }
);

export default FilesList;

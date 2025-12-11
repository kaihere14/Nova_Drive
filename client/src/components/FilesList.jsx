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
  Eye,
} from "lucide-react";
import BASE_URL from "../config";
import { useUser } from "../hooks/useUser";
import { useFolder } from "../context/FolderContext";

const FilesList = forwardRef(
  (
    {
      userId,
      activeView = "files",
      searchQuery = "",
      onStorageUpdate,
      username = "User",
      maxFiles = null,
    },
    ref
  ) => {
    const { currentFolderId } = useFolder();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareModal, setShareModal] = useState({
      open: false,
      file: null,
      url: "",
    });
    const [previewModal, setPreviewModal] = useState({
      open: false,
      file: null,
      fileType: "",
      url: "",
      loading: false,
    });
    const [copied, setCopied] = useState(false);
    const [selectedTag, setSelectedTag] = useState("");
    const [showAllTags, setShowAllTags] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pollTimers = useRef([]);

    useEffect(() => {
      fetchFiles();
      return () => {
        pollTimers.current.forEach((timer) => clearTimeout(timer));
        pollTimers.current = [];
      };
    }, [userId, currentFolderId, activeView]);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchFiles(false);
      },
      startPolling: () => {
        pollTimers.current.forEach((timer) => clearTimeout(timer));
        pollTimers.current = [];

        const timer1 = setTimeout(() => fetchFiles(true), 3000);
        const timer2 = setTimeout(() => fetchFiles(true), 7000);
        const timer3 = setTimeout(() => fetchFiles(true), 10000);
        const timer4 = setTimeout(() => fetchFiles(true), 20000);

        pollTimers.current = [timer1, timer2, timer3, timer4];
      },
    }));
    const fetchFiles = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        setIsRefreshing(true);

        // Use different endpoint for favorites view
        const endpoint =
          activeView === "favorites"
            ? `${BASE_URL}/api/files/list-favourite-files`
            : `${BASE_URL}/api/files/list-files?directory=${currentFolderId}`;

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setFiles(response.data.files);
        console.log("Fetched files:", response.data.files);
        setError(null);

        // Calculate favorites count
        const favoritesCount = response.data.files.filter(
          (file) => file.favourite === true
        ).length;

        // Update storage info with favorites
        if (onStorageUpdate) {
          onStorageUpdate({
            favorites: favoritesCount,
          });
        }
      } catch (err) {
        setError("Failed to load files");
      } finally {
        if (!silent) {
          setLoading(false);
        }
        setTimeout(() => setIsRefreshing(false), 500);
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
          `${BASE_URL}/api/chunks/get-download-url`,
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
          `${BASE_URL}/api/chunks/delete-file`,
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
        alert("Failed to delete file");
      }
    };

    const handleShare = async (file) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chunks/get-download-url`,
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

    const handleSetFavourite = async (fileId) => {
      try {
        await axios.get(`${BASE_URL}/api/files/set-favourite/${fileId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        fetchFiles();
      } catch (err) {
        console.error("Error setting favourite:", err);
        alert("Failed to set favourite");
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

    const handleView = async (file) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chunks/get-preview-url`,
          {
            key: file.r2Key,
            userId: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data.url) {
          // For other files, show in modal
          setPreviewModal({
            open: true,
            file: file,
            fileType: response.data.fileType,
            url: response.data.url,
            loading: false,
          });
        }
      } catch (err) {
        console.error("Error generating preview URL:", err);
        alert("Failed to open file");
      }
    };

    const closePreviewModal = () => {
      setPreviewModal({
        open: false,
        file: null,
        fileType: "",
        url: "",
        loading: false,
      });
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
          // API already returns only favourite files
          filtered = files;
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

      // Apply max files limit
      if (maxFiles && maxFiles > 0) {
        filtered = filtered.slice(0, maxFiles);
      }

      return filtered;
    };

    const filteredFiles = getFilteredFiles();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const favoritesCount = files.filter(
      (file) => file.favourite === true
    ).length;
    const availableTags = getAllTags();

    // Only show the last 10 tags
    const lastTenTags = availableTags.slice(-10);
    const visibleTags = showAllTags ? lastTenTags : lastTenTags.slice(-3);
    return (
      <div className="w-full">
        {/* Tag Filter */}
        {lastTenTags.length > 0 && (
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
                {visibleTags.map((tag) => (
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
                ))}
                {lastTenTags.length > 3 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="px-3 py-1.5 text-sm rounded-lg font-mono transition-all bg-zinc-800/50 text-cyan-400 hover:bg-zinc-700 border border-zinc-700"
                  >
                    {showAllTags
                      ? "Show Less"
                      : `+${lastTenTags.length - 3} More`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
              <RefreshCw
                className={`w-4 h-4 text-zinc-400 transition-transform duration-500 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
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
                        className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => handleView(file)}
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
                        <td
                          className="px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex gap-2 justify-end">
                            <button
                              className="w-8 h-8 flex items-center justify-center hover:bg-yellow-500/10 rounded-md transition-colors"
                              title={
                                file.favourite
                                  ? "Remove from favourites"
                                  : "Add to favourites"
                              }
                              onClick={() => handleSetFavourite(file._id)}
                            >
                              {file.favourite ? (
                                <Star
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                />
                              ) : (
                                <Star className="w-4 h-4 text-yellow-400" />
                              )}
                            </button>
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
                    className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => handleView(file)}
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
                    <div
                      className="flex gap-2 justify-end border-t border-zinc-800 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="px-3 py-2 bg-zinc-800 hover:bg-yellow-500/10 rounded-md transition-colors"
                        title={
                          file.favourite
                            ? "Remove from favourites"
                            : "Add to favourites"
                        }
                        onClick={() => handleSetFavourite(file._id)}
                      >
                        {file.favourite ? (
                          <Star
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                          />
                        ) : (
                          <Star className="w-4 h-4 text-yellow-400" />
                        )}
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
                        onClick={() => handleView(file)}
                      >
                        <Eye className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">View</span>
                      </button>
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

        {/* Preview Modal */}
        {previewModal.open && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closePreviewModal}
          >
            <div
              className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl h-[95vh] min-h-[400px] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800 bg-zinc-900/95">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Eye className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="font-medium text-zinc-200 truncate text-sm">
                    {previewModal.file?.originalFileName}
                  </span>
                </div>
                <button
                  className="w-8 h-8 shrink-0 ml-2 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  onClick={closePreviewModal}
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 bg-zinc-950 overflow-hidden flex items-center justify-center">
                {previewModal.loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-zinc-400 text-sm font-mono">
                        Loading preview...
                      </p>
                    </div>
                  </div>
                ) : previewModal.url ? (
                  <>
                    {previewModal.fileType?.startsWith("image/") ? (
                      /* Image Preview */
                      <img
                        src={previewModal.url}
                        alt={previewModal.file?.originalFileName}
                        className="min-w-full min-h-full object-contain"
                      />
                    ) : previewModal.fileType?.startsWith("video/") ? (
                      /* Video Preview */
                      <video
                        controls
                        className="w-full h-full object-contain"
                        style={{ maxHeight: "100%" }}
                      >
                        <source
                          src={previewModal.url}
                          type={previewModal.fileType}
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : previewModal.fileType === "application/pdf" ? (
                      /* PDF Preview */
                      <embed
                        src={previewModal.url}
                        type="application/pdf"
                        className="w-full h-full"
                      />
                    ) : (
                      /* Other file types - iframe */
                      <iframe
                        src={previewModal.url}
                        className="w-full h-full bg-white"
                        title="File Preview"
                      />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <p className="text-zinc-400">Failed to load preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default FilesList;

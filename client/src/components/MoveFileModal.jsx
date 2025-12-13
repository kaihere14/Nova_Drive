import React, { useState, useEffect } from "react";
import { X, FolderOpen, Folder, Home } from "lucide-react";
import axios from "axios";
import BASE_URL from "../config";

const MoveFileModal = ({ isOpen, onClose, onConfirm, fileName, currentFolderId, userId }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchAllFolders();
    }
  }, [isOpen, userId]);

  const fetchAllFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Fetch all folders for this user (don't filter by parentFolderId)
      const response = await axios.get(
        `${BASE_URL}/api/folders/get-folders/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched folders:", response.data);
      setFolders(response.data.folders || []);
    } catch (err) {
      console.error("Error fetching folders:", err);
      console.error("Error response:", err?.response?.data);
      setError("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedFolderId === currentFolderId) return;
    
    setMoving(true);
    setError(null);
    
    try {
      await onConfirm(selectedFolderId);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to move file");
    } finally {
      setMoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="group relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 hover:border-cyan-500/30 rounded-lg shadow-2xl hover:shadow-cyan-500/10 max-w-md w-full transition-all duration-300 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/3 transition-all duration-300 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-zinc-700/30">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Move File
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/20 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6">
          <p className="text-zinc-300 text-center mb-4 text-sm">
            Select a folder to move <span className="font-semibold text-white">"{fileName}"</span>
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {/* Root folder option */}
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  selectedFolderId === null
                    ? "bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-300"
                    : "bg-zinc-800/50 border-2 border-transparent hover:bg-zinc-700/50 text-zinc-300"
                }`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium font-mono text-sm">Root Folder</span>
              </button>

              {/* Folder list */}
              {folders.length > 0 ? (
                folders
                  .filter((folder) => folder._id !== currentFolderId)
                  .map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => setSelectedFolderId(folder._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        selectedFolderId === folder._id
                          ? "bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-300"
                          : "bg-zinc-800/50 border-2 border-transparent hover:bg-zinc-700/50 text-zinc-300"
                      }`}
                    >
                      <FolderOpen className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium font-mono text-sm truncate">
                        {folder.name}
                      </span>
                    </button>
                  ))
              ) : (
                <p className="text-zinc-500 text-center py-4 text-sm">No folders available</p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm text-center font-mono">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative flex gap-3 p-6 border-t border-zinc-700/30">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-600/30 text-zinc-300 hover:text-white rounded-lg font-medium transition-all disabled:opacity-50"
            disabled={moving}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 relative overflow-hidden px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20 group/btn"
            disabled={moving || loading || selectedFolderId === currentFolderId || (selectedFolderId === null && currentFolderId === null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative">{moving ? "Moving..." : "Move File"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveFileModal;

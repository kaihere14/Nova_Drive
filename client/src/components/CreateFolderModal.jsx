import React, { useState } from "react";
import { FolderPlus, X } from "lucide-react";
import { useFolder } from "../context/FolderContext";
import { useUser } from "../hooks/useUser";

const CreateFolderModal = ({ isOpen, onClose, currentFolderId }) => {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { createFolder } = useFolder();
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    if (!user?._id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createFolder(folderName.trim());

      if (result.success) {
        setFolderName("");
        onClose();
      } else {
        setError(result.message || "Failed to create folder");
      }
    } catch (err) {
      setError("An error occurred while creating the folder");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="group relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 hover:border-blue-500/30 rounded-2xl w-full max-w-md mx-4 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent group-hover:from-blue-500/3 transition-all duration-300 pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex justify-between items-center px-6 py-5 border-b border-zinc-700/30">
          <h3 className="text-lg font-semibold text-zinc-100 font-mono bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            CREATE_FOLDER
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-blue-400 hover:text-blue-300 transition-colors" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 font-mono">
              FOLDER_NAME
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-blue-500/20 hover:border-blue-500/40 focus:border-blue-500/60 rounded-xl text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono transition-all duration-200"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-blue-300 bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-500/30 rounded-lg px-3 py-2 font-mono">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-600/30 text-zinc-300 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="flex-1 relative overflow-hidden px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/20 disabled:shadow-none disabled:text-zinc-500 flex items-center justify-center gap-2 group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              {loading ? (
                <>
                  <div className="relative w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="relative">Creating...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 relative" />
                  <span className="relative">Create</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
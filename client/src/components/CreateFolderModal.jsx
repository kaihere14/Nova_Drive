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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100 font-mono">
            CREATE_FOLDER
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 font-mono">
              FOLDER_NAME
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Create
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
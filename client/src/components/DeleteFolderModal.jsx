import React from "react";
import { X, Trash2 } from "lucide-react";

const DeleteFolderModal = ({ isOpen, onClose, onConfirm, folderName, loading, error }) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="group relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 hover:border-red-500/30 rounded-lg shadow-2xl hover:shadow-red-500/10 max-w-md w-full transition-all duration-300 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-transparent group-hover:from-red-500/3 transition-all duration-300 pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-zinc-700/30">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">Delete Folder</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-red-400 hover:text-red-300 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center border border-red-500/20">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
          </div>

          <p className="text-zinc-300 text-center mb-2">
            Are you sure you want to delete <span className="font-semibold text-white">"{folderName}"</span>?
          </p>

          <p className="text-zinc-400 text-sm text-center font-mono">
            This action cannot be undone. All files and subfolders within this folder will also be deleted.
          </p>

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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/20 group/btn"
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative">{loading ? "Deleting..." : "Delete Folder"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
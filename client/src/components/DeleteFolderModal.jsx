import React from "react";
import { X, Trash2 } from "lucide-react";

const DeleteFolderModal = ({ isOpen, onClose, onConfirm, folderName, loading, error }) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h3 className="text-lg font-semibold text-white">Delete Folder</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
          </div>

          <p className="text-zinc-300 text-center mb-2">
            Are you sure you want to delete <span className="font-semibold text-white">"{folderName}"</span>?
          </p>

          <p className="text-zinc-500 text-sm text-center">
            This action cannot be undone. All files and subfolders within this folder will also be deleted.
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg font-medium transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Folder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
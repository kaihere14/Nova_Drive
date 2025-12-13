import React, { useState } from "react";
import { X, Edit3 } from "lucide-react";

const RenameFolderModal = ({ isOpen, onClose, onConfirm, folderName, loading, error }) => {
  const [newName, setNewName] = useState(folderName || "");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!newName.trim()) return;
    await onConfirm(newName.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newName.trim()) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="group relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 hover:border-cyan-500/30 rounded-lg shadow-2xl hover:shadow-cyan-500/10 max-w-md w-full transition-all duration-300 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/3 transition-all duration-300 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-zinc-700/30">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Rename Folder
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
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-full flex items-center justify-center border border-cyan-500/20">
              <Edit3 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <p className="text-zinc-300 text-center mb-4 text-sm">
            Enter a new name for <span className="font-semibold text-white">"{folderName}"</span>
          </p>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
            placeholder="Folder name"
            autoFocus
            disabled={loading}
          />

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
            className="flex-1 relative overflow-hidden px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20 group/btn"
            disabled={loading || !newName.trim()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative">{loading ? "Renaming..." : "Rename"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameFolderModal;

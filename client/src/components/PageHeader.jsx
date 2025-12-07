import React from "react";
import { Upload, FolderPlus } from "lucide-react";

const PageHeader = ({
  title,
  description,
  showUploadButton = false,
  showCreateFolderButton = false,
  onUploadClick,
  onCreateFolderClick,
  activeView,
  setShowUploadModal,
  setShowCreateFolderModal
}) => {
  const getViewTitle = () => {
    switch (activeView) {
      case "files":
        return "My Files";
      case "recent":
        return "Recent Files";
      case "favorites":
        return "Favorites";
      case "trash":
        return "Recycle Bin";
      default:
        return "My Files";
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case "files":
        return "All your uploaded files";
      case "recent":
        return "Recently accessed files";
      case "favorites":
        return "Starred files";
      case "trash":
        return "Deleted files";
      default:
        return "All your uploaded files";
    }
  };

  const displayTitle = title || getViewTitle();
  const displayDescription = description || getViewDescription();

  const handleUploadClick = onUploadClick || (() => setShowUploadModal(true));
  const handleCreateFolderClick = onCreateFolderClick || (() => setShowCreateFolderModal(true));

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {displayTitle}
        </h1>
        <p className="mt-2 text-zinc-500 font-mono text-xs sm:text-sm">
          {displayDescription}
        </p>
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        {showCreateFolderButton && (
          <button
            className="flex-1 sm:flex-none px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            onClick={handleCreateFolderClick}
          >
            <FolderPlus className="w-5 h-5" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        )}
        {showUploadButton && (
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            onClick={handleUploadClick}
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

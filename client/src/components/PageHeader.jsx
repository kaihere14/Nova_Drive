import React from "react";
import { Upload } from "lucide-react";

const PageHeader = ({ activeView, setShowUploadModal }) => {
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

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {getViewTitle()}
        </h1>
        <p className="mt-2 text-zinc-500 font-mono text-xs sm:text-sm">
          {getViewDescription()}
        </p>
      </div>
      <button
        className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
        onClick={() => setShowUploadModal(true)}
      >
        <Upload className="w-5 h-5" />
        <span className="hidden sm:inline">Upload New File</span>
        <span className="sm:hidden">Upload File</span>
      </button>
    </div>
  );
};

export default PageHeader;

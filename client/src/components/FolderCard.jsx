import React, { useState, useRef, useEffect } from "react";
import { FolderOpen, MoreVertical, Trash2, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FolderCard = ({ folder, onDelete, onRename }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="group relative bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-zinc-800/40 dark:to-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-transparent dark:hover:from-zinc-800/60 dark:hover:to-zinc-900/60 border border-zinc-200 dark:border-zinc-700/30 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-xl overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent group-hover:from-blue-500/5 transition-all duration-300 pointer-events-none" />

      {/* Three-dot Menu */}
      <div className="absolute top-3 right-3 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-xl py-1 overflow-hidden">
            <button
              className="w-full text-left px-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onRename(folder);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Rename
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(folder);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Folder Content */}
      <div
        onClick={() => navigate(`/folder/${folder._id}`)}
        className="cursor-pointer p-5 relative"
      >
        {/* Folder Icon Container */}
        <div className="relative mb-4 h-20 flex items-center justify-center">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-600/5 to-transparent dark:from-blue-500/20 dark:via-blue-600/10 rounded-xl blur-xl group-hover:from-blue-500/15 group-hover:via-blue-600/10 dark:group-hover:from-blue-500/30 dark:group-hover:via-blue-600/20 transition-all duration-300" />

          {/* Icon container */}
          <div className="relative bg-blue-50 dark:bg-transparent dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-blue-600/5 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 group-hover:border-blue-200 dark:group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-300">
            <FolderOpen
              className="w-9 h-9 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300"
              strokeWidth={1.5}
            />

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </div>
        </div>

        {/* Folder Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
            {folder.name}
          </h4>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
              {new Date(folder.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-300" />
      </div>
    </div>
  );
};

export default FolderCard;

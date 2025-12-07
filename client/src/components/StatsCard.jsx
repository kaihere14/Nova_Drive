import React from "react";
import { BarChart3, HardDrive, Folder, Star } from "lucide-react";

const StatsCard = ({ files, storage, folders, favorites, formatFileSize }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
      {/* Files Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-cyan-500/30 transition-all hover:-translate-y-0.5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
            FILES
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">
            {files}
          </div>
        </div>
      </div>

      {/* Storage Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
          <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
            STORAGE
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">
            {storage}
          </div>
        </div>
      </div>

      {/* Folders Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
          <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
            FOLDERS
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">
            {folders}
          </div>
        </div>
      </div>

      {/* Favorites Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-white/20 transition-all hover:-translate-y-0.5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white to-zinc-300 flex items-center justify-center">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-zinc-400 mb-1 font-mono">
            FAVORITES
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100">
            {favorites}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
import React from "react";
import { BarChart3, HardDrive, Folder, Star } from "lucide-react";

const StatsCard = ({ files, storage, folders, favorites, formatFileSize }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Files Card */}
      <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 hover:from-zinc-800/60 hover:to-zinc-900/60 border border-zinc-700/30 hover:border-blue-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent group-hover:from-blue-500/5 transition-all duration-300 pointer-events-none" />
        <div className="relative p-5">
          <div className="relative mb-3 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent rounded-xl blur-xl group-hover:from-blue-500/30 group-hover:via-blue-600/20 transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-3 rounded-lg border border-blue-500/20 group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-300">
              <BarChart3 className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono mb-1">FILES</div>
          <div className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-200">{files}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-300" />
        </div>
      </div>

      {/* Storage Card */}
      <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 hover:from-zinc-800/60 hover:to-zinc-900/60 border border-zinc-700/30 hover:border-cyan-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/5 transition-all duration-300 pointer-events-none" />
        <div className="relative p-5">
          <div className="relative mb-3 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-cyan-600/10 to-transparent rounded-xl blur-xl group-hover:from-cyan-500/30 group-hover:via-cyan-600/20 transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-3 rounded-lg border border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:scale-110 transition-all duration-300">
              <HardDrive className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono mb-1">STORAGE</div>
          <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">{storage}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/50 transition-all duration-300" />
        </div>
      </div>

      {/* Folders Card */}
      <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 hover:from-zinc-800/60 hover:to-zinc-900/60 border border-zinc-700/30 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-transparent group-hover:from-purple-500/5 transition-all duration-300 pointer-events-none" />
        <div className="relative p-5">
          <div className="relative mb-3 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent rounded-xl blur-xl group-hover:from-purple-500/30 group-hover:via-purple-600/20 transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-3 rounded-lg border border-purple-500/20 group-hover:border-purple-500/40 group-hover:scale-110 transition-all duration-300">
              <Folder className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono mb-1">FOLDERS</div>
          <div className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-200">{folders}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-500/50 transition-all duration-300" />
        </div>
      </div>

      {/* Favorites Card */}
      <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 hover:from-zinc-800/60 hover:to-zinc-900/60 border border-zinc-700/30 hover:border-pink-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-transparent group-hover:from-pink-500/5 transition-all duration-300 pointer-events-none" />
        <div className="relative p-5">
          <div className="relative mb-3 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-pink-600/10 to-transparent rounded-xl blur-xl group-hover:from-pink-500/30 group-hover:via-pink-600/20 transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-pink-500/10 to-pink-600/5 p-3 rounded-lg border border-pink-500/20 group-hover:border-pink-500/40 group-hover:scale-110 transition-all duration-300">
              <Star className="w-6 h-6 text-pink-400 group-hover:text-pink-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono mb-1">FAVORITES</div>
          <div className="text-2xl font-bold text-white group-hover:text-pink-300 transition-colors duration-200">{favorites}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-500/0 to-transparent group-hover:via-pink-500/50 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
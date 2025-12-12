import React from "react";
import { useNavigate } from "react-router-dom";
import { Files, Clock, Star, Trash2, X, HardDrive, LogOut } from "lucide-react";

const Sidebar = ({
  activeView,
  setActiveView,
  showSidebar,
  setShowSidebar,
  storageInfo,
  formatFileSize,
  storagePercentage,
  handleLogout,
}) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 lg:sticky z-50 lg:z-10 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 w-64 h-screen bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="px-5 py-6 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 text-xl font-bold text-white"
              onClick={() => setShowSidebar(false)}
            >
              <img
                src="https://res.cloudinary.com/dw87upoot/image/upload/v1764738404/Screenshot_2025-12-03_at_10.35.02_AM_b1bbag.png"
                alt="NovaDrive logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-white">NovaDrive</span>
            </div>
            <button
              className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              onClick={() => setShowSidebar(false)}
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer  ${
              activeView === "files"
                ? "bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => {
              setActiveView("files");
              setShowSidebar(false);
            }}
          >
            <Files className="w-5 h-5" />
            <span>My Files</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer ${
              activeView === "recent"
                ? "bg-white/10 text-white font-semibold border border-white/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => {
              setActiveView("recent");
              setShowSidebar(false);
            }}
          >
            <Clock className="w-5 h-5" />
            <span>Recent Files</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer ${
              activeView === "favorites"
                ? "bg-white/10 text-white font-semibold border border-white/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => {
              setActiveView("favorites");
              setShowSidebar(false);
            }}
          >
            <Star className="w-5 h-5" />
            <span>Favorites</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer ${
              activeView === "trash"
                ? "bg-white/10 text-white font-semibold border border-white/20"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
            onClick={() => {
              setActiveView("trash");
              setShowSidebar(false);
            }}
          >
            <Trash2 className="w-5 h-5" />
            <span>Recycle Bin</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="px-5 py-5 border-t border-zinc-800 flex-shrink-0">
          <div className="text-xs">
            <div className="flex items-center gap-2 text-zinc-400 font-mono mb-3">
              <HardDrive className="w-4 h-4" />
              <span>STORAGE STATUS</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="text-zinc-500 font-mono">
              {formatFileSize(storageInfo.usedBytes)} /{" "}
              {formatFileSize(storageInfo.totalBytes)}
            </div>
            <div className="mt-3 flex items-center gap-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-mono text-xs">OPERATIONAL</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 mt-3 rounded-lg text-sm transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 hover:border-red-500/40"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-mono">LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

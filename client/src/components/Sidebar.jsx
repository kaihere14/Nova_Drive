import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Files, Clock, Star, Trash2, ChevronLeft, ChevronRight, HardDrive, LogOut, X } from "lucide-react";

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
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar wrapper — controls space in flex layout */}
      <div
        className={`hidden lg:block flex-shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out overflow-hidden ${
          showSidebar ? "w-64" : "w-0"
        }`}
      >
        <aside className="w-64 h-full bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-6 border-b flex items-center justify-between border-zinc-800 flex-shrink-0">
            <div className="flex items-center text-xl font-bold text-white">
              <img
                src="https://res.cloudinary.com/dw87upoot/image/upload/v1765959245/Logo_Feedback_Dec_17_2025_1_bha0nd.png"
                alt="NovaDrive logo"
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold text-white">NovaDrive</span>
            </div>
            <button
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              onClick={() => setShowSidebar(false)}
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {renderNavItems(activeView, setActiveView, setShowSidebar)}
          </nav>

          {/* Footer */}
          {renderFooter(storageInfo, formatFileSize, storagePercentage, handleLogout)}
        </aside>
      </div>

      {/* Desktop collapsed toggle button */}
      {!showSidebar && (
        <button
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 items-center justify-center w-5 h-16 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-r-md cursor-pointer transition-colors z-20"
          onClick={() => setShowSidebar(true)}
        >
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      )}

      {/* Mobile sidebar — slides in from left */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 lg:hidden w-64 h-screen bg-zinc-900/95 backdrop-blur-md border-r border-zinc-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-6 border-b flex items-center justify-between border-zinc-800 flex-shrink-0">
              <div className="flex items-center text-xl font-bold text-white">
                <img
                  src="https://res.cloudinary.com/dw87upoot/image/upload/v1765959245/Logo_Feedback_Dec_17_2025_1_bha0nd.png"
                  alt="NovaDrive logo"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-xl font-bold text-white">NovaDrive</span>
              </div>
              <button
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                onClick={() => setShowSidebar(false)}
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {renderNavItems(activeView, setActiveView, setShowSidebar)}
            </nav>

            {/* Footer */}
            {renderFooter(storageInfo, formatFileSize, storagePercentage, handleLogout)}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

function renderNavItems(activeView, setActiveView, setShowSidebar) {
  const items = [
    { key: "files", icon: Files, label: "My Files", accent: true },
    { key: "recent", icon: Clock, label: "Recent Files" },
    { key: "favorites", icon: Star, label: "Favorites" },
    { key: "trash", icon: Trash2, label: "Recycle Bin" },
  ];

  return items.map(({ key, icon: Icon, label, accent }) => (
    <button
      key={key}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer ${
        activeView === key
          ? accent
            ? "bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30"
            : "bg-white/10 text-white font-semibold border border-white/20"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
      }`}
      onClick={() => {
        setActiveView(key);
        setShowSidebar(false);
      }}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  ));
}

function renderFooter(storageInfo, formatFileSize, storagePercentage, handleLogout) {
  return (
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
  );
}

export default Sidebar;

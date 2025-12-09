import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings, Menu } from "lucide-react";

const Header = ({ 
  searchQuery, 
  setSearchQuery, 
  setShowSidebar, 
  user 
}) => {
  const navigate = useNavigate();

  return (
    <header className="px-4 sm:px-6 lg:px-8 py-4 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800">
      {/* Mobile Layout - Single Row */}
      <div className="flex lg:hidden items-center gap-3 w-full">
        <button
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2.5 rounded-lg flex-1 border border-zinc-700">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 font-mono"
          />
        </div>
        <div
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex-shrink-0"
          onClick={() => navigate("/profile")}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
            {user?.username
              ? user.username.substring(0, 2).toUpperCase()
              : "U"}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex justify-between items-center">
        <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2.5 rounded-lg w-96 border border-zinc-700">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 font-mono"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-zinc-400" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-zinc-400" />
          </button>
          <div
            className="flex items-center gap-2.5 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors"
            onClick={() => navigate("/profile")}
          >
            <span className="text-sm font-medium text-zinc-200">
              {user?.username || "User"}
            </span>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
              {user?.username
                ? user.username.substring(0, 2).toUpperCase()
                : "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

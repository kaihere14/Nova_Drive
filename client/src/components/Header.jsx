import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings, Menu, Sparkles, Zap, X } from "lucide-react";
import axios from "axios";
import BASE_URL from "../config";

export const useAiSearch = () => {
  const [aiSearch, setAiSearch] = useState(false);
  return { aiSearch, setAiSearch };
};

const Header = ({
  searchQuery,
  setSearchQuery,
  setShowSidebar,
  user,
  aiSearch,
  setAiSearch,
}) => {
  const navigate = useNavigate();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const debounceTimerRef = useRef(null);

  // Categorize match score
  const getMatchCategory = (score) => {
    if (score >= 80)
      return {
        label: "Strong matches",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
      };
    if (score >= 60)
      return {
        label: "Possible matches",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
      };
    return {
      label: "No strong matches",
      color: "text-zinc-400",
      bgColor: "bg-zinc-800/50",
      borderColor: "border-zinc-700",
    };
  };

  // Group results by category
  const groupResultsByCategory = (results) => {
    const strongMatches = results.filter((r) => r.relevance >= 80);
    const possibleMatches = results.filter(
      (r) => r.relevance >= 60 && r.relevance < 80
    );
    const weakMatches = results.filter((r) => r.relevance < 60);

    const groups = [];
    if (strongMatches.length > 0) {
      groups.push({ category: getMatchCategory(80), results: strongMatches });
    }
    if (possibleMatches.length > 0) {
      groups.push({ category: getMatchCategory(60), results: possibleMatches });
    }
    if (weakMatches.length > 0) {
      groups.push({ category: getMatchCategory(0), results: weakMatches });
    }

    return groups;
  };

  // AI search function - calls real API
  const handleAiSearch = async (query) => {
    if (!query.trim()) {
      setAiResults([]);
      setShowAiResults(false);
      return;
    }

    setAiLoading(true);
    setShowAiResults(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${BASE_URL}/api/files/ai-search`,
        { query },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Map API response to UI format
      const mappedResults = response.data.matches.map((match, index) => ({
        id: index + 1,
        name: match.fileName,
        path: match.filePath,
        relevance: match.matchScore,
      }));

      setAiResults(mappedResults);
    } catch (error) {
      console.error("AI Search Error:", error);
      setAiResults([]);
      // Optionally show error message to user
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only trigger AI search if AI search is enabled
    if (aiSearch) {
      // Set new timer - wait 2 seconds after user stops typing
      debounceTimerRef.current = setTimeout(() => {
        if (value.trim()) {
          handleAiSearch(value);
        } else {
          setAiResults([]);
          setShowAiResults(false);
        }
      }, 1000);
    } else {
      setAiResults([]);
      setShowAiResults(false);
    }
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  return (
    <>
      <header className="px-4 sm:px-6 lg:px-8 py-4 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800">
        {/* Mobile Layout - Single Row */}
        <div className="flex lg:hidden items-center gap-3 w-full  ">
          <button
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </button>

          {/* Mobile: Gradient border outer wrapper */}
          <div className="flex-1 min-w-0">
            <div
              className={`relative p-[1px] rounded-full transition-all duration-300 ease-in-out ${
                aiSearch
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.12)]"
                  : "bg-zinc-700/20"
              }`}
            >
              <div className="relative flex items-center gap-2 bg-zinc-900 rounded-full px-3 py-2 w-full min-w-0 overflow-hidden">
                <Search
                  className={`w-4 h-4 transition-colors duration-300 ${
                    aiSearch ? "text-purple-400" : "text-zinc-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder={aiSearch ? "Ask anything..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-zinc-100 placeholder-zinc-500 font-mono"
                />
                <button
                  onClick={() => setAiSearch(!aiSearch)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    aiSearch
                      ? "bg-zinc-800 text-transparent  bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 border border-zinc-700/30"
                      : "text-zinc-400 hover:text-zinc-200 border border-zinc-700/40 hover:bg-zinc-800"
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      aiSearch ? "text-pink-400" : "text-zinc-400"
                    }`}
                  />
                  <span>AI</span>
                </button>
              </div>
            </div>
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
          <div
            className={`flex items-center gap-2 bg-zinc-800/50 rounded-lg w-96 transition-all duration-200 ${
              aiSearch
                ? "p-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                : "border border-zinc-700 px-4 py-2.5"
            }`}
          >
            {aiSearch ? (
              <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-4 py-2.5 w-full">
                <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 font-mono"
                />
                <button
                  onClick={() => setAiSearch(!aiSearch)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 border border-purple-500/50 text-purple-400 bg-purple-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Mode</span>
                </button>
              </div>
            ) : (
              <>
                <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 font-mono"
                />
                <button
                  onClick={() => setAiSearch(!aiSearch)}
                  className="flex items-center  gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 border border-zinc-700 text-zinc-400 bg-transparent hover:border-zinc-600 hover:text-zinc-300"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Mode</span>
                </button>
              </>
            )}
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

      {/* AI Search Results Dropdown */}
      {aiSearch && showAiResults && (
        <div className="relative z-50 px-4 sm:px-6 lg:px-8 py-3 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
          {aiLoading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <div className="animate-spin">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Searching with AI...</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-zinc-800 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : aiResults.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-400">AI Search Results</p>
                <button
                  onClick={() => {
                    setShowAiResults(false);
                    setAiResults([]);
                  }}
                  className="p-1 hover:bg-zinc-800 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden">
                {groupResultsByCategory(aiResults).map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <div
                        className={`w-2 h-2 rounded-full ${group.category.bgColor} ${group.category.borderColor} border`}
                      ></div>
                      <p
                        className={`text-xs font-medium ${group.category.color}`}
                      >
                        {group.category.label}
                      </p>
                      <span className="text-xs text-zinc-600">
                        ({group.results.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {group.results.map((result) => (
                        <div
                          key={result.id}
                          className={`p-3 ${group.category.bgColor} border ${group.category.borderColor} rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer min-w-0`}
                          onClick={() => {
                            // Close dropdown and request in-app preview for this file
                            setShowAiResults(false);
                            setAiResults([]);
                            const eventDetail = {
                              path: result.path,
                              name: result.name,
                            };
                            window.dispatchEvent(
                              new CustomEvent("nova_open_preview", {
                                detail: eventDetail,
                              })
                            );
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate">
                                {result.name}
                              </p>
                              <p className="text-xs text-zinc-500 truncate">
                                {result.path}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right">
                                <p
                                  className={`text-xs font-medium ${group.category.color}`}
                                >
                                  {result.relevance}%
                                </p>
                                <p className="text-xs text-zinc-500">match</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No results found</p>
          )}
        </div>
      )}
    </>
  );
};

export default Header;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FolderPlus,
  Folder,
  ChevronRight,
  Fingerprint,
  Box,
  CheckCircle2,
  CloudUpload,
  Cpu,
  Hash,
} from "lucide-react";
import Navbar from "../components/Navbar";
import usePageMeta from "../utils/usePageMeta";

const FolderSuggestionVisual = () => {
  const [selected, setSelected] = useState("Music");
  const suggestions = [
    { name: "Music", score: 0.98 },
    { name: "Audio", score: 0.85 },
    { name: "Archive", score: 0.42 },
  ];

  return (
    <div className="w-full  bg-[#0c0c0e] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Header: More Functional, Less "Gimmicky" */}
      <div className="p-4 border-b border-[#27272a] bg-[#111114]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
            Classification Engine
          </span>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">v1.0.4</span>
      </div>

      <div className="p-4 space-y-4">
        {/* File Info Card */}
        <div className="flex items-center gap-3 p-3 bg-[#16161a] border border-[#27272a] rounded-lg">
          <div className="p-2 bg-indigo-500/10 rounded-md">
            <Fingerprint className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-200 font-medium truncate w-40">
              summer_vibes_mix.mp3
            </span>
            <span className="text-[10px] text-zinc-500">
              MPEG Layer-3 Audio • 8.4MB
            </span>
          </div>
        </div>

        {/* Suggestion List */}
        <div className="space-y-1.5">
          {suggestions.map((folder) => {
            const isSelected = selected === folder.name;
            return (
              <button
                key={folder.name}
                onClick={() => setSelected(folder.name)}
                className="relative w-full group flex items-center justify-between p-3 rounded-lg transition-colors overflow-hidden"
              >
                {/* Selection Highlight (Framer Motion) */}
                {isSelected && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <Folder
                    className={`w-4 h-4 ${
                      isSelected ? "text-indigo-400" : "text-zinc-500"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isSelected ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {folder.name}
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                  {/* Confidence Bar */}
                  <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${folder.score * 100}%` }}
                    />
                  </div>
                  <ChevronRight
                    className={`w-3 h-3 ${
                      isSelected ? "text-indigo-400" : "text-zinc-700"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-[#111114]/50 border-t border-[#27272a] flex justify-between items-center">
        <button className="text-[11px] text-zinc-400 hover:text-white transition-colors">
          Ignore Suggestion
        </button>
        <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-md transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          Confirm Path
        </button>
      </div>
    </div>
  );
};

const ChunkUploadVisual = () => {
  // Simulating a dynamic upload state for better realism
  const [progress, setProgress] = useState(62);
  const chunks = [
    { id: 1, status: "verified", size: "5.2MB", hash: "8f2a...1b" },
    { id: 2, status: "verified", size: "5.2MB", hash: "4c91...9d" },
    { id: 3, status: "active", size: "5.2MB", hash: "7e32...f0" },
    { id: 4, status: "pending", size: "4.4MB", hash: "pending" },
  ];

  return (
    <div className="w-full  bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl font-mono">
      {/* Header: System Monitor Style */}
      <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
            Multipart Uploader v2
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-indigo-400 animate-pulse font-bold">
            LHR-SEC-01
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* File Stats Header */}
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-white text-xs font-bold truncate w-48">
              project_alpha_v2.pdf
            </h3>
            <p className="text-[10px] text-zinc-500">
              20.0 MB • Application/PDF
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white tracking-tighter">
              {progress}%
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-400"
          />
        </div>

        {/* Chunk Grid */}
        <div className="grid grid-cols-1 gap-2">
          {chunks.map((chunk, i) => (
            <div
              key={chunk.id}
              className={`group flex items-center justify-between p-2 rounded border transition-all duration-300 ${
                chunk.status === "active"
                  ? "bg-indigo-500/5 border-indigo-500/30"
                  : "bg-zinc-900/40 border-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {chunk.status === "verified" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : chunk.status === "active" ? (
                    <div className="relative">
                      <CloudUpload className="w-4 h-4 text-indigo-400" />
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -10 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 flex justify-center"
                      >
                        <div className="w-0.5 h-2 bg-indigo-400 rounded-full" />
                      </motion.div>
                    </div>
                  ) : (
                    <Box className="w-4 h-4 text-zinc-700" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-[11px] ${
                      chunk.status === "pending"
                        ? "text-zinc-600"
                        : "text-zinc-300"
                    }`}
                  >
                    PART_0{chunk.id}
                  </span>
                  <div className="flex items-center gap-1 opacity-50">
                    <Hash className="w-2.5 h-2.5" />
                    <span className="text-[9px] uppercase">{chunk.hash}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-bold ${
                    chunk.status === "verified"
                      ? "text-emerald-500/70"
                      : chunk.status === "active"
                      ? "text-indigo-400"
                      : "text-zinc-700"
                  }`}
                >
                  {chunk.status === "verified"
                    ? "HASH_OK"
                    : chunk.status === "active"
                    ? "WRITING..."
                    : "WAITING"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Log */}
      <div className="px-4 py-2 bg-black border-t border-zinc-800 flex justify-between items-center text-[9px]">
        <span className="text-zinc-600">
          Speed: <span className="text-zinc-400">2.4 MB/s</span>
        </span>
        <span className="text-zinc-600">
          ETA: <span className="text-zinc-400">4s</span>
        </span>
      </div>
    </div>
  );
};

const HomePage = () => {
  usePageMeta(
    "NovaDrive — Smart Cloud Storage",
    "NovaDrive is secure, fast cloud storage with AI-powered auto-tagging, search, and smart organization."
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: "0.3",
        }}
      ></div>

      <Navbar />

      <main className="relative z-10 pt-20 pb-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className=" sm:mb-20">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              v1.0 Live
            </span>

            <h1 className="mt-6 text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Cloud storage that <br />
              <span className="text-zinc-500">organizes itself.</span>
            </h1>

            <p className="mt-6 text-xl text-zinc-400 leading-relaxed max-w-lg">
              NovaDrive is secure, fast storage with a brain. You just upload
              the file, and our AI handles the naming, tagging, and sorting for
              you.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-md font-medium transition-all shadow-lg shadow-blue-500/20">
                  Start Now
                </button>
              </Link>
              <Link to="/architecture">
                <button className="px-8 py-3 rounded-md font-medium text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all">
                  See Architecture
                </button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>ONLINE</span>
              </div>
              <span>FAST UPLOAD</span>
              <span>SECURE</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-10 blur-xl"></div>
            <div className="relative grid grid-cols-1 gap-6">
              <ChunkUploadVisual />
              <FolderSuggestionVisual />
            </div>

            <div className="absolute  -bottom-10 -left-6 bg-black border border-zinc-800 p-4 rounded-lg shadow-xl w-64">
              <div className="text-xs text-zinc-500 uppercase mb-2 font-mono tracking-wider">
                AI Auto-Tagging
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                  #Financial
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                  #Q3_Summary
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                  #Priority
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-24 border-y border-zinc-800 bg-zinc-900/20">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800">
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-white font-mono">
                10 GB
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                Free Storage
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-white font-mono">
                Fast
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                Upload Speed
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-white font-mono">
                Active
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                Intelligence
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-white font-mono">
                Global
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                Storage
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Why use NovaDrive?
            </h2>
            <p className="text-zinc-400 text-lg">
              Everything you expect from a modern drive, plus the intelligence
              you've been missing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                <Sparkles className="w-32 h-32 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-mono text-blue-400 font-semibold tracking-wider">
                  NEW FEATURE
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Folder Suggestions
              </h3>
              <p className="text-zinc-400 max-w-sm mb-4">
                AI analyzes your file and instantly suggests where to store it.
                If folders exist, it finds them. If not, it creates smart
                suggestions like "Music", "Documents", or "Photos" — all with
                one click.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-zinc-800/40 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-full font-mono">
                  Auto-detect
                </span>
                <span className="bg-zinc-800/40 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-full font-mono">
                  One-click organize
                </span>
                <span className="bg-zinc-800/40 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-full font-mono">
                  AI-powered
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg
                  className="w-32 h-32 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Auto-Tagging
              </h3>
              <p className="text-zinc-400 max-w-sm">
                Stop organizing manually. Our AI scans your files and generates
                relevant tags like #Finance or #Vacation automatically.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors">
              <div className="text-blue-500 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Instant Summaries
              </h3>
              <p className="text-zinc-400 text-sm">
                Don't have time to read? We generate a 1-2 sentence summary for
                every document.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors">
              <div className="text-blue-500 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Deep Search
              </h3>
              <p className="text-zinc-400 text-sm">
                Type "invoice from October" and our AI will find the document
                based on its actual content.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors">
              <div className="text-blue-500 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 12H9m6-4H9m6 8H9M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Quick Share
              </h3>
              <p className="text-zinc-400 text-sm">
                Create secure, time-limited share links to send files instantly.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              How it Works
            </h2>
            <p className="text-zinc-400 text-lg">
              A quick look at the tech that keeps your files safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-zinc-200 font-semibold mb-2">
                Easy Interface
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                A simple dashboard to upload and find files instantly.
              </p>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                FAST
              </span>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-zinc-200 font-semibold mb-2">
                Smart Gateway
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                A security guard that checks every request.
              </p>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                SECURE
              </span>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-zinc-200 font-semibold mb-2">
                AI Processing
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                We organize files in the background so you don't have to.
              </p>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                SMART
              </span>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-zinc-200 font-semibold mb-2">
                Global Storage
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                Your files are stored in a distributed cloud that never sleeps.
              </p>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                RELIABLE
              </span>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Simple Pricing{" "}
              <span className="text-sm font-normal text-zinc-500 ml-2 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                (Upcoming)
              </span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Fair pricing for everyone. Start for free, upgrade when you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl flex flex-col hover:border-zinc-700 transition-colors">
              <h3 className="text-zinc-400 font-mono text-sm uppercase tracking-wider mb-2">
                Starter
              </h3>
              <div className="text-4xl font-bold text-white mb-6">
                ₹0<span className="text-lg text-zinc-500 font-normal">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-zinc-300">
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Storage</span> <span className="text-white">10 GB</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Bandwidth</span>{" "}
                  <span className="text-white">Standard</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>AI Analysis</span>{" "}
                  <span className="text-white">Basic</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
                Current Plan
              </button>
            </div>

            <div className="bg-zinc-900/80 border border-blue-500/30 p-8 rounded-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              <h3 className="text-blue-400 font-mono text-sm uppercase tracking-wider mb-2">
                Pro
              </h3>
              <div className="text-4xl font-bold text-white mb-6">
                ₹499
                <span className="text-lg text-zinc-500 font-normal">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-zinc-300">
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Storage</span>{" "}
                  <span className="text-white">300 GB</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Bandwidth</span>{" "}
                  <span className="text-white">Unlimited</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>AI Analysis</span>{" "}
                  <span className="text-white">Advanced</span>
                </li>
              </ul>
              <button
                disabled
                className="w-full py-3 rounded border border-blue-500/50 text-blue-400 font-medium cursor-not-allowed opacity-75"
              >
                Coming Soon
              </button>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl flex flex-col hover:border-zinc-700 transition-colors">
              <h3 className="text-zinc-400 font-mono text-sm uppercase tracking-wider mb-2">
                Team
              </h3>
              <div className="text-4xl font-bold text-white mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-zinc-300">
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Storage</span>{" "}
                  <span className="text-white">Unlimited</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Support</span>{" "}
                  <span className="text-white">Priority</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>API Access</span>{" "}
                  <span className="text-white">Full</span>
                </li>
              </ul>
              <button
                disabled
                className="w-full py-3 rounded border border-zinc-700 text-zinc-500 font-medium cursor-not-allowed"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-800 pt-12 pb-12 flex justify-between items-center text-sm text-zinc-500">
          <div className="font-bold text-zinc-300">NovaDrive &copy; 2025</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <a href="https://github.com" className="hover:text-white">
              GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;

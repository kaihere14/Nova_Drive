import React, { useState } from "react";
import {
  Database,
  Cloud,
  Lock,
  Upload,
  Download,
  Server,
  Shield,
  Zap,
  HardDrive,
  ArrowRight,
  Code,
  FileCode,
  GitBranch,
  Boxes,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";

const ArchitecturePage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <Navbar />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-24">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white">
            System Architecture
          </h1>
          <p className="text-zinc-400 text-lg">
            Technical overview of NovaDrive's infrastructure
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: Boxes,
            },
            {
              id: "flow",
              label: "Data Flow",
              icon: GitBranch,
            },
            {
              id: "stack",
              label: "Tech Stack",
              icon: Code,
            },
            {
              id: "security",
              label: "Security",
              icon: Shield,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Architecture Diagram */}
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  System Components
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Client Layer */}
                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-zinc-600 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                        <Code className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          Client
                        </h3>
                        <p className="text-xs text-zinc-500">React Frontend</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        React + Vite
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        TailwindCSS
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        React Router
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Axios HTTP
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Context API
                      </li>
                    </ul>
                  </div>

                  {/* Server Layer */}
                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-zinc-600 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                        <Server className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          Server
                        </h3>
                        <p className="text-xs text-zinc-500">Node.js Backend</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Express.js
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        TypeScript
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        JWT Auth
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Multer
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Bcrypt
                      </li>
                    </ul>
                  </div>

                  {/* Storage Layer */}
                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-zinc-600 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          Storage
                        </h3>
                        <p className="text-xs text-zinc-500">Data Layer</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        MongoDB
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Mongoose ODM
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Cloudflare R2
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        AWS S3 SDK
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Presigned URLs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">
                      Chunked Upload
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Files are split into 5MB chunks and uploaded in parallel
                    batches of 4, dramatically improving upload speeds for large
                    files.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      5MB Chunks
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      4x Parallel
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Resumable
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">JWT Authentication</h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Secure authentication using JWT tokens with automatic
                    refresh mechanism. Access tokens expire in 15 minutes,
                    refresh tokens in 7 days.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Bcrypt
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Auto Refresh
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Secure
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Cloud className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">
                      R2 Storage
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Cloudflare R2 provides S3-compatible object storage with
                    zero egress fees. Files are uploaded directly using
                    presigned URLs.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      S3 Compatible
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Zero Egress
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Multipart
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">
                      Deduplication
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    SHA-256 hash of the first 4MB is computed to detect
                    duplicate files, preventing redundant uploads and saving
                    storage space.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      SHA-256
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Smart
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-full text-xs">
                      Efficient
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Flow Tab */}
          {activeTab === "flow" && (
            <div className="space-y-8">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Upload Flow
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      step: "01",
                      title: "File Selection",
                      desc: "User selects file → SHA-256 hash computed (first 4MB) → Check for duplicates",
                      icon: FileCode,
                    },
                    {
                      step: "02",
                      title: "Upload Initiation",
                      desc: "POST /upload-initiate → Server creates session → R2 multipart upload started → Returns uploadId + key",
                      icon: Upload,
                    },
                    {
                      step: "03",
                      title: "Chunk Processing",
                      desc: "File split into 5MB chunks → Batches of 4 chunks processed in parallel → Get presigned URLs → Upload to R2",
                      icon: Boxes,
                    },
                    {
                      step: "04",
                      title: "Completion",
                      desc: "All ETags collected → POST /upload-complete → R2 multipart complete → Metadata saved to MongoDB",
                      icon: Cloud,
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="p-6 bg-zinc-800 rounded-xl border border-zinc-700"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white">
                          {item.icon && <item.icon className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Step {item.step}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tech Stack Tab */}
          {activeTab === "stack" && (
            <div className="space-y-8">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Tech Stack
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frontend Stack */}
                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Frontend
                    </h3>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        React
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Vite
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        TailwindCSS
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        React Router
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Axios
                      </li>
                    </ul>
                  </div>

                  {/* Backend Stack */}
                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Backend
                    </h3>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Node.js
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Express.js
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        MongoDB
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Mongoose
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        JWT
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Security Features
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Authentication
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                      Secure login and registration with email verification and
                      password hashing.
                    </p>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        JWT for secure token-based authentication.
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Bcrypt for password hashing.
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Email verification links with unique tokens.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Data Security
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                      Protection against data breaches and unauthorized access.
                    </p>
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Environment variables for sensitive config.
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Rate limiting to prevent abuse.
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        CORS configured to allow only trusted domains.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArchitecturePage;
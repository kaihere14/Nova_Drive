import React, { useState, useEffect } from "react";
import { Link, Links } from "react-router-dom";

// --- Shared Components ---

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
    {children}
  </span>
);

const SectionHeading = ({ title, subtitle }) => (
  <div className="mb-12">
    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
      {title}
    </h2>
    <p className="text-zinc-400 max-w-2xl text-lg">{subtitle}</p>
  </div>
);

// --- Technical Visualization Components (Replacing Generic Illustrations) ---

const ChunkUploadVisual = () => {
  // Simulating a live upload process
  const [chunks, setChunks] = useState([
    { id: 1, status: "complete", size: "2MB" },
    { id: 2, status: "complete", size: "2MB" },
    { id: 3, status: "uploading", size: "2MB" },
    { id: 4, status: "pending", size: "2MB" },
  ]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 font-mono text-xs shadow-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
        <span className="text-zinc-400">backup_iso_v4.tar.gz</span>
        <span className="text-blue-400">Active</span>
      </div>
      <div className="space-y-2">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  chunk.status === "complete"
                    ? "bg-green-500"
                    : chunk.status === "uploading"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-zinc-700"
                }`}
              ></div>
              <span className="text-zinc-300">Chunk_0{chunk.id}</span>
            </div>
            <span className="text-zinc-500">
              {chunk.size} //{" "}
              {chunk.status === "complete"
                ? "200 OK"
                : chunk.status === "uploading"
                ? "UPLOADING..."
                : "WAITING"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-zinc-500">
        <span>Total: 8.4GB</span>
        <span>Est: 45s</span>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const HomePage = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* --- Subtle Grid Background --- */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: "0.3",
        }}
      ></div>

      {/* --- Navbar: Industrial & Sticky --- */}
      <nav className="fixed top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dw87upoot/image/upload/v1764738404/Screenshot_2025-12-03_at_10.35.02_AM_b1bbag.png"
              alt="NovaDrive logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-white tracking-tight">
              NovaDrive
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="#features"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Architecture
            </Link>
            <Link
              to="#pricing"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="#docs"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              API
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* --- Hero Section: Asymmetrical & Technical --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <Badge>v2.0 Now Available</Badge>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Storage infrastructure <br />
              <span className="text-zinc-500">for the AI era.</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400 leading-relaxed max-w-lg">
              NovaDrive isn't just a folder. It's an intelligent object store
              with auto-tagging, chunked uploads, and API-first retrieval.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md font-medium transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]">
                Deploy Personal Cloud
              </button>
              <button className="px-6 py-3 rounded-md font-medium text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all">
                Read Documentation
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6 text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>SYSTEM OPERATIONAL</span>
              </div>
              <div>LATENCY: 12ms</div>
              <div>ENCRYPTION: AES-256</div>
            </div>
          </div>

          {/* Technical Visual Right Side */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-transparent opacity-20 blur-xl"></div>
            <ChunkUploadVisual />
            {/* Floating 'Tagging' Card */}
            <div className="absolute -bottom-8 -left-8 bg-black border border-zinc-800 p-4 rounded-lg shadow-xl w-64">
              <div className="text-xs text-zinc-500 uppercase mb-2 font-mono tracking-wider">
                AI Analysis Output
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                  #Finance
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                  #2025_Q1
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                  #Confidential
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Features: Bento Grid Layout --- */}
        <section id="features" className="mb-32">
          <SectionHeading
            title="Engineered for Performance"
            subtitle="We stripped away the bloat. What remains is a high-velocity storage engine designed for massive files and instant recall."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
            {/* Card 1: Large Span */}
            <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg
                  className="w-32 h-32 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Chunked Upload Protocol
              </h3>
              <p className="text-zinc-400 max-w-sm">
                Files are split into 4MB shards, hashed, and uploaded in
                parallel. Network failure? We resume exactly where you left off.
                No corrupted files, ever.
              </p>
            </div>

            {/* Card 2 */}
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                50ms Retrieval
              </h3>
              <p className="text-zinc-400 text-sm">
                Edge-cached metadata means your file structure loads instantly,
                before the download even starts.
              </p>
            </div>

            {/* Card 3 */}
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Auto-Organize
              </h3>
              <p className="text-zinc-400 text-sm">
                "Where did I put that invoice?" The AI knows. It scans content,
                dates, and context to sort files automatically.
              </p>
            </div>

            {/* Card 4: Large Span */}
            <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-zinc-600 transition-colors flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Zero-Knowledge Encryption
                </h3>
                <p className="text-zinc-400 max-w-md">
                  Your keys, your data. We encrypt files client-side before they
                  ever touch our servers. Not even we can see your data.
                </p>
              </div>
              <div className="mt-6 font-mono text-xs text-zinc-500 bg-black/50 p-3 rounded border border-zinc-800">
                AES-GCM-256 | RSA-4096 | TLS 1.3
              </div>
            </div>
          </div>
        </section>

        {/* --- How It Works: The "Pipeline" --- */}
        <section className="mb-32">
          <SectionHeading
            title="The Pipeline"
            subtitle="Data flow logic from your machine to the core."
          />

          <div className="relative border-l border-zinc-800 ml-4 md:ml-8 space-y-12">
            {[
              {
                step: "01",
                title: "Ingestion",
                desc: "Drag & drop. Client-side hashing begins immediately.",
              },
              {
                step: "02",
                title: "Intelligence",
                desc: "Local AI model scans header bytes for classification tags.",
              },
              {
                step: "03",
                title: "Distribution",
                desc: "Shards are distributed across 3 availability zones.",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-12">
                <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-zinc-950 border-2 border-blue-500"></div>
                <h3 className="text-lg font-mono font-bold text-white mb-1">
                  <span className="text-blue-500 mr-2">{item.step}</span>
                  {item.title}
                </h3>
                <p className="text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Pricing: Clean Tables --- */}
        <section id="pricing" className="mb-20">
          <SectionHeading
            title="Transparent Resource Allocation"
            subtitle="Scale as you grow. No hidden bandwidth fees."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
            {[
              {
                name: "Developer",
                price: "$0",
                storage: "10 GB",
                band: "Unlimited",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$12",
                storage: "2 TB",
                band: "Unlimited",
                highlight: true,
              },
              {
                name: "Organization",
                price: "$49",
                storage: "20 TB",
                band: "Priority",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 bg-zinc-950 flex flex-col h-full ${
                  plan.highlight ? "bg-zinc-900/80" : ""
                }`}
              >
                <h3 className="font-mono text-sm text-zinc-400 uppercase tracking-wider mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-white mb-6">
                  {plan.price}
                  <span className="text-lg text-zinc-500 font-normal">/mo</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                    <span>Storage</span>
                    <span className="font-mono text-white">{plan.storage}</span>
                  </li>
                  <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                    <span>Bandwidth</span>
                    <span className="font-mono text-white">{plan.band}</span>
                  </li>
                  <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                    <span>AI Analysis</span>
                    <span className="font-mono text-white">
                      {i === 0 ? "Basic" : "Advanced"}
                    </span>
                  </li>
                  <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                    <span>API Access</span>
                    <span className="font-mono text-white">
                      {i === 2 ? "Full" : "Read-Only"}
                    </span>
                  </li>
                </ul>

                <button
                  className={`w-full py-2 rounded text-sm font-medium border transition-colors ${
                    plan.highlight
                      ? "bg-white text-black border-white hover:bg-zinc-200"
                      : "text-white border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Footer: Minimal --- */}
        <footer className="border-t border-zinc-800 pt-12 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-zinc-300">NovaDrive</span> &copy;
            2025
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Status
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;

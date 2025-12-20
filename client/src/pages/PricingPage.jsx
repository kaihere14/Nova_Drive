import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import usePageMeta from "../utils/usePageMeta";

const PricingPage = () => {
  usePageMeta(
    "Pricing — NovaDrive",
    "Simple and transparent pricing for personal and business storage."
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

      <main className="relative z-10 pt-24 sm:pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Start for free, upgrade for power. No hidden bandwidth fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col h-full hover:border-zinc-700 transition-all">
            <h3 className="font-mono text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Starter
            </h3>
            <div className="text-4xl font-bold text-white mb-6">
              ₹0
              <span className="text-lg text-zinc-500 font-normal">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>Storage</span>
                <span className="font-mono text-white">10 GB</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>Max File Size</span>
                <span className="font-mono text-white">2 GB</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>AI Tagging</span>
                <span className="font-mono text-white">Basic</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>Support</span>
                <span className="font-mono text-white">Community</span>
              </li>
            </ul>

            <button className="w-full py-3 rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors">
              Current Plan
            </button>
          </div>

          <div className="p-8 bg-zinc-900/80 border border-blue-500/30 rounded-2xl flex flex-col h-full relative overflow-hidden shadow-2xl shadow-blue-900/10">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              MOST POPULAR
            </div>
            <h3 className="font-mono text-sm text-blue-400 uppercase tracking-wider mb-2">
              Pro
            </h3>
            <div className="text-4xl font-bold text-white mb-6">
              ₹499
              <span className="text-lg text-zinc-500 font-normal">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-800 pb-2">
                <span>Storage</span>
                <span className="font-mono text-white">300 GB</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-800 pb-2">
                <span>Max File Size</span>
                <span className="font-mono text-white">10 GB</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-800 pb-2">
                <span>AI Intelligence</span>
                <span className="font-mono text-white">Advanced</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-800 pb-2">
                <span>Support</span>
                <span className="font-mono text-white">Priority Email</span>
              </li>
            </ul>

            <button className="w-full py-3 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
              Upgrade to Pro
            </button>
          </div>

          <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col h-full hover:border-zinc-700 transition-all">
            <h3 className="font-mono text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Business
            </h3>
            <div className="text-4xl font-bold text-white mb-6">Custom</div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>Storage</span>
                <span className="font-mono text-white">Unlimited</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>Team Mgmt</span>
                <span className="font-mono text-white">Included</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>API Access</span>
                <span className="font-mono text-white">Full</span>
              </li>
              <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                <span>Support</span>
                <span className="font-mono text-white">24/7 Dedicated</span>
              </li>
            </ul>

            <button className="w-full py-3 rounded-lg text-sm font-semibold border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">
            Compare Plans
          </h2>

          <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 bg-zinc-900/50">
                    <th className="p-4 font-medium">Feature</th>
                    <th className="p-4 font-medium text-center">Starter</th>
                    <th className="p-4 font-medium text-center text-blue-400">
                      Pro
                    </th>
                    <th className="p-4 font-medium text-center">Business</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-zinc-800">
                  {[
                    {
                      feature: "Storage Capacity",
                      starter: "10 GB",
                      pro: "300 GB",
                      biz: "Custom",
                    },
                    {
                      feature: "Single File Limit",
                      starter: "2 GB",
                      pro: "10 GB",
                      biz: "Unlimited",
                    },
                    {
                      feature: "Auto-Tagging (AI)",
                      starter: "Basic",
                      pro: "Advanced",
                      biz: "Custom Models",
                    },
                    {
                      feature: "Semantic Search",
                      starter: "Limited",
                      pro: "Unlimited",
                      biz: "Unlimited",
                    },
                    {
                      feature: "Bandwidth",
                      starter: "Standard",
                      pro: "High Speed",
                      biz: "Priority",
                    },
                    {
                      feature: "File History",
                      starter: "30 Days",
                      pro: "1 Year",
                      biz: "Unlimited",
                    },
                    {
                      feature: "Encryption",
                      starter: "AES-256",
                      pro: "AES-256",
                      biz: "AES-256",
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="p-4 text-zinc-300 font-medium">
                        {row.feature}
                      </td>
                      <td className="p-4 text-center text-zinc-400 font-mono">
                        {row.starter}
                      </td>
                      <td className="p-4 text-center text-white font-mono">
                        {row.pro}
                      </td>
                      <td className="p-4 text-center text-zinc-400 font-mono">
                        {row.biz}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
              <h4 className="text-white font-medium mb-2">
                Is the storage really free?
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Yes, the Starter plan gives you 10GB of storage for free,
                forever. We support this through our premium tiers.
              </p>
            </div>
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
              <h4 className="text-white font-medium mb-2">
                How secure is my data?
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We use industry-standard AES-256 encryption for storage and TLS
                1.3 for data in transit.
              </p>
            </div>
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
              <h4 className="text-white font-medium mb-2">
                What happens if I stop paying?
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your account will downgrade to the Free tier. If you are over
                the 10GB limit, you will need to download your files within 30
                days.
              </p>
            </div>
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
              <h4 className="text-white font-medium mb-2">
                Does the AI read my personal files?
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                The AI only accesses files to generate tags and summaries when
                you upload them. We do not use your data to train public models.
              </p>
            </div>
          </div>
        </div>

        <footer className="border-t border-zinc-800 pt-12 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-zinc-300">NovaDrive</span> &copy;
            2025
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PricingPage;

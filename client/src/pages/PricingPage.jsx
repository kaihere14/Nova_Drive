import React from "react";
import Navbar from "../components/Navbar";
import usePageMeta from "../utils/usePageMeta";

const PricingPage = () => {
  usePageMeta(
    "Pricing — NovaDrive",
    "Simple and transparent pricing for personal and business storage plans with AI analysis included."
  );
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* --- Subtle Grid Background --- */}
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
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Transparent Resource Allocation
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Scale as you grow. No hidden bandwidth fees. Choose the plan that
            fits your storage needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden mb-12 sm:mb-20">
          {[
            {
              name: "Developer",
              price: "$0",
              storage: "10 GB",
              band: "Unlimited",
              users: "1 User",
              api: "Read-Only",
              support: "Community",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$12",
              storage: "2 TB",
              band: "Unlimited",
              users: "5 Users",
              api: "Full",
              support: "Priority Email",
              highlight: true,
            },
            {
              name: "Organization",
              price: "Custom",
              storage: "Custom",
              band: "Priority",
              users: "Unlimited",
              api: "Full",
              support: "24/7 Dedicated",
              highlight: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`p-6 sm:p-8 bg-zinc-950 flex flex-col h-full ${
                plan.highlight ? "bg-zinc-900/80 border-2 border-white/10" : ""
              }`}
            >
              {plan.highlight && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-mono text-sm text-zinc-400 uppercase tracking-wider mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-white mb-6">
                {plan.price}
                {plan.price !== "Custom" && (
                  <span className="text-lg text-zinc-500 font-normal">/mo</span>
                )}
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
                  <span>Team Size</span>
                  <span className="font-mono text-white">{plan.users}</span>
                </li>
                <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                  <span>AI Analysis</span>
                  <span className="font-mono text-white">
                    {i === 0 ? "Basic" : "Advanced"}
                  </span>
                </li>
                <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                  <span>API Access</span>
                  <span className="font-mono text-white">{plan.api}</span>
                </li>
                <li className="text-sm text-zinc-300 flex justify-between border-b border-zinc-900 pb-2">
                  <span>Support</span>
                  <span className="font-mono text-white">{plan.support}</span>
                </li>
              </ul>

              <button
                className={`w-full py-3 rounded text-sm font-medium border transition-colors ${
                  plan.highlight
                    ? "bg-white text-black border-white hover:bg-zinc-200"
                    : "text-white border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                {i === 2 ? "Contact Us" : plan.highlight ? "Get Started" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-8 text-center">
            Feature Comparison
          </h2>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-6 text-zinc-400 font-medium">
                      Feature
                    </th>
                    <th className="text-center p-6 text-zinc-400 font-medium">
                      Developer
                    </th>
                    <th className="text-center p-6 text-zinc-400 font-medium bg-zinc-800/50">
                      Pro
                    </th>
                    <th className="text-center p-6 text-zinc-400 font-medium">
                      Organization
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    {
                      feature: "Storage Space",
                      dev: "10 GB",
                      pro: "2 TB",
                      org: "20 TB",
                    },
                    {
                      feature: "File Upload Size",
                      dev: "100 MB",
                      pro: "5 GB",
                      org: "Unlimited",
                    },
                    {
                      feature: "Version History",
                      dev: "7 days",
                      pro: "30 days",
                      org: "Unlimited",
                    },
                    {
                      feature: "Chunked Upload",
                      dev: true,
                      pro: true,
                      org: true,
                    },
                    {
                      feature: "AI Auto-Tagging",
                      dev: false,
                      pro: true,
                      org: true,
                    },
                    {
                      feature: "Custom Domains",
                      dev: false,
                      pro: false,
                      org: true,
                    },
                    {
                      feature: "Advanced Analytics",
                      dev: false,
                      pro: true,
                      org: true,
                    },
                    {
                      feature: "SSO Integration",
                      dev: false,
                      pro: false,
                      org: true,
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-zinc-800/50">
                      <td className="p-6 text-zinc-300">{row.feature}</td>
                      <td className="text-center p-6">
                        {typeof row.dev === "boolean" ? (
                          row.dev ? (
                            <div className="inline-flex w-5 h-5 bg-green-500/20 rounded-full items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="inline-flex w-5 h-5 bg-zinc-800 rounded-full items-center justify-center">
                              <svg
                                className="w-3 h-3 text-zinc-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          )
                        ) : (
                          <span className="text-zinc-400 font-mono">
                            {row.dev}
                          </span>
                        )}
                      </td>
                      <td className="text-center p-6 bg-zinc-800/30">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <div className="inline-flex w-5 h-5 bg-green-500/20 rounded-full items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="inline-flex w-5 h-5 bg-zinc-800 rounded-full items-center justify-center">
                              <svg
                                className="w-3 h-3 text-zinc-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          )
                        ) : (
                          <span className="text-zinc-400 font-mono">
                            {row.pro}
                          </span>
                        )}
                      </td>
                      <td className="text-center p-6">
                        {typeof row.org === "boolean" ? (
                          row.org ? (
                            <div className="inline-flex w-5 h-5 bg-green-500/20 rounded-full items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="inline-flex w-5 h-5 bg-zinc-800 rounded-full items-center justify-center">
                              <svg
                                className="w-3 h-3 text-zinc-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          )
                        ) : (
                          <span className="text-zinc-400 font-mono">
                            {row.org}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and wire transfers for organization plans.",
              },
              {
                q: "Is there a limit on file uploads?",
                a: "Each plan has different limits. Developer: 100MB per file, Pro: 5GB per file, Organization: Unlimited.",
              },
              {
                q: "What happens if I exceed my storage limit?",
                a: "You'll receive a notification when you reach 80% capacity. You can upgrade or purchase additional storage.",
              },
              {
                q: "Do you offer custom enterprise plans?",
                a: "Yes! Contact our sales team for custom storage solutions and dedicated infrastructure.",
              },
              {
                q: "Is my data encrypted?",
                a: "Absolutely. All files are encrypted client-side with AES-256 before upload. We use zero-knowledge architecture.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-zinc-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and organizations who trust NovaDrive
            for their storage infrastructure.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-zinc-200 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 rounded-md font-medium text-white border border-zinc-700 hover:bg-zinc-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800 mt-20 pt-12 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
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

export default PricingPage;
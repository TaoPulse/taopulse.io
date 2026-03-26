import SubnetDirectory from "@/components/SubnetDirectory";
import Link from "next/link";

export const metadata = {
  title: "Bittensor Subnet Directory — All TAO Subnets Explained",
  description:
    "Browse all Bittensor subnets: what they do, how many miners, cost to join, and links to get started.",
  keywords:
    "Bittensor subnets, TAO subnets, subnet directory, Bittensor mining, subnet list, dTAO, Bittensor AI",
  openGraph: {
    title: "Bittensor Subnet Directory — All TAO Subnets Explained",
    description:
      "Browse all Bittensor subnets: what they do, how many miners, cost to join, and links to get started.",
    url: "https://taopulse.io/subnets/directory",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittensor Subnet Directory — All TAO Subnets Explained",
    description:
      "Browse all Bittensor subnets: what they do, how many miners, cost to join, and links to get started.",
  },
  alternates: { canonical: "https://taopulse.io/subnets/directory" },
};

export default function SubnetDirectoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="relative mb-12">
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Subnet Directory
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                Bittensor{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Subnet Directory
                </span>
              </h1>
              <p className="text-gray-400 max-w-2xl leading-relaxed text-base">
                Every Bittensor subnet is a specialized AI market — miners produce outputs, validators score quality,
                and{" "}
                <span className="text-purple-400 font-medium">3,600 TAO</span> flows daily to the top performers.
                Browse the top 25 subnets, filter by category, and find the right one to mine or stake on.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/subnets"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Live Subnet Explorer
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Subnets Covered", value: "25", sub: "Top by activity", color: "text-white" },
              { label: "Categories", value: "6", sub: "Text, Image, Data…", color: "text-purple-400" },
              { label: "Daily TAO Rewards", value: "3,600", sub: "Across all subnets", color: "text-emerald-400" },
              { label: "Miner Reg. Cost", value: "0.1–2 τ", sub: "Per subnet (dynamic)", color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f1623] rounded-xl border border-white/10 px-5 py-4">
                <p className={`text-2xl font-bold mb-0.5 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-medium text-white">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SubnetDirectory />

      {/* Footer note */}
      <p className="text-xs text-gray-600 mt-10 text-center">
        Miner/validator counts and registration costs are estimates — always verify on a block explorer before committing capital. Data sourced from official GitHub repositories and documentation, updated March 2026.
      </p>
    </div>
  );
}

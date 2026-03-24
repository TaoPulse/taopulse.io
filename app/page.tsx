import Link from "next/link";
import PriceStrip from "@/components/PriceStrip";
import StakingCalculator from "@/components/StakingCalculator";
import HeroPrice from "@/components/HeroPrice";
import subnets from "@/data/subnets.json";

const CATEGORY_COLORS: Record<string, string> = {
  Language: "bg-blue-500/15 text-blue-400",
  Image: "bg-pink-500/15 text-pink-400",
  Data: "bg-amber-500/15 text-amber-400",
  Finance: "bg-emerald-500/15 text-emerald-400",
  Storage: "bg-cyan-500/15 text-cyan-400",
  Security: "bg-red-500/15 text-red-400",
  Infrastructure: "bg-purple-500/15 text-purple-400",
};

const topSubnets = subnets.slice(0, 5);

const STATS = [
  { label: "Active Subnets", value: "65+", icon: "grid" },
  { label: "TAO Staked", value: "76%", icon: "lock" },
  { label: "Daily Emissions", value: "7,200 TAO", icon: "zap" },
  { label: "Market Cap", value: "$2.8B", icon: "chart" },
];

const WHY_TAO = [
  {
    title: "Decentralized AI",
    description:
      "Bittensor's peer-to-peer network ensures no single entity controls AI production. Subnets compete openly, driving quality and innovation without central gatekeepers.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: "Proof of Intelligence",
    description:
      "Unlike energy-wasting proof-of-work, TAO rewards miners for producing genuine intelligence. Validators score outputs and distribute emissions proportionally to contribution quality.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Growing Ecosystem",
    description:
      "With 65+ specialized subnets spanning language models, image generation, financial data, and security — the Bittensor ecosystem is expanding rapidly with new use cases every month.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#080d14]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-900/20 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-purple-700/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Live TAO Network Data
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
              The Pulse of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                Bittensor
              </span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">
              Professional-grade analytics for the TAO ecosystem. Track subnet
              performance, validator yields, and real-time price data across the
              decentralized AI network.
            </p>

            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                TAO / USD — Live
              </p>
              <HeroPrice />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/subnets"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
              >
                Explore Subnets
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/staking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
              >
                Staking Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Price Strip */}
      <PriceStrip />

      {/* Stats bar */}
      <section className="bg-[#0f1623] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top 5 Subnets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Top Subnets</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Highest emission subnets by network weight
            </p>
          </div>
          <Link
            href="/subnets"
            className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
          >
            View all 15
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-[#0f1623] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0a0f1a] border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subnet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Market Cap</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Emissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topSubnets.map((subnet, idx) => (
                <tr
                  key={subnet.id}
                  className={`${idx % 2 === 0 ? "bg-[#0f1623]" : "bg-[#0b1019]"} hover:bg-purple-600/5 transition-colors`}
                >
                  <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                    {String(subnet.id).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-white">{subnet.name}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[subnet.category] || "bg-gray-500/15 text-gray-400"}`}>
                      {subnet.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-white">—</td>
                  <td className="px-4 py-3.5 text-right text-emerald-400 font-medium">{(subnet.emission * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/subnets"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            View all subnets with filtering and sorting
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Staking Calculator */}
      <section className="bg-[#0a0f1a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Calculate Your Staking Returns
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Delegate your TAO to trusted validators and earn passive income
                from network emissions. Use the calculator to estimate your
                potential returns based on current APY rates.
              </p>
              <ul className="space-y-3">
                {[
                  "No lock-up period — unstake anytime",
                  "Earn 15–22% APY from network emissions",
                  "Compound rewards automatically",
                  "Support your favorite subnets",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/staking"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
              >
                Full Staking Guide
              </Link>
            </div>
            <StakingCalculator />
          </div>
        </div>
      </section>

      {/* Why TAO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Why TAO?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Bittensor represents a paradigm shift in how AI is produced,
            distributed, and monetized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_TAO.map((card) => (
            <div
              key={card.title}
              className="bg-[#0f1623] rounded-xl border border-white/10 p-6 hover:border-purple-600/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-purple-600/15 text-purple-400 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

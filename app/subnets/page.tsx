import SubnetTable from "@/components/SubnetTable";
import HeroPrice from "@/components/HeroPrice";
import subnets from "@/data/subnets.json";

export const metadata = {
  title: "Bittensor Subnet Explorer | TaoPulse",
  description:
    "Explore all 128 Bittensor subnets. Filter by category, sort by emission, miners, or ID. Discover how to mine each subnet.",
};

const activeCount = subnets.filter((s) => s.status === "active").length;
const topEmission = subnets.reduce((max, s) => (s.emission > max.emission ? s : max), subnets[0]);
const totalMiners = subnets.reduce((sum, s) => sum + s.activeMiners, 0);
const categoryCount = new Set(subnets.map((s) => s.category)).size;

export default function SubnetsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="relative mb-12">
        {/* Background glow */}
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {subnets.length} Subnets Tracked
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                Bittensor{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Subnet Explorer
                </span>
              </h1>
              <p className="text-gray-400 max-w-2xl leading-relaxed text-base">
                Bittensor organizes decentralized AI production into specialized subnets — each
                a market for a specific AI capability. Validators score miners, and{" "}
                <span className="text-purple-400 font-medium">7,200 TAO</span> flows daily
                to the best performers. Click any subnet to explore details and mining guides.
              </p>
            </div>
            <div className="shrink-0">
              <HeroPrice />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Subnets",
                value: subnets.length.toString(),
                sub: "SN1 – SN128",
                color: "text-white",
              },
              {
                label: "Active Subnets",
                value: activeCount.toString(),
                sub: "Earning emissions",
                color: "text-emerald-400",
              },
              {
                label: "Highest Emission",
                value: `SN${topEmission.id}`,
                sub: `${(topEmission.emission * 100).toFixed(2)}% daily`,
                color: "text-purple-400",
              },
              {
                label: "Total Daily TAO",
                value: "7,200",
                sub: `${categoryCount} categories`,
                color: "text-blue-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0f1623] rounded-xl border border-white/10 px-5 py-4"
              >
                <p className={`text-2xl font-bold mb-0.5 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-medium text-white">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SubnetTable subnets={subnets as any} />
    </div>
  );
}

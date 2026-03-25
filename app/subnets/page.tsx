import SubnetTable from "@/components/SubnetTable";
import HeroPrice from "@/components/HeroPrice";
import TrendingSubnets from "@/components/TrendingSubnets";
import TopMovers, { type Mover } from "@/components/TopMovers";
import staticSubnets from "@/data/subnets.json";

export const metadata = {
  title: "Bittensor Subnet Explorer — All 128+ Subnets with Live Emission Data",
  description: "Explore all Bittensor subnets with live emission percentages, active miners, and validator counts. Find the best subnets for staking and discover the AI capabilities of each subnet.",
  keywords: "Bittensor subnets, TAO subnets, Bittensor subnet explorer, subnet emission, dTAO subnets, Bittensor AI subnets",
  openGraph: {
    title: "Bittensor Subnet Explorer — All 128+ Subnets with Live Emission Data",
    description: "Explore all Bittensor subnets with live emission percentages, active miners, and validator counts.",
    url: "https://taopulse.io/subnets",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittensor Subnet Explorer — All 128+ Subnets with Live Emission Data",
    description: "Explore all Bittensor subnets with live emission percentages, active miners, and validator counts.",
  },
  alternates: { canonical: "https://taopulse.io/subnets" },
};

interface LiveFetchResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subnets: any[];
  gainers: Mover[];
  losers: Mover[];
}

async function fetchLiveSubnets(): Promise<LiveFetchResult> {
  try {
    const apiKey = process.env.TAOSTATS_API_KEY;
    if (!apiKey) return { subnets: staticSubnets, gainers: [], losers: [] };

    const res = await fetch("https://api.taostats.io/api/subnet/latest/v1?limit=200", {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) return { subnets: staticSubnets, gainers: [], losers: [] };

    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liveMap = new Map<number, any>();
    for (const s of json.data ?? []) {
      if (s.netuid === 0) continue;
      liveMap.set(s.netuid, s);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subnets = (staticSubnets as any[]).map((s) => {
      const live = liveMap.get(s.id);
      if (!live) return s;
      const emissionPct = parseFloat(live.projected_emission) || s.emission;
      return {
        ...s,
        emission: emissionPct,
        activeMiners: live.active_miners ?? s.activeMiners,
        activeValidators: live.active_validators ?? s.activeValidators,
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    // Compute movers: projected_emission vs emission
    const movers: Mover[] = [];
    for (const s of staticSubnets) {
      const live = liveMap.get(s.id);
      if (!live) continue;
      const projected = parseFloat(live.projected_emission);
      const current = parseFloat(live.emission);
      if (!projected || !current || current === 0) continue;
      const diff = projected - current;
      const diffPct = (diff / current) * 100;
      // Only include subnets with meaningful momentum (>1%)
      if (Math.abs(diffPct) < 1) continue;
      movers.push({ id: s.id, name: s.name, emission: projected, diff, diffPct });
    }

    movers.sort((a, b) => b.diffPct - a.diffPct);
    const gainers = movers.filter((m) => m.diffPct > 0).slice(0, 3);
    const losers = movers.filter((m) => m.diffPct < 0).slice(-3).reverse();

    return { subnets, gainers, losers };
  } catch {
    return { subnets: staticSubnets, gainers: [], losers: [] };
  }
}

export default async function SubnetsPage() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  const isLive = !!apiKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { subnets, gainers, losers }: LiveFetchResult = await fetchLiveSubnets();

  const activeCount = subnets.filter((s) => s.status === "active").length;
  const topEmission = subnets.reduce((max, s) => (s.emission > max.emission ? s : max), subnets[0]);
  const categoryCount = new Set(subnets.map((s) => s.category)).size;

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
                <span className="text-purple-400 font-medium">3,600 TAO</span> flows daily
                to the best performers (post-halving Dec 2025). Click any subnet to explore details and mining guides.
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
                value: "3,600",
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
          <p className="text-xs text-gray-600 mt-3">
            {isLive
              ? "Emission data live from taostats.io, refreshed every 5 minutes."
              : <>Emission data from last known snapshot, last verified March 2026. For live data, visit{" "}<a href="https://taostats.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 transition-colors">taostats.io</a>.</>}
          </p>
        </div>
      </div>

      {/* Top Movers */}
      <TopMovers gainers={gainers} losers={losers} />

      {/* Top by Emission highlight */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Top by Emission</h2>
            <p className="text-sm text-gray-500 mt-0.5">Subnets currently earning the highest share of daily TAO</p>
          </div>
        </div>
        <TrendingSubnets />
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SubnetTable subnets={subnets as any} />
    </div>
  );
}

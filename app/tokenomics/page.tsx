import Link from "next/link";
import TokenomicsDistributionChart from "@/components/TokenomicsDistributionChart";

export const metadata = {
  title: "TAO Tokenomics — Supply, Halvings & Scarcity Explained",
  description:
    "Full breakdown of TAO tokenomics: 21M hard cap, circulating supply, staked TAO, emission schedule, halvings, and how TAO compares to Bitcoin's monetary policy.",
  keywords: [
    "TAO tokenomics",
    "Bittensor supply",
    "TAO circulating supply",
    "TAO halving schedule",
    "TAO vs Bitcoin",
    "TAO scarcity",
    "Bittensor economics",
  ],
  openGraph: {
    title: "TAO Tokenomics — Supply, Halvings & Scarcity Explained",
    description:
      "Full breakdown of TAO tokenomics: 21M hard cap, circulating supply, staked TAO, emission schedule, halvings, and how TAO compares to Bitcoin's monetary policy.",
    url: "https://taopulse.io/tokenomics",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Tokenomics — Supply, Halvings & Scarcity Explained",
    description:
      "Full breakdown of TAO tokenomics: 21M hard cap, circulating supply, staked TAO, emission schedule, halvings, and how TAO compares to Bitcoin's monetary policy.",
  },
  alternates: { canonical: "https://taopulse.io/tokenomics" },
};

type NetworkStats = {
  circulatingSupply: number | null;
  stakedTao: number | null;
  stakedPct: number | null;
};

async function fetchNetworkStats(): Promise<NetworkStats> {
  const apiKey = process.env.TAOSTATS_API_KEY;
  const TAOSTATS_BASE = "https://api.taostats.io";

  const results = await Promise.allSettled([
    // TaoStats price endpoint (has circulating supply)
    apiKey
      ? fetch(`${TAOSTATS_BASE}/api/price/latest/v1?asset=tao`, {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(6000),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null),

    // TaoStats validator endpoint (total staked)
    apiKey
      ? fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?limit=100`, {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(6000),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null),

    // CoinGecko fallback for circulating supply
    fetch(
      "https://api.coingecko.com/api/v3/coins/bittensor?localization=false&tickers=false&community_data=false&developer_data=false",
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) }
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const priceData = results[0].status === "fulfilled" ? results[0].value : null;
  const validatorData =
    results[1].status === "fulfilled" ? results[1].value : null;
  const geckoData = results[2].status === "fulfilled" ? results[2].value : null;

  const taoStatsPriceRow = priceData?.data?.[0] ?? null;
  const circulatingSupply: number | null = taoStatsPriceRow
    ? parseFloat(taoStatsPriceRow.circulating_supply)
    : (geckoData?.market_data?.circulating_supply ?? null);

  let stakedTao: number | null = null;
  if (validatorData?.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRao = validatorData.data.reduce(
      (sum: number, v: { stake: string }) => sum + parseFloat(v.stake),
      0
    );
    stakedTao = Math.round(totalRao / 1e9);
  }

  const stakedPct =
    stakedTao && circulatingSupply
      ? parseFloat(((stakedTao / circulatingSupply) * 100).toFixed(1))
      : null;

  return {
    circulatingSupply: circulatingSupply ? Math.round(circulatingSupply) : null,
    stakedTao,
    stakedPct,
  };
}

const halvingSchedule = [
  {
    label: "Genesis",
    date: "2021",
    emissions: "7,200 TAO/day",
    supply: "~0",
    status: "past",
  },
  {
    label: "Halving 1",
    date: "Dec 14, 2025",
    emissions: "3,600 TAO/day",
    supply: "~10.5M TAO",
    status: "done",
  },
  {
    label: "Halving 2",
    date: "~Dec 2029",
    emissions: "1,800 TAO/day",
    supply: "~15.75M TAO (est.)",
    status: "next",
  },
  {
    label: "Halving 3",
    date: "~2033",
    emissions: "900 TAO/day",
    supply: "~18.4M TAO (est.)",
    status: "future",
  },
  {
    label: "Halving 4",
    date: "~2037",
    emissions: "450 TAO/day",
    supply: "~19.7M TAO (est.)",
    status: "future",
  },
  {
    label: "Halving 5+",
    date: "~2041+",
    emissions: "225 TAO/day…",
    supply: "→ 21M (asymptote)",
    status: "future",
  },
];

function fmt(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString();
}

export default async function TokenomicsPage() {
  const stats = await fetchNetworkStats();
  const { circulatingSupply, stakedTao, stakedPct } = stats;

  const supplyPct =
    circulatingSupply
      ? ((circulatingSupply / 21_000_000) * 100).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-[#080d14] text-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Tokenomics
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
          TAO Supply & Economics
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          TAO has Bitcoin-style scarcity — a 21 million hard cap with halvings
          every ~4 years. Here&apos;s a complete visual breakdown of the supply,
          emission schedule, and why it matters for investors.
        </p>
      </section>

      {/* 1. Supply Overview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-5">Supply Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Max supply */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Max Supply
            </p>
            <p className="text-2xl font-bold text-white">21,000,000</p>
            <p className="text-xs text-gray-500 mt-1">TAO — hard cap</p>
          </div>

          {/* Circulating supply */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Circulating Supply
            </p>
            <p className="text-2xl font-bold text-cyan-400">
              {fmt(circulatingSupply)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {supplyPct ? `${supplyPct}% of max cap` : "live"}
            </p>
          </div>

          {/* Staked */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Currently Staked
            </p>
            <p className="text-2xl font-bold text-purple-400">
              {fmt(stakedTao)}
            </p>
            <p className="text-xs text-gray-500 mt-1">TAO delegated</p>
          </div>

          {/* % staked */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              % Staked
            </p>
            <p className="text-2xl font-bold text-green-400">
              {stakedPct !== null ? `${stakedPct}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">of circulating supply</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-3">
          Live data from TaoStats — refreshed every 5 minutes. Staked TAO
          reflects delegated validators only (top 100); actual staked total may
          be higher.
        </p>
      </section>

      {/* 2. Distribution Chart */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-5">
          TAO Distribution
        </h2>
        <div className="bg-[#0f1623] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-4">
            Breakdown of the full 21M supply — what&apos;s circulating, staked,
            and still to be minted.
          </p>
          <TokenomicsDistributionChart
            stakedTao={stakedTao}
            circulatingSupply={circulatingSupply}
          />
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Staked TAO — earning yield via validators
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
              Unstaked (circulating) — held or in DEX/CEX
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block" />
              Not yet minted — to be emitted over ~75+ years
            </span>
          </div>
        </div>
      </section>

      {/* 3. Emission Schedule */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-2">
          Emission Schedule
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Currently emitting ~3,600 TAO/day post-halving 1. Halvings occur
          every ~10.5 million blocks (~4 years). Future dates are estimates
          based on 12-second block times.{" "}
          <Link href="/halving" className="text-cyan-400 hover:underline">
            Live halving countdown →
          </Link>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Event
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Daily Emission
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Supply at Event
                </th>
              </tr>
            </thead>
            <tbody>
              {halvingSchedule.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-white/5 ${
                    row.status === "next"
                      ? "bg-cyan-500/5"
                      : row.status === "done"
                      ? "bg-white/[0.02]"
                      : ""
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-white">
                    {row.label}
                    {row.status === "next" && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-400 font-semibold uppercase">
                        Next
                      </span>
                    )}
                    {row.status === "done" && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-semibold uppercase">
                        Done
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{row.date}</td>
                  <td className="py-3 px-4 text-gray-300">{row.emissions}</td>
                  <td className="py-3 px-4 text-gray-400">{row.supply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. TAO vs Bitcoin */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-2">
          TAO vs Bitcoin — Side by Side
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          TAO was deliberately designed to mirror Bitcoin&apos;s monetary policy
          — familiar to millions of investors already.
        </p>

        <div className="bg-[#0f1623] border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 text-sm border-b border-white/10">
            <div className="py-3 px-5 text-gray-500 font-medium">Property</div>
            <div className="py-3 px-5 text-orange-400 font-bold">Bitcoin</div>
            <div className="py-3 px-5 text-cyan-400 font-bold">TAO</div>
          </div>

          {[
            ["Max Supply", "21,000,000 BTC", "21,000,000 TAO"],
            ["Halving Interval", "~210,000 blocks (~4 yr)", "~10.5M blocks (~4 yr)"],
            ["Current Emission", "~450 BTC/day", "~3,600 TAO/day"],
            ["Current Inflation", "~0.85%/yr", "~6–9%/yr (declining)"],
            ["Halving Mechanism", "Block reward halved", "Block reward halved"],
            ["Foundation/Premine", "0% (no premine)", "~10.5M foundation"],
            ["Consensus", "Proof of Work", "Proof of Intelligence"],
            ["Utility", "Store of value", "AI compute + store of value"],
          ].map(([prop, btc, tao], i) => (
            <div
              key={prop}
              className={`grid grid-cols-3 text-sm border-b border-white/5 ${
                i % 2 === 0 ? "bg-white/[0.01]" : ""
              }`}
            >
              <div className="py-3 px-5 text-gray-400">{prop}</div>
              <div className="py-3 px-5 text-gray-300">{btc}</div>
              <div className="py-3 px-5 text-gray-300">{tao}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Bitcoin and TAO emission figures are approximate. TAO foundation
          allocation based on Bittensor&apos;s published genesis allocation.
          Inflation % will vary with circulating supply.
        </p>
      </section>

      {/* 5. Why Scarcity Matters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-white mb-5">
          Why Scarcity Matters
        </h2>

        <div className="space-y-5 max-w-3xl">
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">
              Network growth = more demand for TAO
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every AI application, data labeling task, or machine-learning
              workload that runs on Bittensor requires TAO — to register miners,
              stake validators, and pay for compute. As Bittensor&apos;s subnet
              ecosystem expands (100+ active subnets and growing), demand for TAO
              rises while the emission rate is mechanically declining.
            </p>
          </div>

          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">
              Fixed supply + halvings = deflationary pressure
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The first halving (December 2025) cut daily emissions from 7,200
              to 3,600 TAO — a 50% reduction in new supply entering the market.
              Each subsequent halving compounds this effect. Eventually, &gt;95%
              of all TAO will be locked in validator stake or held long-term,
              dramatically reducing liquid sell pressure.{" "}
              <Link href="/halving" className="text-cyan-400 hover:underline">
                See the halving countdown →
              </Link>
            </p>
          </div>

          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">
              TAO is the fuel, not just the currency
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Unlike many tokens that exist purely as speculation, TAO has a
              core utility role: it is how the network allocates computational
              resources between competing AI subnets. Stake more TAO to a
              subnet, and more emissions flow to it. This means TAO demand is
              structurally tied to the growth of AI on Bittensor — not just
              market sentiment.{" "}
              <Link
                href="/what-is-tao"
                className="text-cyan-400 hover:underline"
              >
                Learn more about what TAO is →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-8 text-center">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Free Weekly Newsletter</p>
          <h2 className="text-xl font-bold text-white mb-2">Get TAO Alpha every Monday</h2>
          <p className="text-gray-400 mb-6 text-sm">TAO price snapshot, top subnet emissions, validator rankings, and one subnet deep dive — free, every week.</p>
          <Link href="/join" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors">
            Subscribe free →
          </Link>
        </div>
      </section>
    </main>
  );
}

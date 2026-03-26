import EmissionsChart from "@/components/EmissionsChart";
import HalvingCountdown from "@/components/HalvingCountdown";

export const metadata = {
  title: "TAO Halving Countdown 2029 — Bittensor Emission Schedule",
  description:
    "Live countdown to the next TAO halving in December 2029. Track blocks remaining, current emissions (3,600 TAO/day), post-halving supply, and Bittensor's full emission schedule.",
  keywords: ["TAO halving", "Bittensor halving", "TAO emission schedule", "TAO supply", "Bittensor 2029"],
  openGraph: {
    title: "TAO Halving Countdown 2029 — Bittensor Emission Schedule",
    description:
      "Live countdown to the next TAO halving in December 2029. Track blocks remaining, current emissions (3,600 TAO/day), post-halving supply, and Bittensor's full emission schedule.",
    url: "https://taopulse.io/halving",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Halving Countdown 2029 — Bittensor Emission Schedule",
    description:
      "Live countdown to the next TAO halving in December 2029. Track blocks remaining, current emissions (3,600 TAO/day), post-halving supply, and Bittensor's full emission schedule.",
  },
  alternates: { canonical: "https://taopulse.io/halving" },
};

const halvingHistory = [
  {
    label: "Genesis",
    date: "2021",
    emissions: "7,200 TAO/day",
    status: "past",
    description: "Network launched. Full emissions to bootstrap miners and validators.",
  },
  {
    label: "Halving 1",
    date: "Dec 14, 2025",
    emissions: "3,600 TAO/day",
    status: "done",
    description: "First halving completed. Daily emissions permanently cut to 3,600 TAO.",
  },
  {
    label: "Halving 2",
    date: "~Dec 2029",
    emissions: "1,800 TAO/day",
    status: "next",
    description: "Next halving. Emissions drop to 1,800 TAO/day as scarcity deepens.",
  },
  {
    label: "Halving 3",
    date: "~2033",
    emissions: "900 TAO/day",
    status: "future",
    description: "Third halving. Only 900 TAO minted per day.",
  },
  {
    label: "Halving 4",
    date: "~2037",
    emissions: "450 TAO/day",
    status: "future",
    description: "Fourth halving. Supply growth approaches its asymptote.",
  },
];

const whyItMatters = [
  {
    title: "Scarcity Effect",
    body: "Each halving permanently cuts the rate of new TAO entering circulation. With demand growing and supply issuance shrinking, basic economics points to upward price pressure — the same structural force that has driven Bitcoin's appreciation over time.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    title: "Historical BTC Pattern",
    body: "Bitcoin's halvings in 2012, 2016, 2020, and 2024 each preceded a major bull market. Supply shocks of this nature take months to fully reprice as the market absorbs the new issuance reality. TAO is following an identical schedule.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    title: "Staking Yield Impact",
    body: "As block rewards halve, staking APY compresses in nominal TAO terms. However, if TAO's price rises to reflect the reduced supply growth — as it did post-Halving 1 — real yields can remain attractive for early stakers.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

export default async function HalvingPage() {
  let circulatingSupply: number | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://taopulse.io"}/api/network-stats`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
    ).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      circulatingSupply = data.circulatingSupply ?? null;
    }
  } catch {}

  const supplyPct =
    circulatingSupply != null
      ? ((circulatingSupply / 21_000_000) * 100).toFixed(1)
      : null;

  const currentBlock =
    10_500_000 + Math.floor((Date.now() - Date.UTC(2025, 11, 14)) / 12000);
  const blocksRemaining = Math.max(0, 21_000_000 - currentBlock);
  const blocksRemainingDisplay = "~" + blocksRemaining.toLocaleString("en-US");

  const stats = [
    {
      label: "Current Daily Emissions",
      value: "3,600 TAO",
      sub: "Era 2 (post Dec 2025 halving)",
      color: "text-amber-400",
      border: "border-amber-500/20",
    },
    {
      label: "After Next Halving",
      value: "1,800 TAO",
      sub: "~Dec 2029 target",
      color: "text-orange-400",
      border: "border-orange-500/20",
    },
    {
      label: "Blocks Until Halving",
      value: blocksRemainingDisplay,
      sub: "est. based on 12s/block",
      color: "text-purple-400",
      border: "border-purple-500/20",
    },
    {
      label: "% of Max Supply Minted",
      value: supplyPct != null ? `${supplyPct}%` : "—",
      sub: supplyPct != null ? "of 21M TAO" : "data unavailable",
      color: "text-emerald-400",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-900/15 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-900/20 rounded-full blur-3xl opacity-30" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-400 text-xs font-medium mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            Live Countdown — Era 2
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-3">
            Next TAO{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Halving Clock
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl">
            Bittensor emissions halve again around{" "}
            <span className="text-amber-400 font-semibold">December 2029</span> —
            dropping from 3,600 to 1,800 TAO/day.
          </p>

          {/* Live countdown */}
          <HalvingCountdown />

          <p className="text-xs text-gray-600 mt-4 text-center">
            Target date: ~Dec 11, 2029 · Updates every second
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0f1623] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`bg-[#080d14] rounded-xl border ${s.border} p-4 text-center`}
              >
                <p className={`text-xl sm:text-2xl font-bold ${s.color} tabular-nums`}>
                  {s.value}
                </p>
                <p className="text-xs font-medium text-white/80 mt-1">{s.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* Halving History Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Halving History &amp; Schedule</h2>
          <p className="text-gray-400 mb-8 text-sm">
            TAO follows Bitcoin's deflationary issuance model — emissions halve every ~4 years
          </p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-3 bottom-3 w-px bg-white/10" />
            <div className="space-y-0">
              {halvingHistory.map((item, i) => {
                const isDone = item.status === "done";
                const isNext = item.status === "next";
                const isPast = item.status === "past";
                const isFuture = item.status === "future";

                const dotColor = isDone
                  ? "bg-emerald-400 border-emerald-400"
                  : isNext
                  ? "bg-amber-400 border-amber-400 animate-pulse"
                  : isPast
                  ? "bg-gray-500 border-gray-500"
                  : "bg-transparent border-gray-700";

                const labelColor = isDone
                  ? "text-emerald-400"
                  : isNext
                  ? "text-amber-400"
                  : isFuture
                  ? "text-gray-500"
                  : "text-gray-400";

                const badge = isDone ? "✅" : isNext ? "⏳" : "";

                return (
                  <div key={i} className="flex gap-5 pb-8 last:pb-0">
                    {/* Dot */}
                    <div className="relative flex-shrink-0 mt-1">
                      <div
                        className={`w-[14px] h-[14px] rounded-full border-2 ${dotColor} relative z-10 ml-[5px]`}
                      />
                    </div>
                    {/* Content */}
                    <div
                      className={`flex-1 rounded-xl border p-4 sm:p-5 ${
                        isNext
                          ? "bg-amber-500/5 border-amber-500/25"
                          : isDone
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-[#0f1623] border-white/8"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                        <span className={`text-sm font-bold ${labelColor}`}>
                          {badge && <span className="mr-1">{badge}</span>}
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                        <span
                          className={`ml-auto text-sm font-semibold tabular-nums ${
                            isNext ? "text-amber-400" : isDone ? "text-emerald-400" : "text-gray-500"
                          }`}
                        >
                          {item.emissions}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Why the Halving Matters</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Three structural effects every TAO holder should understand
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyItMatters.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border p-5 ${item.bg} ${item.border} hover:scale-[1.01] transition-transform`}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${item.bg} border ${item.border} ${item.color} flex items-center justify-center mb-4`}
                >
                  {item.icon}
                </div>
                <h3 className={`text-sm font-semibold ${item.color} mb-2`}>{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Emissions Chart */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Emissions Schedule</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Daily TAO minted per day — step-down halving every ~4 years
          </p>
          <EmissionsChart />
        </section>

        {/* Newsletter CTA */}
        <section className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-8 text-center">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Free Weekly Newsletter</p>
          <h2 className="text-xl font-bold text-white mb-2">Track the halving countdown weekly</h2>
          <p className="text-gray-400 mb-6 text-sm">TAO price, subnet emissions, validator rankings, and blocks remaining to the next halving — every Monday morning.</p>
          <a href="/join" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors">
            Subscribe to TAO Alpha →
          </a>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Position before the next halving
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Stack TAO or stake it to earn yield while emissions are still at 3,600/day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/buy-tao"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
            >
              Buy TAO →
            </a>
            <a
              href="/staking"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
            >
              Start Staking →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

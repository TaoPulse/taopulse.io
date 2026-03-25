import ValidatorsClient, { type ValidatorRow } from "./ValidatorsClient";
import YieldCalculator from "./YieldCalculator";

export const metadata = {
  title: "Bittensor Validator Comparison — Live Stake, APR & Fees",
  description:
    "Compare top Bittensor validators by stake, estimated APR, fee, and number of nominators. Live data from TaoStats — refreshed every 5 minutes.",
  keywords:
    "Bittensor validators, TAO validator comparison, stake TAO, validator APR, Bittensor staking, best validator TAO",
  openGraph: {
    title: "Bittensor Validator Comparison — Live Stake, APR & Fees",
    description:
      "Compare top Bittensor validators by stake, APR, fee, and nominators. Live data from TaoStats.",
    url: "https://taopulse.io/validators",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittensor Validator Comparison — Live Stake, APR & Fees",
    description:
      "Compare top Bittensor validators by stake, APR, fee, and nominators. Live data from TaoStats.",
  },
  alternates: { canonical: "https://taopulse.io/validators" },
};

async function fetchTaoPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd",
      { headers: { "User-Agent": "TaoPulse/1.0" }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.bittensor?.usd ?? null;
  } catch {
    return null;
  }
}

async function fetchValidators(): Promise<ValidatorRow[] | null> {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.taostats.io/api/validator/latest/v1?limit=50", {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).slice(0, 25).map((v: any): ValidatorRow => {
      const takePct = parseFloat(v.take) * 100;
      const aprPct = parseFloat(v.apr) * 100;
      let uptime: string | null = null;
      if (typeof v.uptime === "number") {
        uptime = `${(v.uptime * 100).toFixed(1)}%`;
      } else if (typeof v.active === "boolean") {
        uptime = v.active ? "Active" : "Inactive";
      }
      let subnets: number | null = null;
      if (typeof v.subnet_count === "number") {
        subnets = v.subnet_count;
      } else if (Array.isArray(v.subnets)) {
        subnets = v.subnets.length;
      } else if (typeof v.subnets === "number") {
        subnets = v.subnets;
      }
      return {
        name: v.name || "Unknown",
        hotkey: v.hotkey?.ss58 ?? "",
        fee: `${takePct.toFixed(1)}%`,
        apr: `${aprPct.toFixed(1)}%`,
        aprRaw: aprPct,
        stake: (parseFloat(v.stake) / 1e9).toLocaleString("en-US", { maximumFractionDigits: 0 }),
        stakeRaw: parseFloat(v.stake) / 1e9,
        nominators: v.nominators as number,
        uptime,
        subnets,
      };
    });
  } catch {
    return null;
  }
}

export default async function ValidatorsPage() {
  const [validators, taoPrice] = await Promise.all([fetchValidators(), fetchTaoPrice()]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Live Validator Data
        </div>
        <h1 className="text-3xl font-bold text-white">Bittensor Validator Comparison</h1>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Compare the top validators on the Bittensor network by total stake, estimated APR, fee, and number of nominators.
          Click any column header to sort. Data from{" "}
          <a href="https://taostats.io/validators" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
            TaoStats
          </a>
          , refreshed every 5 minutes.
        </p>
      </div>

      {/* What to look for */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: "Low Fee",
            desc: "Look for validators with 0–9% fee. The fee is taken from your rewards, not your principal.",
          },
          {
            icon: (
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            title: "High APR",
            desc: "APR is estimated from current network conditions. It changes over time — use as a rough guide.",
          },
          {
            icon: (
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            title: "Many Nominators",
            desc: "More nominators generally means the validator is trusted by many stakers — a signal of reliability.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-[#0f1623] p-4 space-y-2">
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-sm font-semibold text-white">{item.title}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {validators === null ? (
        <div className="rounded-xl border border-white/10 bg-[#0f1623] px-6 py-12 text-center space-y-3">
          <p className="text-gray-400">Validator data is temporarily unavailable.</p>
          <p className="text-sm text-gray-600">
            View live validators directly at{" "}
            <a
              href="https://taostats.io/validators"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline hover:text-purple-300"
            >
              taostats.io/validators
            </a>
            .
          </p>
        </div>
      ) : (
        <ValidatorsClient validators={validators} />
      )}

      {/* Yield Calculator */}
      {validators !== null && validators.length > 0 && (
        <YieldCalculator validators={validators} taoPrice={taoPrice} />
      )}

      {/* Footer note */}
      <p className="text-xs text-gray-600">
        APR figures are estimates based on current network conditions and are not guaranteed. Bittensor has no slashing — your staked TAO cannot be penalized.{" "}
        <a href="/staking" className="text-purple-400 hover:text-purple-300 underline">
          Learn more about staking →
        </a>
      </p>

    </div>
  );
}

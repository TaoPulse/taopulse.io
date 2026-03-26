import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "TAO Alpha — Weekly TAO Intel | TaoPulse",
  description: "Weekly Bittensor intelligence: TAO price, top subnet emissions, staking APY, validator rankings, and one subnet deep dive. Subscribe free.",
  openGraph: {
    title: "TAO Alpha — Weekly TAO Intel | TaoPulse",
    description: "Weekly Bittensor intelligence: TAO price, top subnet emissions, staking APY, validator rankings, and one subnet deep dive. Subscribe free.",
    url: "https://taopulse.io/newsletter",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Alpha — Weekly TAO Intel | TaoPulse",
    description: "Weekly Bittensor intelligence: TAO price, top subnet emissions, staking APY, validator rankings, and one subnet deep dive. Subscribe free.",
  },
  alternates: { canonical: "https://taopulse.io/newsletter" },
};

interface NewsItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  score?: number;
  comments?: number;
  rank?: number;
}

async function getNewsletterData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://taopulse.io";

  const [cgRes, statsRes, subnetsRes, validatorsRes, newsRes] =
    await Promise.allSettled([
      // coins/markets returns 7d change on free tier (simple/price does not)
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bittensor,bitcoin,ethereum,solana&price_change_percentage=7d",
        { next: { revalidate: 600 }, signal: AbortSignal.timeout(6000) }
      ),
      fetch(`${base}/api/network-stats`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${base}/api/subnets`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${base}/api/validators`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${base}/api/news/reddit`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      }),
    ]);

  // coins/markets returns an array; build a lookup by id
  const cgRaw: { id: string; current_price: number; market_cap: number; price_change_percentage_24h: number; price_change_percentage_7d_in_currency: number }[] =
    cgRes.status === "fulfilled" && cgRes.value.ok
      ? await cgRes.value.json()
      : [];
  const cgData: Record<string, typeof cgRaw[number]> = {};
  for (const coin of cgRaw) cgData[coin.id] = coin;

  // TAO price/stats from coins/markets response
  const taoEntry = cgData["bittensor"] ?? null;
  const price = taoEntry
    ? {
        usd: taoEntry.current_price,
        usd_market_cap: taoEntry.market_cap,
        usd_24h_change: taoEntry.price_change_percentage_24h,
        usd_7d_change: taoEntry.price_change_percentage_7d_in_currency,
      }
    : null;

  const stats =
    statsRes.status === "fulfilled" && statsRes.value.ok
      ? await statsRes.value.json()
      : null;
  const subnets =
    subnetsRes.status === "fulfilled" && subnetsRes.value.ok
      ? await subnetsRes.value.json()
      : [];
  const validators =
    validatorsRes.status === "fulfilled" && validatorsRes.value.ok
      ? await validatorsRes.value.json()
      : [];

  // Market comparison — extract 7d change from coins/markets response
  let market: Record<string, { usd_7d_change?: number }> | null = null;
  if (cgRaw.length > 0) {
    market = {
      tao: { usd_7d_change: cgData["bittensor"]?.price_change_percentage_7d_in_currency ?? null },
      btc: { usd_7d_change: cgData["bitcoin"]?.price_change_percentage_7d_in_currency ?? null },
      eth: { usd_7d_change: cgData["ethereum"]?.price_change_percentage_7d_in_currency ?? null },
      sol: { usd_7d_change: cgData["solana"]?.price_change_percentage_7d_in_currency ?? null },
    };
  }

  const news: NewsItem[] =
    newsRes.status === "fulfilled" && newsRes.value.ok
      ? await newsRes.value.json()
      : null;

  return { price, stats, subnets, validators, market, news };
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtMc(mc: number) {
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(0)}M`;
  return `$${mc.toFixed(0)}`;
}

function changeColor(n: number | null | undefined) {
  if (n == null) return "text-gray-400";
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

function changeArrow(n: number | null | undefined) {
  if (n == null) return "";
  return n >= 0 ? "▲" : "▼";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTopSubnets(subnets: any[], n = 5) {
  return [...subnets]
    .filter((s) => s.id !== 0)
    .sort((a, b) => b.emission - a.emission)
    .slice(0, n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSubnetSpotlight(subnets: any[]) {
  return (
    [...subnets]
      .filter((s) => s.id !== 0 && s.volume24h != null)
      .sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0))[0] ??
    subnets[1] ??
    null
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBiggestMovers(subnets: any[]) {
  const nonRoot = subnets.filter((s) => s.id !== 0);

  // Check if emission_change_24h field exists
  const hasChange = nonRoot.some(
    (s) => s.emission_change_24h != null && s.emission_change_24h !== 0
  );

  if (hasChange) {
    const sorted = [...nonRoot].sort(
      (a, b) => (b.emission_change_24h ?? 0) - (a.emission_change_24h ?? 0)
    );
    return {
      gainers: sorted.slice(0, 3).filter((s) => (s.emission_change_24h ?? 0) > 0),
      losers: sorted
        .slice(-3)
        .reverse()
        .filter((s) => (s.emission_change_24h ?? 0) < 0),
      mode: "change" as const,
    };
  }

  // Fallback: sort by emission descending — top and bottom
  const sorted = [...nonRoot].sort((a, b) => b.emission - a.emission);
  return {
    gainers: sorted.slice(0, 3),
    losers: sorted.slice(-3).reverse(),
    mode: "emission" as const,
  };
}

const DID_YOU_KNOW = [
  "dTAO converts your TAO into subnet-specific alpha tokens. Unlike classic staking, your TAO is exposed to that subnet token price — higher upside, but also impermanent loss risk.",
  "The Bittensor halving cuts daily emissions in half roughly every 4 years — similar to Bitcoin. The first halving happened December 2025, cutting emissions from 7,200 to 3,600 TAO/day.",
  "Validator fees typically range from 8–18%. A validator charging 10% on a 15% APR effectively gives you ~13.5% net yield. Always check the fee before staking.",
  "TAO has a hard cap of 21 million — identical to Bitcoin. As of early 2026, roughly half has been mined. The deflationary curve mirrors BTC's supply model.",
  "Subnet emissions are voted on by validators through a weight-setting mechanism. Subnets that attract more validator attention earn more TAO per day.",
  "Classic root staking keeps your TAO as TAO. dTAO subnet staking converts it to an alpha token. For most beginners, classic staking is lower risk.",
  "Registration cost to join a subnet as a miner fluctuates based on demand. High-emission subnets often have high registration costs — the market prices in expected yield.",
  "The Subtensor blockchain (Bittensor's chain) is built on Substrate — the same framework as Polkadot. This is why Polkadot-compatible wallets like Talisman support TAO natively.",
];

export default async function NewsletterPage() {
  const { price, stats, subnets, validators, market, news } =
    await getNewsletterData();

  const taoPrice = price?.usd ?? null;
  const change7d = price?.usd_7d_change ?? null;
  const marketCap = price?.usd_market_cap ?? null;
  const topSubnets = getTopSubnets(subnets);
  const spotlight = getSubnetSpotlight(subnets);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topValidators = (validators as any[]).slice(0, 5);

  const issueDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const issueNumber =
    Math.floor(
      (Date.now() - new Date("2026-03-24").getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    ) + 1;

  // Did You Know — rotate by week
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const didYouKnow = DID_YOU_KNOW[weekNumber % 8];

  // Market comparison
  const tao7d = market?.tao?.usd_7d_change ?? null;
  const btc7d = market?.btc?.usd_7d_change ?? null;
  const eth7d = market?.eth?.usd_7d_change ?? null;
  const sol7d = market?.sol?.usd_7d_change ?? null;

  let marketSentence: string | null = null;
  if (tao7d != null && btc7d != null) {
    const diff = Math.abs(tao7d - btc7d).toFixed(1);
    marketSentence =
      tao7d > btc7d
        ? `TAO outperformed BTC by ${diff}% this week.`
        : `TAO underperformed BTC by ${diff}% this week.`;
  }

  // News
  const topNews: NewsItem[] = Array.isArray(news) ? news.slice(0, 5) : [];
  const newsAvailable = topNews.length > 0;

  // Community Pulse — first Reddit item
  const communityItem = Array.isArray(news)
    ? news.find((n) => n.source === "Reddit") ?? news[0] ?? null
    : null;

  // Biggest Movers
  const movers = subnets.length > 0 ? getBiggestMovers(subnets) : null;
  const hasMovers =
    movers &&
    (movers.gainers.length > 0 || movers.losers.length > 0);

  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Header */}
      <div className="bg-[#0f1623] border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">
            Weekly Newsletter
          </p>
          <h1 className="text-3xl font-bold text-white mb-1">⚡ TAO Alpha</h1>
          <p className="text-gray-400 text-sm">
            Weekly TAO Intel — Issue #{issueNumber} · {issueDate}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Section 1 — TAO This Week */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            📊 TAO This Week
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {taoPrice ? `$${fmt(taoPrice)}` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">TAO Price</p>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-4 text-center">
              <p className={`text-2xl font-bold ${changeColor(change7d)}`}>
                {change7d != null
                  ? `${changeArrow(change7d)} ${Math.abs(change7d).toFixed(1)}%`
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">7d Change</p>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {marketCap ? fmtMc(marketCap) : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Market Cap</p>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.stakedPct ? `${stats.stakedPct}%` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">TAO Staked</p>
            </div>
          </div>
        </section>

        {/* Section 2 — TAO vs The Market */}
        {market && (
          <section>
            <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
              📈 TAO vs The Market
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  { label: "TAO", value: tao7d },
                  { label: "BTC", value: btc7d },
                  { label: "ETH", value: eth7d },
                  { label: "SOL", value: sol7d },
                ] as { label: string; value: number | null }[]
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-[#0f1623] rounded-xl border border-white/5 p-4 text-center"
                >
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                    {label}
                  </p>
                  <p className={`text-xl font-bold ${changeColor(value)}`}>
                    {value != null
                      ? `${changeArrow(value)} ${Math.abs(value).toFixed(1)}%`
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">7d change</p>
                </div>
              ))}
            </div>
            {marketSentence && (
              <p className="text-sm text-gray-400 mt-3 px-1">{marketSentence}</p>
            )}
          </section>
        )}

        {/* Section 3 — Top 5 News This Week */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            📰 Top 5 News This Week
          </h2>
          {newsAvailable ? (
            <ol className="space-y-4">
              {topNews.map((item, i) => (
                <li
                  key={item.url}
                  className="bg-[#0f1623] rounded-xl border border-white/5 p-4 flex gap-3"
                >
                  <span className="text-purple-400 font-bold text-sm mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <div className="min-w-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-sm font-medium hover:text-purple-300 transition-colors leading-snug block"
                    >
                      {item.title}
                    </a>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-purple-600/10 text-purple-400 border border-purple-600/20 rounded-full px-2 py-0.5">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1.5">
                      Why it matters: {item.source} community discussion
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500 text-sm">News unavailable this week.</p>
          )}
        </section>

        {/* Section 4 — Emission Report */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            🔥 Emission Report — Top 5 Subnets
          </h2>
          <div className="bg-[#0f1623] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Subnet
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                    Emission %
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">
                    Miners
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSubnets.length > 0 ? (
                  topSubnets.map((s, i) => (
                    <tr
                      key={s.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-xs mr-2">
                          #{i + 1}
                        </span>
                        <span className="text-white font-medium">SN{s.id}</span>
                        <span className="text-gray-400 ml-2 text-xs">
                          {s.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-emerald-400 font-semibold">
                          {(s.emission * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                        {s.activeMiners}
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="text-xs bg-purple-600/10 text-purple-400 border border-purple-600/20 rounded-full px-2 py-0.5">
                          {s.category}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Loading data…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            3,600 TAO distributed daily across all subnets
          </p>
        </section>

        {/* Section 5 — Biggest Movers */}
        {hasMovers && (
          <section>
            <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
              {movers!.mode === "change" ? "🚀 Biggest Movers" : "🏅 Top Emission Subnets"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gainers */}
              {movers!.gainers.length > 0 && (
                <div className="bg-[#0f1623] rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-emerald-500/5">
                    <p className="text-sm font-semibold text-emerald-400">
                      📈 {movers!.mode === "change" ? "Gaining" : "Top Emission"}
                    </p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {movers!.gainers.map((s) => (
                      <div
                        key={s.id}
                        className="px-4 py-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-white">
                          <span className="text-gray-500 text-xs mr-1">SN{s.id}</span>{" "}
                          {s.name}
                        </span>
                        <span className="text-emerald-400 font-semibold text-sm">
                          {movers!.mode === "change"
                            ? `+${(s.emission_change_24h * 100).toFixed(2)}%`
                            : `${(s.emission * 100).toFixed(2)}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Losers */}
              {movers!.losers.length > 0 && (
                <div className="bg-[#0f1623] rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-red-500/5">
                    <p className="text-sm font-semibold text-red-400">
                      📉 {movers!.mode === "change" ? "Losing" : "Lower Emission"}
                    </p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {movers!.losers.map((s) => (
                      <div
                        key={s.id}
                        className="px-4 py-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-white">
                          <span className="text-gray-500 text-xs mr-1">SN{s.id}</span>{" "}
                          {s.name}
                        </span>
                        <span className="text-red-400 font-semibold text-sm">
                          {movers!.mode === "change"
                            ? `${(s.emission_change_24h * 100).toFixed(2)}%`
                            : `${(s.emission * 100).toFixed(2)}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 6 — Validator Rankings */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            🏆 Top Validators
          </h2>
          <div className="bg-[#0f1623] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                    Validator
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                    APR
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                    Fee
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">
                    Stake (TAO)
                  </th>
                </tr>
              </thead>
              <tbody>
                {topValidators.length > 0 ? (
                  topValidators.map((v, i) => (
                    <tr
                      key={v.hotkey || i}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-xs mr-2">#{i + 1}</span>
                        <span className="text-white font-medium">{v.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-semibold">
                        {v.apr}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {v.fee}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                        {v.stake}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Loading data…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7 — Staking Snapshot */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            💰 Staking Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-5 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {topValidators[0]?.apr ?? "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Best Validator APR</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {topValidators[0]?.name ?? ""}
              </p>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-5 text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.stakedPct ? `${stats.stakedPct}%` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Network Staked</p>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-white/5 p-5 text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.activeSubnets ?? "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active Subnets</p>
            </div>
          </div>
          <div className="mt-4 bg-purple-600/5 border border-purple-600/20 rounded-xl p-4">
            <p className="text-sm text-gray-300">
              <span className="text-purple-400 font-semibold">
                This week&apos;s move:
              </span>{" "}
              With TAO staked at {stats?.stakedPct ?? "—"}% of circulating
              supply, classic root staking still offers solid risk-adjusted
              yield. Check{" "}
              <a
                href="https://taopulse.io/staking"
                className="text-purple-400 hover:underline"
              >
                our staking guide
              </a>{" "}
              to compare validators.
            </p>
          </div>
        </section>

        {/* Section 8 — Subnet Spotlight */}
        {spotlight && (
          <section>
            <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
              🔍 Subnet Spotlight — SN{spotlight.id}: {spotlight.name}
            </h2>
            <div className="bg-[#0f1623] rounded-xl border border-purple-600/20 p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-purple-600/10 text-purple-400 border border-purple-600/20 rounded-full px-3 py-1">
                  {spotlight.category}
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1">
                  {(spotlight.emission * 100).toFixed(2)}% emission
                </span>
                <span className="text-xs bg-white/5 text-gray-400 border border-white/10 rounded-full px-3 py-1">
                  {spotlight.activeMiners} miners
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {spotlight.description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {spotlight.activeMiners}
                  </p>
                  <p className="text-xs text-gray-500">Active Miners</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {spotlight.activeValidators}
                  </p>
                  <p className="text-xs text-gray-500">Active Validators</p>
                </div>
              </div>
              {spotlight.website && (
                <a
                  href={spotlight.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300"
                >
                  Visit subnet →
                </a>
              )}
            </div>
          </section>
        )}

        {/* Section 9 — Did You Know? */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            🧠 Did You Know?
          </h2>
          <div className="bg-[#0f1623] rounded-xl border border-blue-500/20 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <p className="text-gray-300 text-sm leading-relaxed">{didYouKnow}</p>
            </div>
          </div>
        </section>

        {/* Section 10 — One Thing to Watch */}
        <section>
          <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
            👀 One Thing to Watch
          </h2>
          <div className="bg-[#0f1623] rounded-xl border border-amber-500/20 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  TAO Halving Countdown
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The next TAO halving will cut daily emissions from 3,600 to
                  1,800 TAO/day.
                  {stats?.blocksToNextHalving
                    ? ` At current block times, that's approximately ${Math.ceil(
                        (stats.blocksToNextHalving * 12) / 86400
                      ).toLocaleString()} days away.`
                    : " Track the live countdown on TaoPulse."}
                  {" "}
                  Historically, halvings precede significant price appreciation
                  as supply shock meets growing demand.
                </p>
                <a
                  href="https://taopulse.io/halving"
                  className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 mt-3"
                >
                  Track the halving countdown →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 11 — Community Pulse */}
        {communityItem && (
          <section>
            <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-600/20 pb-2">
              💬 Community Pulse
            </h2>
            <div className="bg-[#0f1623] rounded-xl border border-purple-600/20 p-6">
              <p className="text-xs text-purple-400 uppercase tracking-widest mb-3 font-semibold">
                🗣️ Top Community Discussion This Week
              </p>
              <a
                href={communityItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-medium hover:text-purple-300 transition-colors leading-snug block mb-4"
              >
                {communityItem.title}
              </a>
              <a
                href="https://www.reddit.com/r/bittensor_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Join the conversation on r/bittensor_ →
              </a>
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="rounded-xl border border-purple-600/20 bg-purple-600/5 p-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Explore more on TaoPulse</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <a
              href="https://taopulse.io/subnets"
              className="text-purple-400 hover:text-purple-300"
            >
              Subnet Explorer →
            </a>
            <span className="text-gray-700">·</span>
            <a
              href="https://taopulse.io/staking"
              className="text-purple-400 hover:text-purple-300"
            >
              Staking Guide →
            </a>
            <span className="text-gray-700">·</span>
            <a
              href="https://taopulse.io/halving"
              className="text-purple-400 hover:text-purple-300"
            >
              Halving Clock →
            </a>
            <span className="text-gray-700">·</span>
            <a
              href="https://taopulse.io/validator-calculator"
              className="text-purple-400 hover:text-purple-300"
            >
              Validator Calc →
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-6">
            You&apos;re receiving this because you subscribed at taopulse.io ·{" "}
            <a href="*|UNSUB|*" className="hover:text-gray-500">
              Unsubscribe
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

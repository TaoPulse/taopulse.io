"use client";

import { useEffect, useState, useCallback } from "react";

interface NewsItem {
  title: string;
  url: string;
  source: "Reddit" | "Community" | "News" | "Blog";
  date: Date;
  summary?: string;
  score?: number;
  comments?: number;
  rank?: number;
}

type FilterTab = "All" | "Reddit" | "News" | "Community" | "Blog";

const BADGE_STYLES: Record<string, string> = {
  Reddit: "bg-orange-500/20 text-orange-400",
  Community: "bg-red-500/20 text-red-400",
  News: "bg-blue-500/20 text-blue-400",
  Blog: "bg-teal-500/20 text-teal-400",
};


function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-16 h-5 bg-white/10 rounded-full" />
        <div className="w-20 h-4 bg-white/10 rounded ml-auto" />
      </div>
      <div className="w-full h-4 bg-white/10 rounded mb-2" />
      <div className="w-3/4 h-4 bg-white/10 rounded mb-3" />
      <div className="w-24 h-3 bg-white/10 rounded" />
    </div>
  );
}

interface ApiNewsItem {
  title: string;
  url: string;
  source: "Reddit" | "Community" | "News" | "Blog";
  date: string;
  summary?: string;
  score?: number;
  comments?: number;
  rank?: number;
}

async function fetchRedditNews(): Promise<NewsItem[]> {
  const res = await fetch("/api/news/reddit");
  if (!res.ok) throw new Error("Reddit API fetch failed");
  const json: ApiNewsItem[] = await res.json();
  return json.map((item) => ({ ...item, date: new Date(item.date) }));
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [taoPrice, setTaoPrice] = useState<{
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
  } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      fetchRedditNews(),
    ]);

    const allItems: NewsItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const deduped = allItems.filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

    deduped.sort((a, b) => b.date.getTime() - a.date.getTime());
    setItems(deduped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_market_cap=true&include_24hr_change=true"
        );
        if (!res.ok) return;
        const data = await res.json();
        setTaoPrice(data.bittensor);
      } catch {
        // silent
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Only show tabs that have results (always show "All")
  const allTabs: FilterTab[] = ["All", "News", "Reddit", "Community", "Blog"];
  const sourcesWithItems = new Set(items.map((i) => i.source));
  const visibleTabs = allTabs.filter(
    (tab) => tab === "All" || sourcesWithItems.has(tab as NewsItem["source"])
  );

  const filteredItems =
    activeFilter === "All"
      ? items
      : items.filter((i) => i.source === activeFilter);

  const trendingReddit = [...items]
    .filter((i) => i.source === "Reddit" || i.source === "Community")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Hero */}
      <section className="border-b border-white/5 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                TAO News &amp; Updates
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Latest Bittensor news from Reddit, crypto media, and the
                community
              </p>
            </div>
            {/* Live TAO price badge */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {taoPrice ? (
                <>
                  <span className="text-2xl font-bold text-white tabular-nums">
                    $
                    {taoPrice.usd.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-sm font-semibold ${
                      taoPrice.usd_24h_change >= 0
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {taoPrice.usd_24h_change >= 0 ? "+" : ""}
                    {taoPrice.usd_24h_change.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    MCap:{" "}
                    {taoPrice.usd_market_cap >= 1e9
                      ? `$${(taoPrice.usd_market_cap / 1e9).toFixed(1)}B`
                      : `$${(taoPrice.usd_market_cap / 1e6).toFixed(0)}M`}
                  </span>
                  <span className="text-xs text-gray-500">TAO</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-8 bg-white/10 rounded animate-pulse" />
                  <div className="w-12 h-6 bg-white/10 rounded animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs + Refresh */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="ml-auto px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
          <span className="text-xs text-gray-600 whitespace-nowrap shrink-0 hidden sm:block">
            Auto-refreshes every 5 min
          </span>
        </div>

        <div className="flex gap-8">
          {/* Main news grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg font-medium">No TAO news found</p>
                <p className="text-sm mt-1">
                  {items.length > 0
                    ? `No results for this filter. Try "All" to see ${items.length} item${items.length === 1 ? "" : "s"} from other sources.`
                    : "All sources failed to load. Please try again later."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item, idx) => (
                  <a
                    key={`${item.url}-${idx}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-xl p-5 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      {item.rank && item.rank <= 3 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                          item.rank === 2 ? "bg-gray-400/20 text-gray-300" :
                          "bg-orange-700/20 text-orange-400"
                        }`}>
                          #{item.rank}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          BADGE_STYLES[item.source]
                        }`}
                      >
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {timeAgo(item.date)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-3">
                      {item.source === "Reddit" && item.score != null && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          ▲ {item.score}
                          {item.comments != null && <> · 💬 {item.comments}</>}
                        </span>
                      )}
                      <span className="text-xs text-purple-400 group-hover:text-purple-300 ml-auto">
                        Read More →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-5">
            {/* Trending on Reddit */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Trending on Reddit
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-white/10 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : trendingReddit.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No Reddit data available.
                </p>
              ) : (
                <ol className="space-y-3">
                  {trendingReddit.map((item, i) => (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 group"
                      >
                        <span className="text-xs font-bold text-gray-600 tabular-nums w-4 shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </p>
                          {item.score != null && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {item.score} pts
                            </p>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* TAO Price widget */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                TAO Price
              </h2>
              {taoPrice ? (
                <div className="space-y-2">
                  <span className="text-2xl font-bold text-white tabular-nums">
                    $
                    {taoPrice.usd.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                        taoPrice.usd_24h_change >= 0
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {taoPrice.usd_24h_change >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(taoPrice.usd_24h_change).toFixed(2)}% 24h
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    MCap:{" "}
                    {taoPrice.usd_market_cap >= 1e9
                      ? `$${(taoPrice.usd_market_cap / 1e9).toFixed(1)}B`
                      : `$${(taoPrice.usd_market_cap / 1e6).toFixed(0)}M`}
                  </p>
                  <p className="text-xs text-gray-600">Updates every 30s</p>
                </div>
              ) : (
                <div className="space-y-2 animate-pulse">
                  <div className="h-8 bg-white/10 rounded" />
                  <div className="h-4 w-20 bg-white/10 rounded" />
                </div>
              )}
            </div>

            {/* Sources legend */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                Sources
              </h2>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  Google News (Bittensor)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  r/bittensor_ (Reddit)
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

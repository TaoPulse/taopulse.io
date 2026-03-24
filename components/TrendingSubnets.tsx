"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TrendingSubnet {
  id: number;
  name: string;
  category: string;
  emission: number;
  activeMiners: number;
  activeValidators: number;
  change?: string;
}

interface TrendingResponse {
  subnets: TrendingSubnet[];
  isLive: boolean;
  lastUpdated: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "LLM/Text": "bg-purple-500/20 text-purple-300",
  "Inference": "bg-blue-500/20 text-blue-300",
  "Training": "bg-cyan-500/20 text-cyan-300",
  "Vision": "bg-pink-500/20 text-pink-300",
  "Finance/Quant": "bg-emerald-500/20 text-emerald-300",
  "Compute/GPU": "bg-orange-500/20 text-orange-300",
  "Data": "bg-yellow-500/20 text-yellow-300",
  "Storage": "bg-indigo-500/20 text-indigo-300",
  "Agents": "bg-rose-500/20 text-rose-300",
  "Other": "bg-gray-500/20 text-gray-400",
};

function formatLastUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1623] p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-6 rounded bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-white/10" />
      </div>
      <div className="w-24 h-4 rounded bg-white/10 mb-1" />
      <div className="w-32 h-3 rounded bg-white/10 mb-3" />
      <div className="w-full h-1.5 rounded-full bg-white/10 mb-3" />
      <div className="w-20 h-3 rounded bg-white/10" />
    </div>
  );
}

export default function TrendingSubnets() {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/trending-subnets");
      if (!res.ok) throw new Error("fetch failed");
      const json: TrendingResponse = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 text-center text-sm text-gray-500">
        Data temporarily unavailable —{" "}
        <a
          href="https://taostats.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline transition-colors"
        >
          see taostats.io
        </a>
      </div>
    );
  }

  const maxEmission = data ? Math.max(...data.subnets.map((s) => s.emission)) : 1;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : data?.subnets.map((subnet, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const emissionPct = (subnet.emission * 100).toFixed(2);
              const barWidth = Math.max(4, (subnet.emission / maxEmission) * 100);
              const catColor = CATEGORY_COLORS[subnet.category] ?? CATEGORY_COLORS["Other"];
              const rankColor = isTop3 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/5 text-gray-400";
              const cardBorder = isTop3
                ? "border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.08)]"
                : "border-white/10";

              return (
                <Link
                  key={subnet.id}
                  href={`/subnets/${subnet.id}`}
                  className={`rounded-xl border bg-[#0f1623] p-4 hover:bg-[#131d2e] transition-colors group ${cardBorder}`}
                >
                  {/* Top row: rank + category */}
                  <div className="flex items-start justify-between mb-2.5">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${rankColor}`}>
                      #{rank}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${catColor}`}>
                      {subnet.category}
                    </span>
                  </div>

                  {/* ID + name */}
                  <p className="text-xs text-gray-500 mb-0.5">SN{subnet.id}</p>
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors leading-tight mb-2 truncate">
                    {subnet.name}
                  </p>

                  {/* Emission */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Emission</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-white">{emissionPct}%</span>
                        {subnet.change && (
                          <span
                            className={`text-xs font-medium ${
                              subnet.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {subnet.change}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isTop3 ? "bg-amber-400" : "bg-purple-500"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Miners */}
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400">{subnet.activeMiners.toLocaleString()}</span> miners
                  </p>
                </Link>
              );
            })}
      </div>

      {/* Footer note */}
      {data && (
        <p className="mt-3 text-xs text-gray-600">
          Sorted by emission share ·{" "}
          {data.isLive ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Live from TaoStats
            </span>
          ) : (
            <span>Based on last known data</span>
          )}{" "}
          · updated {formatLastUpdated(data.lastUpdated)}
        </p>
      )}
    </div>
  );
}

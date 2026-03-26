"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Whale = {
  rank: number;
  address: string;
  balance_total: number;
  balance_free: number;
  balance_staked: number;
  balance_total_24hr_ago: number | null;
  change_24hr: number | null;
  change_24hr_pct: number | null;
  label: "validator" | "exchange" | "foundation" | "unknown";
  label_name: string | null;
};

const PAGE_SIZE = 100;
const REFRESH_MS = 30 * 60 * 1000;

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtChange(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
}


function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy address"
      className="ml-1.5 text-gray-500 hover:text-gray-300 transition-colors shrink-0"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#080d14] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-80 bg-white/5 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-12 border-b border-white/5 bg-white/5 animate-pulse" style={{ opacity: 1 - i * 0.06 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2);

  return (
    <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      {visible.reduce<(number | "…")[]>((acc, p, idx) => {
        if (idx > 0 && p - (visible[idx - 1] as number) > 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []).map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item as number)}
            className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
              item === page
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

export default function WhalesPage() {
  const [whales, setWhales] = useState<Whale[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/whales");
      if (!res.ok) throw new Error("Failed to load whale data");
      const data: Whale[] = await res.json();
      setWhales(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  if (!whales && !error) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = whales!;
  const sold = data.filter((w) => w.change_24hr !== null && w.change_24hr < -0.01).length;
  const accumulated = data.filter((w) => w.change_24hr !== null && w.change_24hr > 0.01).length;
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#080d14] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">TAO Whale Tracker</h1>
          <p className="text-gray-400 text-sm">
            Top {data.length.toLocaleString()} wallets by TAO holdings. Updated every 30 minutes.
          </p>
          {lastUpdated && (
            <p className="text-gray-600 text-xs mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#0f1623] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Total Wallets</p>
            <p className="text-xl font-bold text-white">{data.length.toLocaleString()}</p>
          </div>
          <div className="bg-[#0f1623] border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Sold (24h)</p>
            <p className="text-xl font-bold text-red-400">{sold.toLocaleString()} wallets</p>
          </div>
          <div className="bg-[#0f1623] border border-emerald-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Accumulated (24h)</p>
            <p className="text-xl font-bold text-emerald-400">{accumulated.toLocaleString()} wallets</p>
          </div>
        </div>

        {/* Pagination — top */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}

        {/* Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f1623] border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total TAO</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Free TAO</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Staked TAO</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((whale) => {
                  const sold = whale.change_24hr !== null && whale.change_24hr < -0.01;
                  const accumulated = whale.change_24hr !== null && whale.change_24hr > 0.01;
                  const rowBg = sold
                    ? "bg-red-500/5 hover:bg-red-500/10"
                    : accumulated
                    ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                    : "hover:bg-white/5";

                  const changeColor =
                    whale.change_24hr === null || Math.abs(whale.change_24hr) < 0.01
                      ? "text-gray-600"
                      : whale.change_24hr > 0
                      ? "text-emerald-400"
                      : "text-red-400";

                  return (
                    <tr
                      key={whale.address}
                      className={`border-b border-white/5 transition-colors ${rowBg}`}
                    >
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{whale.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/wallet/${whale.address}`}
                            className="font-mono text-xs text-gray-400 hover:text-purple-400 transition-colors truncate max-w-[160px] sm:max-w-[240px] lg:max-w-none"
                            title={whale.address}
                          >
                            {whale.address}
                          </Link>
                          <CopyButton text={whale.address} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white tabular-nums">
                        {fmt(whale.balance_total)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 tabular-nums hidden md:table-cell">
                        {fmt(whale.balance_free)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 tabular-nums hidden md:table-cell">
                        {fmt(whale.balance_staked)}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-medium ${changeColor}`}>
                        {whale.change_24hr === null ? (
                          <span className="text-gray-600">—</span>
                        ) : (
                          <span>
                            {fmtChange(whale.change_24hr)} TAO
                            {whale.change_24hr_pct !== null && (
                              <span className="text-xs ml-1 opacity-70">
                                ({fmtChange(whale.change_24hr_pct)}%)
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}

        <p className="text-center text-gray-700 text-xs mt-4">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} of {data.length.toLocaleString()} wallets
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";

type Whale = {
  rank: number;
  address: string;
  balance_total: number;
  balance_free: number;
  balance_staked: number;
  change_24hr: number | null;
  change_24hr_pct: number | null;
  label: "validator" | "exchange" | "foundation" | "unknown";
  label_name: string | null;
};

type Transfer = {
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: string | null;
  block: number | null;
  extrinsic_id: string | null;
};

type Delegation = {
  action: string;
  amount: number;
  hotkey: string;
  netuid: number | null;
  validator_name: string | null;
  timestamp: string | null;
  block: number | null;
};

type WalletDetail = {
  transfers: Transfer[];
  delegations: Delegation[];
  last_active: string | null;
  recently_unstaked: boolean;
};

type SortKey = "rank" | "balance_total" | "balance_free" | "balance_staked" | "change_24hr";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 100;
const REFRESH_MS = 30 * 60 * 1000;

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtChange(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
}

function fmtDate(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function truncate(addr: string, chars = 8): string {
  if (!addr || addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-gray-600">↕</span>;
  return <span className="ml-1 text-purple-400">{dir === "asc" ? "↑" : "↓"}</span>;
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
      onClick={(e) => { e.stopPropagation(); handleCopy(); }}
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

function ExpandedRow({ address, whale }: { address: string; whale: Whale }) {
  const [detail, setDetail] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/whale-detail?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [address]);

  return (
    <tr className="bg-[#0a1020] border-b border-white/10">
      <td colSpan={6} className="px-4 py-5">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading wallet activity…
          </div>
        )}
        {error && <p className="text-red-400 text-sm">Failed to load: {error}</p>}
        {detail && (
          <div className="space-y-5">
            {/* Header strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {detail.recently_unstaked && (
                <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-3 py-1 font-semibold">
                  ⚠️ Recently Unstaked
                </span>
              )}
              {detail.last_active && (
                <span className="text-gray-500">
                  Last active: <span className="text-gray-300">{fmtDate(detail.last_active)}</span>
                </span>
              )}
              <Link
                href={`/wallet/${address}`}
                className="ml-auto text-purple-400 hover:text-purple-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Full profile →
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Transfers */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Recent Transfers
                </h3>
                {detail.transfers.length === 0 ? (
                  <p className="text-gray-600 text-xs">No recent transfers</p>
                ) : (
                  <div className="space-y-1.5">
                    {detail.transfers.map((t, i) => {
                      const isSender = t.from === address;
                      const counterparty = isSender ? t.to : t.from;
                      return (
                        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                          <span className={`shrink-0 font-semibold ${isSender ? "text-red-400" : "text-emerald-400"}`}>
                            {isSender ? "OUT" : "IN"}
                          </span>
                          <span className="font-medium text-white tabular-nums">
                            {fmt(t.amount)} TAO
                          </span>
                          <span className="text-gray-600 shrink-0">{isSender ? "to" : "from"}</span>
                          <span className="font-mono text-gray-400 truncate">{truncate(counterparty)}</span>
                          <span className="ml-auto text-gray-600 shrink-0">{fmtDate(t.timestamp)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delegation History */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Delegation History
                </h3>
                {detail.delegations.length === 0 ? (
                  <p className="text-gray-600 text-xs">No recent delegation activity</p>
                ) : (
                  <div className="space-y-1.5">
                    {detail.delegations.map((d, i) => {
                      const isUnstake = d.action?.toUpperCase().includes("UNDELEGATE");
                      return (
                        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                          <span className={`shrink-0 font-semibold ${isUnstake ? "text-orange-400" : "text-blue-400"}`}>
                            {isUnstake ? "UNSTAKE" : "STAKE"}
                          </span>
                          <span className="font-medium text-white tabular-nums">
                            {fmt(d.amount)} TAO
                          </span>
                          {d.validator_name ? (
                            <span className="text-gray-400 truncate">{d.validator_name}</span>
                          ) : (
                            <span className="font-mono text-gray-600 truncate">{truncate(d.hotkey, 6)}</span>
                          )}
                          {d.netuid !== null && (
                            <span className="shrink-0 bg-purple-500/20 text-purple-300 rounded px-1">SN{d.netuid}</span>
                          )}
                          <span className="ml-auto text-gray-600 shrink-0">{fmtDate(d.timestamp)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Whale summary */}
            <div className="flex flex-wrap gap-4 text-xs border-t border-white/5 pt-3">
              <div>
                <span className="text-gray-600">Free TAO: </span>
                <span className="text-white font-medium">{fmt(whale.balance_free)}</span>
              </div>
              <div>
                <span className="text-gray-600">Staked TAO: </span>
                <span className="text-white font-medium">{fmt(whale.balance_staked)}</span>
              </div>
              <div>
                <span className="text-gray-600">Staked %: </span>
                <span className="text-white font-medium">
                  {whale.balance_total > 0
                    ? ((whale.balance_staked / whale.balance_total) * 100).toFixed(1) + "%"
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
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
    <div className="flex items-center justify-center gap-1 my-4 flex-wrap">
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
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
    setPage(1);
  };

  const sortedData = useMemo(() => {
    if (!whales) return [];
    return [...whales].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "change_24hr") {
        av = a.change_24hr ?? -Infinity;
        bv = b.change_24hr ?? -Infinity;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [whales, sortKey, sortDir]);

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

  const data = sortedData;
  const sold = whales!.filter((w) => w.change_24hr !== null && w.change_24hr < -0.01).length;
  const accumulated = whales!.filter((w) => w.change_24hr !== null && w.change_24hr > 0.01).length;
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const thClass = "px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none transition-colors";

  return (
    <div className="min-h-screen bg-[#080d14] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">TAO Whale Tracker</h1>
          <p className="text-gray-400 text-sm">
            Top {whales!.length.toLocaleString()} wallets by TAO holdings. Click any row to see activity. Updated every 30 minutes.
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
            <p className="text-xl font-bold text-white">{whales!.length.toLocaleString()}</p>
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
          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); setExpandedAddress(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}

        {/* Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f1623] border-b border-white/10">
                  <th className="px-4 py-3 w-6" />
                  <th className={`text-left ${thClass} w-12`} onClick={() => handleSort("rank")}>
                    # <SortIcon active={sortKey === "rank"} dir={sortDir} />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                  <th className={`text-right ${thClass}`} onClick={() => handleSort("balance_total")}>
                    Total TAO <SortIcon active={sortKey === "balance_total"} dir={sortDir} />
                  </th>
                  <th className={`text-right ${thClass} hidden md:table-cell`} onClick={() => handleSort("balance_free")}>
                    Free TAO <SortIcon active={sortKey === "balance_free"} dir={sortDir} />
                  </th>
                  <th className={`text-right ${thClass} hidden md:table-cell`} onClick={() => handleSort("balance_staked")}>
                    Staked TAO <SortIcon active={sortKey === "balance_staked"} dir={sortDir} />
                  </th>
                  <th className={`text-right ${thClass}`} onClick={() => handleSort("change_24hr")}>
                    24h Change <SortIcon active={sortKey === "change_24hr"} dir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((whale) => {
                  const isSold = whale.change_24hr !== null && whale.change_24hr < -0.01;
                  const isAccum = whale.change_24hr !== null && whale.change_24hr > 0.01;
                  const isExpanded = expandedAddress === whale.address;

                  const rowBg = isExpanded
                    ? "bg-[#0d1728] border-purple-500/30"
                    : isSold
                    ? "bg-red-500/5 hover:bg-red-500/10"
                    : isAccum
                    ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                    : "hover:bg-white/5";

                  const changeColor =
                    whale.change_24hr === null || Math.abs(whale.change_24hr) < 0.01
                      ? "text-gray-600"
                      : whale.change_24hr > 0
                      ? "text-emerald-400"
                      : "text-red-400";

                  return (
                    <>
                      <tr
                        key={whale.address}
                        onClick={() => setExpandedAddress(isExpanded ? null : whale.address)}
                        className={`border-b border-white/5 transition-colors cursor-pointer ${rowBg}`}
                      >
                        {/* Expand chevron */}
                        <td className="pl-4 pr-1 py-3 text-gray-600">
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90 text-purple-400" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{whale.rank}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/wallet/${whale.address}`}
                              className="font-mono text-xs text-gray-400 hover:text-purple-400 transition-colors truncate max-w-[160px] sm:max-w-[240px] lg:max-w-none"
                              title={whale.address}
                              onClick={(e) => e.stopPropagation()}
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
                      {isExpanded && <ExpandedRow key={`detail-${whale.address}`} address={whale.address} whale={whale} />}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination — bottom */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); setExpandedAddress(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}

        <p className="text-center text-gray-700 text-xs mt-2">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} of {data.length.toLocaleString()} wallets · Click any row to expand
        </p>
      </div>
    </div>
  );
}

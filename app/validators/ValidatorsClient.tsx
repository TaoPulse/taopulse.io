"use client";

import { useState } from "react";

export interface ValidatorRow {
  name: string;
  hotkey: string;
  fee: string;
  apr: string;
  aprRaw: number;
  stake: string;
  stakeRaw: number;
  nominators: number;
  uptime: string | null;
  subnets: number | null;
}

type SortKey = "stakeRaw" | "aprRaw" | "nominators" | "fee" | "subnets" | "annualEarningsUsd";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 inline-flex flex-col gap-0 ${active ? "text-purple-400" : "text-gray-600"}`}>
      <svg className={`w-2.5 h-2.5 ${active && dir === "asc" ? "text-purple-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 10 6">
        <path d="M5 0L10 6H0L5 0Z" />
      </svg>
      <svg className={`w-2.5 h-2.5 ${active && dir === "desc" ? "text-purple-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 10 6">
        <path d="M5 6L0 0H10L5 6Z" />
      </svg>
    </span>
  );
}

function feeNum(fee: string) {
  return parseFloat(fee.replace("%", "")) || 0;
}

// Root network staking: no validator fee, ~18% APR estimate
// Shown as a pinned comparison row at the top of the table
const ROOT_STAKING_APR = 18.0; // estimated, labeled as ~est.

export default function ValidatorsClient({ validators }: { validators: ValidatorRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("annualEarningsUsd");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [stakeAmount, setStakeAmount] = useState<string>("10");
  const [showCalculator, setShowCalculator] = useState<boolean>(true);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const stakeNum = parseFloat(stakeAmount) || 0;

  const computeEarnings = (v: ValidatorRow) => {
    const feeNum = parseFloat(v.fee.replace("%", "")) || 0;
    const netApr = v.aprRaw * (1 - feeNum / 100);
    const annualTao = stakeNum * (netApr / 100);
    return { annualTao, netApr: netApr };
  };

  const sorted = [...validators].sort((a, b) => {
    let av = 0;
    let bv = 0;
    if (sortKey === "stakeRaw") { av = a.stakeRaw; bv = b.stakeRaw; }
    else if (sortKey === "aprRaw") { av = a.aprRaw; bv = b.aprRaw; }
    else if (sortKey === "nominators") { av = a.nominators; bv = b.nominators; }
    else if (sortKey === "fee") { av = feeNum(a.fee); bv = feeNum(b.fee); }
    else if (sortKey === "subnets") { av = a.subnets ?? -1; bv = b.subnets ?? -1; }
    else if (sortKey === "annualEarningsUsd") { av = computeEarnings(a).annualTao; bv = computeEarnings(b).annualTao; }
    return sortDir === "desc" ? bv - av : av - bv;
  });

  function thClass(key: SortKey) {
    return `px-3 py-3 font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-gray-300 transition-colors ${sortKey === key ? "text-purple-400" : ""}`;
  }

  return (
    <div className="space-y-4">
      {/* Calculator Toggle & Input */}
      {showCalculator && (
        <div className="rounded-xl border border-white/10 bg-[#0f1623] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                How much TAO would you like to stake?
              </label>
              <p className="text-xs text-gray-600">Enter any amount to see estimated annual earnings per validator</p>
            </div>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-gray-600 hover:text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 10"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full rounded-lg bg-[#080d14] border border-white/10 text-white px-4 py-2.5 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors"
              />
            </div>
            <span className="text-gray-400 font-medium px-3">TAO</span>
          </div>
        </div>
      )}

      {/* Quick toggle to show calculator */}
      {!showCalculator && (
        <button
          onClick={() => setShowCalculator(true)}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium"
        >
          ⚡ Calculate your earnings
        </button>
      )}

      {/* Validator Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#080d14] border-b border-white/10">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Top Bittensor Validators
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live · refreshes every 5 min
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#080d14] border-b border-white/10 text-xs">
              <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Validator</th>
              <th
                className={`${thClass("stakeRaw")} text-right`}
                onClick={() => handleSort("stakeRaw")}
              >
                Stake (TAO)
                <SortIcon active={sortKey === "stakeRaw"} dir={sortDir} />
              </th>
              <th
                className={`${thClass("aprRaw")} text-right`}
                onClick={() => handleSort("aprRaw")}
              >
                APR (est.)
                <SortIcon active={sortKey === "aprRaw"} dir={sortDir} />
              </th>
              <th
                className={`${thClass("fee")} text-right`}
                onClick={() => handleSort("fee")}
              >
                Fee
                <SortIcon active={sortKey === "fee"} dir={sortDir} />
              </th>
              <th
                className={`${thClass("nominators")} text-right hidden sm:table-cell`}
                onClick={() => handleSort("nominators")}
              >
                Nominators
                <SortIcon active={sortKey === "nominators"} dir={sortDir} />
              </th>
              <th
                className={`${thClass("subnets")} text-right hidden md:table-cell`}
                onClick={() => handleSort("subnets")}
              >
                Subnets
                <SortIcon active={sortKey === "subnets"} dir={sortDir} />
              </th>
              <th className="px-3 py-3 text-right font-semibold text-gray-500 uppercase tracking-wider text-xs hidden lg:table-cell">
                Status
              </th>
              {stakeNum > 0 && (
                <>
                  <th
                    className={`${thClass("annualEarningsUsd")} text-right`}
                    onClick={() => handleSort("annualEarningsUsd")}
                  >
                    Annual Earnings (TAO)
                    <SortIcon active={sortKey === "annualEarningsUsd"} dir={sortDir} />
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* ── Root Network Staking (pinned comparison row) ── */}
            {stakeNum > 0 && (
              <tr className="bg-yellow-500/5 border-l-2 border-yellow-500/50 hover:bg-yellow-500/10 transition-colors">
                <td className="px-3 py-3">
                  <span className="text-yellow-500 text-xs font-bold">★</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-yellow-300">Root Network Staking</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-medium">No validator fee</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Stake directly to the root network — earns TAO with no intermediary fee</div>
                </td>
                <td className="px-3 py-3 text-right text-gray-500 text-xs">—</td>
                <td className="px-3 py-3 text-right">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">
                    ~{ROOT_STAKING_APR.toFixed(1)}% (est.)
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="text-xs text-yellow-400 font-semibold">0%</span>
                </td>
                <td className="px-3 py-3 text-right text-gray-500 hidden sm:table-cell">—</td>
                <td className="px-3 py-3 text-right text-gray-500 hidden md:table-cell">—</td>
                <td className="px-3 py-3 text-right hidden lg:table-cell">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-400">Active</span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="text-sm font-bold text-yellow-300 tabular-nums">
                    {(stakeNum * (ROOT_STAKING_APR / 100)).toLocaleString("en-US", { maximumFractionDigits: 2 })} τ
                  </div>
                  <div className="text-[10px] text-yellow-600 mt-0.5">~est.</div>
                </td>
              </tr>
            )}

            {sorted.map((v, i) => {
              const { annualTao } = computeEarnings(v);
              return (
                <tr key={v.hotkey || i} className="hover:bg-purple-600/5 transition-colors">
                  <td className="px-3 py-3 text-gray-600 text-xs">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-white">{v.name}</div>
                    <div className="text-xs text-gray-600 font-mono mt-0.5 truncate max-w-[200px]" title={v.hotkey}>
                      {v.hotkey ? `${v.hotkey.slice(0, 8)}…${v.hotkey.slice(-6)}` : "—"}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-300 tabular-nums">{v.stake}</td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                      {v.apr}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-300">{v.fee}</td>
                  <td className="px-3 py-3 text-right text-gray-400 hidden sm:table-cell tabular-nums">
                    {v.nominators?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-400 hidden md:table-cell tabular-nums">
                    {v.subnets !== null ? v.subnets : "—"}
                  </td>
                  <td className="px-3 py-3 text-right hidden lg:table-cell">
                    {v.uptime ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        v.uptime === "Active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : v.uptime === "Inactive"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-blue-500/15 text-blue-400"
                      }`}>
                        {v.uptime}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  {stakeNum > 0 && (
                    <td className="px-3 py-3 text-right">
                      <div className="text-sm font-semibold text-emerald-400 tabular-nums">
                        {annualTao.toLocaleString("en-US", { maximumFractionDigits: 2 })} τ
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

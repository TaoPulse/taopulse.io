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

type SortKey = "stakeRaw" | "aprRaw" | "nominators" | "fee" | "subnets";
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

export default function ValidatorsClient({ validators }: { validators: ValidatorRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("stakeRaw");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...validators].sort((a, b) => {
    let av = 0;
    let bv = 0;
    if (sortKey === "stakeRaw") { av = a.stakeRaw; bv = b.stakeRaw; }
    else if (sortKey === "aprRaw") { av = a.aprRaw; bv = b.aprRaw; }
    else if (sortKey === "nominators") { av = a.nominators; bv = b.nominators; }
    else if (sortKey === "fee") { av = feeNum(a.fee); bv = feeNum(b.fee); }
    else if (sortKey === "subnets") { av = a.subnets ?? -1; bv = b.subnets ?? -1; }
    return sortDir === "desc" ? bv - av : av - bv;
  });

  function thClass(key: SortKey) {
    return `px-3 py-3 font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-gray-300 transition-colors ${sortKey === key ? "text-purple-400" : ""}`;
  }

  return (
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
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map((v, i) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

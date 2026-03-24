"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Subnet {
  id: number;
  name: string;
  category: string;
  description: string;
  emission: number;
  activeMiners: number;
  activeValidators: number;
  website: string | null;
  status: "active" | "low-activity" | "inactive";
}

interface SubnetTableProps {
  subnets: Subnet[];
}

type SortKey = "id" | "name" | "emission" | "activeMiners";
type SortDir = "asc" | "desc";

const CATEGORY_COLORS: Record<string, string> = {
  "LLM/Text": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Inference": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Training": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Finance/Quant": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Data": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Storage": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Compute/GPU": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Vision": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "Audio": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Agents": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Other": "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const STATUS_STYLES = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "low-activity": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const CATEGORIES = [
  "All",
  "LLM/Text",
  "Inference",
  "Training",
  "Finance/Quant",
  "Data",
  "Storage",
  "Compute/GPU",
  "Vision",
  "Audio",
  "Agents",
  "Other",
];

export default function SubnetTable({ subnets }: SubnetTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("emission");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    let result = subnets;
    if (categoryFilter !== "All") {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          String(s.id).includes(q)
      );
    }
    return [...result].sort((a, b) => {
      const aVal = sortKey === "name" ? a.name.toLowerCase() : (a[sortKey] as number);
      const bVal = sortKey === "name" ? b.name.toLowerCase() : (b[sortKey] as number);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [subnets, sortKey, sortDir, categoryFilter, search]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return (
        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    return sortDir === "asc" ? (
      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Emission bar: max emission in dataset drives the scale
  const maxEmission = useMemo(() => Math.max(...subnets.map((s) => s.emission), 0.01), [subnets]);

  return (
    <div className="space-y-4">
      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or SN#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0f1623] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Sort:</span>
          {(["emission", "activeMiners", "id"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sortKey === key
                  ? "bg-purple-600/20 text-purple-400 border-purple-600/40"
                  : "text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {key === "emission" ? "Emission" : key === "activeMiners" ? "Miners" : "ID"}
              {sortKey === key && (
                <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === cat
                ? "bg-purple-600 text-white border-purple-600"
                : "text-gray-400 border-white/10 hover:border-purple-600/50 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500 self-center">{filtered.length} subnets</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0a0f1a] border-b border-white/10">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white transition-colors"
                >
                  SN# <SortIcon col="id" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Name <SortIcon col="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Category
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("emission")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white transition-colors ml-auto"
                >
                  Emission <SortIcon col="emission" />
                </button>
              </th>
              <th className="px-4 py-3 text-right hidden md:table-cell">
                <button
                  onClick={() => handleSort("activeMiners")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white transition-colors ml-auto"
                >
                  Miners <SortIcon col="activeMiners" />
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Validators
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((subnet, idx) => {
              const emissionPct = (subnet.emission * 100).toFixed(subnet.emission >= 0.01 ? 2 : subnet.emission > 0 ? 3 : 1);
              const barWidth = maxEmission > 0 ? Math.round((subnet.emission / maxEmission) * 100) : 0;
              // Color intensity based on emission relative to max
              const barColor =
                barWidth >= 70
                  ? "bg-purple-400"
                  : barWidth >= 40
                  ? "bg-purple-500"
                  : barWidth >= 15
                  ? "bg-purple-600"
                  : "bg-purple-800";

              return (
                <tr
                  key={subnet.id}
                  onClick={() => router.push(`/subnets/${subnet.id}`)}
                  className={`cursor-pointer transition-colors hover:bg-purple-600/5 ${
                    idx % 2 === 0 ? "bg-[#0f1623]" : "bg-[#0b1019]"
                  }`}
                >
                  <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                    {String(subnet.id).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-medium text-white">{subnet.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate hidden sm:block">
                        {subnet.description.split(".")[0]}.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        CATEGORY_COLORS[subnet.category] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {subnet.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-medium text-sm ${subnet.emission >= 0.01 ? "text-emerald-400" : "text-gray-400"}`}>
                        {emissionPct}%
                      </span>
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-gray-300 hidden md:table-cell">
                    {subnet.activeMiners.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right text-gray-300 hidden lg:table-cell">
                    {subnet.activeValidators.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[subnet.status]}`}
                    >
                      {subnet.status === "active"
                        ? "Active"
                        : subnet.status === "low-activity"
                        ? "Low"
                        : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

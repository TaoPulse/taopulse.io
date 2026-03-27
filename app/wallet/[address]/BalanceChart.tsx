"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DataPoint = {
  date: string;
  total: number;
  staked: number;
  free: number;
};

type Range = "7d" | "30d" | "90d" | "all";

const RANGES: { label: string; value: Range; days: number }[] = [
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
  { label: "All", value: "all", days: 365 },
];

function fmtTao(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.find((p: { dataKey: string }) => p.dataKey === "total")?.value;
  const staked = payload.find((p: { dataKey: string }) => p.dataKey === "staked")?.value;
  const free = payload.find((p: { dataKey: string }) => p.dataKey === "free")?.value;

  return (
    <div className="bg-[#0f1623] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400 mb-1.5">{label}</p>
      {total != null && (
        <p className="text-white font-semibold">Total: {fmtTao(total)} TAO</p>
      )}
      {staked != null && staked > 0 && (
        <p className="text-purple-400">Staked: {fmtTao(staked)} TAO</p>
      )}
      {free != null && free > 0 && (
        <p className="text-emerald-400">Free: {fmtTao(free)} TAO</p>
      )}
    </div>
  );
}

export default function BalanceChart({ address }: { address: string }) {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const days = RANGES.find((r) => r.value === range)?.days ?? 30;
    fetch(`/api/wallet-history?address=${address}&days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setData(d);
        } else {
          setError("No history data available");
        }
      })
      .catch(() => setError("Failed to load chart data"))
      .finally(() => setLoading(false));
  }, [address, range]);

  const displayData = data?.slice(-(RANGES.find((r) => r.value === range)?.days ?? 30));

  return (
    <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">Balance History</h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                range === r.value
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="h-48 flex items-center justify-center text-sm text-gray-500">
          {error}
        </div>
      )}

      {!loading && !error && displayData && displayData.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={displayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stakedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => fmtTao(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#9333ea"
              strokeWidth={2}
              fill="url(#totalGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#9333ea" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && (!displayData || displayData.length === 0) && (
        <div className="h-48 flex items-center justify-center text-sm text-gray-500">
          No history data available for this wallet
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import type { HistoryPoint } from "../../api/whale-history/route";

type Props = { address: string };

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toFixed(0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as HistoryPoint;
  return (
    <div className="bg-[#0c1525] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{d.balance_total.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ total</p>
      {d.balance_staked > 0 && (
        <p className="text-blue-400">{d.balance_staked.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ staked</p>
      )}
      {d.rank && <p className="text-gray-500">Rank #{d.rank}</p>}
      {(d.source as string) === "kv_snapshot" && <p className="text-gray-700 italic">internal snapshot</p>}
    </div>
  );
}

export default function BalanceChart({ address }: Props) {
  const [points, setPoints] = useState<HistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/whale-history?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPoints(data);
        else if (Array.isArray(data) && data.length === 0) setError("empty");
        else setError(JSON.stringify(data));
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [address]);

  if (loading) {
    return (
      <div className="h-28 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading balance history…
        </div>
      </div>
    );
  }

  if (error || !points || points.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center">
        <p className="text-gray-700 text-xs italic">
          {error && error !== "empty" ? `Error: ${error}` : "Balance history not yet available"}
        </p>
      </div>
    );
  }

  // Determine if trend is up or down
  const first = points[0]?.balance_total ?? 0;
  const last = points[points.length - 1]?.balance_total ?? 0;
  const isUp = last >= first;
  const color = isUp ? "#34d399" : "#f87171"; // emerald or red

  const chartData = points.map((p) => ({
    ...p,
    date: p.date.slice(5), // show MM-DD
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Balance History (30d)
        </span>
        <span className={`text-xs font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
          {isUp ? "▲" : "▼"} {fmt(Math.abs(last - first))} τ
        </span>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${address.slice(0, 8)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#4b5563" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#4b5563" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmt}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance_total"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${address.slice(0, 8)})`}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

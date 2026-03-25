"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const TABS = [
  { label: "30D", days: "30" },
  { label: "90D", days: "90" },
  { label: "1Y", days: "365" },
];

const COINS = [
  { key: "tao", label: "TAO", color: "#a855f7" },
  { key: "btc", label: "BTC", color: "#f97316" },
  { key: "eth", label: "ETH", color: "#3b82f6" },
  { key: "sol", label: "SOL", color: "#22c55e" },
];

type DataPoint = Record<string, string | number>;

function formatDate(dateStr: string, days: string) {
  const d = new Date(dateStr);
  if (days === "30") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days === "90") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatPct(v: number) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function TaoComparisonChart() {
  const [tab, setTab] = useState("30");
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/comparison-chart?days=${tab}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  const lastPoint = data?.[data.length - 1];

  return (
    <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">TAO vs Major Assets</h3>
          <p className="text-xs text-gray-500">% return from start of period (normalized to 0%)</p>
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.days}
              onClick={() => setTab(t.days)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                tab === t.days
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend with current % */}
      <div className="flex flex-wrap gap-3 mb-5">
        {COINS.map(({ key, label, color }) => {
          const val = lastPoint?.[key];
          const pct = typeof val === "number" ? val : null;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-400">{label}</span>
              {pct !== null && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: pct >= 0 ? "#4ade80" : "#f87171" }}
                >
                  {formatPct(pct)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center text-gray-500 text-sm">Loading...</div>
      ) : !data ? (
        <div className="h-60 flex items-center justify-center text-gray-500 text-sm">Data unavailable</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v as string, tab)}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `${v >= 0 ? "+" : ""}${v}%`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0f1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#9ca3af", fontSize: 12 }}
              labelFormatter={(l) => formatDate(l as string, tab)}
              formatter={(value: unknown, name: unknown) => {
                const nameStr = name as string | undefined;
                const coin = COINS.find((c) => c.key === nameStr);
                const v = value as number;
                return [formatPct(v), coin?.label ?? nameStr ?? ""];
              }}
            />
            {COINS.map(({ key, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

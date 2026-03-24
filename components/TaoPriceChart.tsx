"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const TABS = [
  { label: "7D", days: "7" },
  { label: "1M", days: "30" },
  { label: "3M", days: "90" },
];

type DataPoint = { date: string; price: number };

function formatDate(dateStr: string, days: string) {
  const d = new Date(dateStr);
  if (days === "7") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days === "30") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function TaoPriceChart() {
  const [tab, setTab] = useState("30");
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/price-history?days=${tab}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  const minPrice = data ? Math.min(...data.map((d) => d.price)) : 0;
  const maxPrice = data ? Math.max(...data.map((d) => d.price)) : 0;
  const firstPrice = data?.[0]?.price ?? 0;
  const lastPrice = data?.[data.length - 1]?.price ?? 0;
  const change = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isUp = change >= 0;

  const displayData = data
    ? data.filter((_, i) => {
        if (tab === "7") return true;
        if (tab === "30") return i % 1 === 0;
        return i % 2 === 0;
      })
    : [];

  return (
    <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">TAO Price</h3>
          {data && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">${lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`text-sm font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
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

      {loading ? (
        <div className="h-56 flex items-center justify-center text-gray-500 text-sm">Loading...</div>
      ) : !data ? (
        <div className="h-56 flex items-center justify-center text-gray-500 text-sm">Failed to load data</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={displayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v, tab)}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice * 0.97, maxPrice * 1.03]}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#0a0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#9ca3af", fontSize: 12 }}
              itemStyle={{ color: "#a855f7", fontWeight: 600 }}
              formatter={(v: unknown) => [`$${(v as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "TAO"]}
              labelFormatter={(l) => formatDate(l, tab)}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#9333ea"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#9333ea" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

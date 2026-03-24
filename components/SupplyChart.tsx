"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

// Calculate cumulative TAO supply over time
// Halving 1: Dec 2025 (block 10.5M), Halving 2: ~Dec 2029 (block 21M), Halving 3: ~2033
// 7,200 TAO/day before Dec 2025, 3,600 after, 1,800 after Dec 2029, etc.
function buildSupplyData() {
  const startYear = 2021;
  const halvings = [
    { year: 2025, month: 11, dailyAfter: 3600 },  // Dec 2025 — confirmed
    { year: 2029, month: 11, dailyAfter: 1800 },  // Dec 2029 — est. based on 12s/block
    { year: 2033, month: 11, dailyAfter: 900 },   // ~2033 est.
    { year: 2037, month: 11, dailyAfter: 450 },   // ~2037 est.
  ];

  const points: { year: string; supply: number; pct: number }[] = [];
  let cumulative = 0;
  let dailyRate = 7200;
  const MAX = 21_000_000;

  for (let year = startYear; year <= 2038; year++) {
    for (let month = 0; month < 12; month++) {
      const halving = halvings.find((h) => h.year === year && h.month === month);
      if (halving) dailyRate = halving.dailyAfter;
      cumulative += dailyRate * 30.44;
      cumulative = Math.min(cumulative, MAX);
    }
    points.push({
      year: String(year),
      supply: Math.round(cumulative / 1000) / 1000, // millions
      pct: parseFloat(((cumulative / MAX) * 100).toFixed(1)),
    });
  }
  return points;
}

const supplyData = buildSupplyData();

export default function SupplyChart() {
  return (
    <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white mb-1">Cumulative TAO Supply</h3>
        <p className="text-sm text-gray-400">TAO minted over time — hard cap at 21 million</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={supplyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tickFormatter={(v) => `${v.toFixed(1)}M`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
            domain={[0, 21]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#0a0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af", fontSize: 12 }}
            formatter={(v: unknown) => [`${(v as number).toFixed(2)}M TAO`, "Supply"]}
            itemStyle={{ color: "#22d3ee", fontWeight: 600 }}
          />
          <ReferenceLine y={21} stroke="rgba(34,211,238,0.3)" strokeDasharray="4 4" label={{ value: "21M cap", fill: "#6b7280", fontSize: 10, position: "insideTopRight" }} />
          <Area
            type="monotone"
            dataKey="supply"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#supplyGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#22d3ee" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Cumulative supply (millions)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-cyan-400/40 inline-block" /> 21M hard cap</span>
      </div>
    </div>
  );
}

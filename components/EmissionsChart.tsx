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

// Bittensor emission schedule (deterministic, based on halving every ~4 years)
// Block time ~12s, blocks per year ~2,628,000
// Halving 1: Dec 2025, Halving 2: ~Dec 2029, Halving 3: ~2033
const emissionsData = [
  { year: "2023", emissions: 7200 },
  { year: "2024", emissions: 7200 },
  { year: "2025", emissions: 7200 },
  { year: "Dec '25\n(Halving 1)", emissions: 3600, halving: true },
  { year: "2026", emissions: 3600 },
  { year: "2027", emissions: 3600 },
  { year: "2028", emissions: 3600 },
  { year: "~Dec '29\n(Halving 2)", emissions: 1800, halving: true },
  { year: "2030", emissions: 1800 },
  { year: "2031", emissions: 1800 },
  { year: "2032", emissions: 1800 },
  { year: "~2033\n(Halving 3)", emissions: 900, halving: true },
  { year: "2034", emissions: 900 },
];

export default function EmissionsChart() {
  return (
    <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white mb-1">Daily TAO Emissions</h3>
        <p className="text-sm text-gray-400">New TAO minted per day — halving every ~4 years</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={emissionsData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${v.toLocaleString()}`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
            domain={[0, 8000]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#0a0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af", fontSize: 12 }}
            itemStyle={{ color: "#f59e0b", fontWeight: 600 }}
            formatter={(v: unknown) => [`${(v as number).toLocaleString()} TAO/day`, "Emissions"]}
          />
          <ReferenceLine y={3600} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 4" />
          <Area
            type="stepAfter"
            dataKey="emissions"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#emissionsGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400 inline-block" /> Actual/Projected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-amber-400/40 inline-block" /> Current level (3,600/day)</span>
      </div>
    </div>
  );
}

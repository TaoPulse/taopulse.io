"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  stakedTao: number | null;
  circulatingSupply: number | null;
};

const COLORS = ["#22d3ee", "#a78bfa", "#374151"];

export default function TokenomicsDistributionChart({ stakedTao, circulatingSupply }: Props) {
  if (!stakedTao || !circulatingSupply) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Data unavailable
      </div>
    );
  }

  const unstaked = Math.max(0, circulatingSupply - stakedTao);
  const notYetMinted = Math.max(0, 21_000_000 - circulatingSupply);

  const data = [
    { name: "Staked TAO", value: Math.round(stakedTao) },
    { name: "Unstaked (circulating)", value: Math.round(unstaked) },
    { name: "Not yet minted", value: Math.round(notYetMinted) },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#0a0f1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#9ca3af", fontSize: 12 }}
          formatter={(v: unknown) => [
            `${Number(v).toLocaleString()} TAO`,
            "",
          ]}
          itemStyle={{ color: "#e5e7eb", fontWeight: 600 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

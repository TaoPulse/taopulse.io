"use client";

import { useEffect, useState } from "react";

type DayData = { date: string; stake: number; mine: number; both: number };
type ApiResponse = {
  days: DayData[];
  totals: { stake: number; mine: number; both: number; total: number };
};

export default function HistoryChart() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/quiz-results")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
        <div className="h-4 w-48 bg-white/10 rounded mb-4" />
        <div className="h-32 bg-white/5 rounded" />
      </div>
    );
  }

  const { days, totals } = data;
  const hasData = totals.total > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-gray-500 text-sm">Not enough data yet — be among the first to shape the trend!</p>
      </div>
    );
  }

  // Max per day for scaling
  const maxVal = Math.max(...days.map((d) => d.stake + d.mine + d.both), 1);

  const stakeLeadPct =
    totals.total > 0 ? Math.round((totals.stake / totals.total) * 100) : 0;
  const leader = totals.stake >= totals.mine ? "Stake" : "Mine";
  const leaderPct = totals.stake >= totals.mine ? stakeLeadPct : 100 - stakeLeadPct;

  // Show every 5th label to avoid crowding
  function fmtLabel(date: string) {
    const [, m, d] = date.split("-");
    return `${parseInt(m)}/${parseInt(d)}`;
  }

  const BAR_HEIGHT = 96; // px

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 mb-5 text-sm">
        <div className="flex-1 min-w-0">
          <span className="text-gray-400">
            <span className="font-semibold text-white">
              {totals.total.toLocaleString()}
            </span>{" "}
            total quizzes —{" "}
            <span className={leader === "Stake" ? "text-emerald-400" : "text-purple-400"}>
              {leader} leads {leaderPct}% of the time
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Stake
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-purple-500" /> Mine
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" /> Both
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: "480px" }}>
          {/* Bars */}
          <div className="flex items-end gap-[2px]" style={{ height: `${BAR_HEIGHT}px` }}>
            {days.map((d) => {
              const total = d.stake + d.mine + d.both;
              const scaledTotal = total === 0 ? 0 : (total / maxVal) * BAR_HEIGHT;
              const stakeH = total === 0 ? 0 : (d.stake / total) * scaledTotal;
              const mineH = total === 0 ? 0 : (d.mine / total) * scaledTotal;
              const bothH = total === 0 ? 0 : (d.both / total) * scaledTotal;
              const emptyH = total === 0 ? 4 : 0;

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col-reverse items-stretch"
                  style={{ height: `${BAR_HEIGHT}px` }}
                  title={`${d.date}: ${d.stake} stake, ${d.mine} mine, ${d.both} both`}
                >
                  {/* Empty bar (when zero) */}
                  {emptyH > 0 && (
                    <div
                      style={{ height: `${emptyH}px` }}
                      className="bg-white/10 rounded-sm"
                    />
                  )}
                  {/* Stake (bottom) */}
                  {stakeH > 0 && (
                    <div
                      style={{ height: `${stakeH}px` }}
                      className="bg-emerald-500 min-h-[4px]"
                    />
                  )}
                  {/* Mine (middle) */}
                  {mineH > 0 && (
                    <div
                      style={{ height: `${mineH}px` }}
                      className="bg-purple-500 min-h-[4px]"
                    />
                  )}
                  {/* Both (top) */}
                  {bothH > 0 && (
                    <div
                      style={{ height: `${bothH}px` }}
                      className="bg-blue-500 min-h-[4px] rounded-t-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex gap-[2px] mt-1">
            {days.map((d, i) => (
              <div key={d.date} className="flex-1 text-center">
                {i % 5 === 0 ? (
                  <span className="text-[9px] text-gray-600">{fmtLabel(d.date)}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

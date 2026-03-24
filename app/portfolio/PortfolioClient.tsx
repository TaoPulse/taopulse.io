"use client";

import { useState, useEffect, useCallback } from "react";

interface Position {
  id: string;
  label: string;
  amount: number;
  buyPrice: number | null;
  date: string;
}

interface PriceData {
  price: number;
  change24h: number;
}

const STORAGE_KEY = "tao-portfolio-positions";
const STAKING_APY = 0.08;

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtTao(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} TAO`;
}

export default function PortfolioClient() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);

  const [formAmount, setFormAmount] = useState("");
  const [formBuyPrice, setFormBuyPrice] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formDate, setFormDate] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPositions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  }, [positions]);

  // Fetch live price
  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/price");
      if (res.ok) {
        const data = await res.json();
        if (data) setPriceData({ price: data.price, change24h: data.change24h });
      }
    } catch {}
    setPriceLoading(false);
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const addPosition = () => {
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) return;
    const rawBuyPrice = parseFloat(formBuyPrice);
    const buyPrice = !isNaN(rawBuyPrice) && rawBuyPrice > 0 ? rawBuyPrice : null;
    setPositions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: formLabel.trim() || `Position ${prev.length + 1}`,
        amount,
        buyPrice,
        date: formDate,
      },
    ]);
    setFormAmount("");
    setFormBuyPrice("");
    setFormLabel("");
    setFormDate("");
  };

  const removePosition = (id: string) =>
    setPositions((prev) => prev.filter((p) => p.id !== id));

  // Aggregate calculations
  const totalTao = positions.reduce((s, p) => s + p.amount, 0);
  const currentValue = priceData ? totalTao * priceData.price : null;
  const positionsWithCost = positions.filter((p) => p.buyPrice != null);
  const totalCostBasis = positionsWithCost.reduce(
    (s, p) => s + p.amount * p.buyPrice!,
    0
  );
  const hasCostBasis = positionsWithCost.length > 0;
  const totalPnL =
    currentValue != null && hasCostBasis ? currentValue - totalCostBasis : null;
  const totalPnLPct =
    totalPnL != null && totalCostBasis > 0
      ? (totalPnL / totalCostBasis) * 100
      : null;
  const annualYieldTao = totalTao * STAKING_APY;
  const annualYieldUsd = priceData ? annualYieldTao * priceData.price : null;

  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/20 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            {priceLoading
              ? "Fetching live price…"
              : priceData
              ? `TAO: ${fmt(priceData.price)}`
              : "Price unavailable"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            TAO Portfolio Tracker
          </h1>
          <p className="text-gray-400">
            Track your Bittensor holdings with live P&amp;L. No signup required
            — saved locally in your browser.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total TAO */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              Total TAO
            </p>
            <p className="text-2xl font-bold text-white break-all">
              {fmtTao(totalTao)}
            </p>
          </div>

          {/* Current Value */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              Current Value
            </p>
            <p className="text-2xl font-bold text-white">
              {priceLoading ? "…" : currentValue != null ? fmt(currentValue) : "—"}
            </p>
            {priceData && (
              <p
                className={`text-xs mt-1 ${
                  priceData.change24h >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {priceData.change24h >= 0 ? "+" : ""}
                {priceData.change24h.toFixed(2)}% 24h
              </p>
            )}
          </div>

          {/* Unrealized P&L */}
          <div className="bg-[#0f1623] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              Unrealized P&amp;L
            </p>
            {totalPnL != null ? (
              <>
                <p
                  className={`text-2xl font-bold ${
                    totalPnL >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}
                  {fmt(totalPnL)}
                </p>
                {totalPnLPct != null && (
                  <p
                    className={`text-xs mt-1 ${
                      totalPnLPct >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {totalPnLPct >= 0 ? "+" : ""}
                    {totalPnLPct.toFixed(2)}%
                  </p>
                )}
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-600">—</p>
            )}
            {hasCostBasis && (
              <p className="text-xs text-gray-500 mt-1">
                Cost basis: {fmt(totalCostBasis)}
              </p>
            )}
          </div>

          {/* Est. Annual Yield */}
          <div className="bg-[#0f1623] border border-purple-500/20 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              Est. Annual Yield
            </p>
            <p className="text-2xl font-bold text-purple-400">
              {annualYieldUsd != null ? fmt(annualYieldUsd) : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fmtTao(annualYieldTao)} @ 8% APY
            </p>
          </div>
        </div>

        {/* ── Add position form ── */}
        <div className="bg-[#0f1623] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            Add Position
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                TAO Amount <span className="text-purple-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 10"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPosition()}
                className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                Avg Buy Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 250"
                value={formBuyPrice}
                onChange={(e) => setFormBuyPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPosition()}
                className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                Label (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Binance buy"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPosition()}
                className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                Date (optional)
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-[#080d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
          <button
            onClick={addPosition}
            disabled={!formAmount || parseFloat(formAmount) <= 0}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            + Add Position
          </button>
        </div>

        {/* ── Positions table ── */}
        {positions.length > 0 ? (
          <div className="bg-[#0f1623] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Positions</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {positions.length} position{positions.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => {
                    if (confirm("Clear all positions? This cannot be undone.")) {
                      setPositions([]);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-red-500/30"
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      "Label",
                      "Amount",
                      "Buy Price",
                      "Cost Basis",
                      "Current Value",
                      "P&L",
                      "P&L %",
                      "Date",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                          h === "Label" || h === "" ? "text-left" : "text-right"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {positions.map((pos) => {
                    const curVal = priceData
                      ? pos.amount * priceData.price
                      : null;
                    const cost =
                      pos.buyPrice != null ? pos.amount * pos.buyPrice : null;
                    const pnl =
                      curVal != null && cost != null ? curVal - cost : null;
                    const pnlPct =
                      pnl != null && cost != null && cost > 0
                        ? (pnl / cost) * 100
                        : null;
                    const pnlColor =
                      pnl == null
                        ? "text-gray-600"
                        : pnl >= 0
                        ? "text-green-400"
                        : "text-red-400";

                    return (
                      <tr
                        key={pos.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-4 text-white font-medium whitespace-nowrap">
                          {pos.label}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-300 whitespace-nowrap">
                          {pos.amount.toLocaleString("en-US", {
                            maximumFractionDigits: 4,
                          })}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-300 whitespace-nowrap">
                          {pos.buyPrice != null ? (
                            fmt(pos.buyPrice)
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-300 whitespace-nowrap">
                          {cost != null ? (
                            fmt(cost)
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-white whitespace-nowrap">
                          {curVal != null ? (
                            fmt(curVal)
                          ) : (
                            <span className="text-gray-500">…</span>
                          )}
                        </td>
                        <td
                          className={`px-5 py-4 text-right font-medium whitespace-nowrap ${pnlColor}`}
                        >
                          {pnl != null
                            ? `${pnl >= 0 ? "+" : ""}${fmt(pnl)}`
                            : "—"}
                        </td>
                        <td
                          className={`px-5 py-4 text-right font-medium whitespace-nowrap ${pnlColor}`}
                        >
                          {pnlPct != null
                            ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500 whitespace-nowrap text-xs">
                          {pos.date || "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => removePosition(pos.id)}
                            aria-label="Remove position"
                            className="text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-400 mb-1">
              No positions yet
            </p>
            <p className="text-sm text-gray-600">
              Add your first TAO position above to start tracking.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 text-center pb-4">
          Staking yield is estimated at ~8% APY and is for informational
          purposes only. Not financial advice.
        </p>
      </div>
    </div>
  );
}

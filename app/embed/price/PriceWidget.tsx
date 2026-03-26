"use client";

import { useState, useEffect, useCallback } from "react";

interface PriceData {
  price: number;
  change24h: number;
}

export default function PriceWidget() {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/price");
      if (res.ok) {
        const json = await res.json();
        if (json?.price != null) setData(json);
      }
    } catch {
      // fail silently — show stale or "—"
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#0f1623] rounded-xl">
        <span className="text-gray-500 text-xs">Loading…</span>
      </div>
    );
  }

  const price = data?.price;
  const change = data?.change24h;
  const isUp = (change ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between w-full h-full bg-[#0f1623] border border-white/10 rounded-xl px-4 py-3">
      {/* Left: symbol + price */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 font-bold text-base shrink-0">
          τ
        </div>
        <div>
          <div className="text-[11px] text-gray-400 font-medium leading-none mb-1">
            TAO / USD
          </div>
          <div className="text-2xl font-bold text-white font-mono leading-none">
            {price != null
              ? `$${price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"}
          </div>
        </div>
      </div>

      {/* Right: 24h change + branding */}
      <div className="flex flex-col items-end gap-1.5">
        {change != null && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              isUp
                ? "bg-green-500/12 text-green-400 border-green-500/25"
                : "bg-red-500/12 text-red-400 border-red-500/25"
            }`}
          >
            {isUp ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        )}
        <a
          href="https://taopulse.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-600 hover:text-gray-500 transition-colors"
        >
          TaoPulse.io
        </a>
      </div>
    </div>
  );
}

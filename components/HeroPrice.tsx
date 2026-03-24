"use client";

import { useEffect, useState } from "react";

interface TaoPrice {
  usd: number;
  usd_24h_change: number;
}

export default function HeroPrice() {
  const [price, setPrice] = useState<TaoPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_24hr_change=true"
        );
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setPrice(data.bittensor);
      } catch {
        // Leave as null — will show fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-28 h-9 bg-white/10 rounded-lg" />
        <div className="w-16 h-5 bg-white/10 rounded" />
      </div>
    );
  }

  if (!price) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
        Price unavailable
      </div>
    );
  }

  const isPositive = price.usd_24h_change >= 0;
  const formattedPrice = price.usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedChange = `${isPositive ? "+" : ""}${price.usd_24h_change.toFixed(2)}%`;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-3xl font-bold text-white tabular-nums">
          {formattedPrice}
        </span>
      </div>
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-semibold ${
          isPositive
            ? "bg-emerald-400/10 text-emerald-400"
            : "bg-red-400/10 text-red-400"
        }`}
      >
        {isPositive ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {formattedChange}
      </div>
      <span className="text-xs text-gray-500">24h</span>
    </div>
  );
}

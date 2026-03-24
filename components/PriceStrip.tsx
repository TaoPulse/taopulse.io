"use client";

import { useEffect, useState } from "react";

interface CoinPrice {
  usd: number;
  usd_24h_change: number;
}

interface PriceData {
  bittensor?: CoinPrice;
  bitcoin?: CoinPrice;
}

const COIN_LABELS: Record<string, string> = {
  bittensor: "TAO",
  bitcoin: "BTC",
};

const COIN_ORDER = ["bittensor", "bitcoin"];

export default function PriceStrip() {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bittensor,bitcoin&vs_currencies=usd&include_24hr_change=true",
        { next: { revalidate: 0 } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data: PriceData = await res.json();
      setPrices(data);
      setLastUpdated(new Date());
    } catch {
      // Silently fail; keep stale data displayed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30_000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="bg-[#0a0f1a] border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-10 overflow-x-auto scrollbar-none">
          {loading ? (
            <div className="flex items-center gap-6">
              {COIN_ORDER.map((coin) => (
                <div
                  key={coin}
                  className="flex items-center gap-2 shrink-0 animate-pulse"
                >
                  <span className="w-10 h-3 bg-white/10 rounded" />
                  <span className="w-20 h-3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {COIN_ORDER.map((coin) => {
                const data = prices[coin as keyof PriceData];
                if (!data) return null;
                const isPositive = data.usd_24h_change >= 0;
                return (
                  <div
                    key={coin}
                    className="flex items-center gap-2 shrink-0 text-sm"
                  >
                    <span className="font-semibold text-white">
                      {COIN_LABELS[coin]}
                    </span>
                    <span className="text-gray-300">
                      ${formatPrice(data.usd)}
                    </span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        isPositive
                          ? "text-emerald-400 bg-emerald-400/10"
                          : "text-red-400 bg-red-400/10"
                      }`}
                    >
                      {formatChange(data.usd_24h_change)}
                    </span>
                  </div>
                );
              })}
              {lastUpdated && (
                <div className="ml-auto shrink-0 text-xs text-gray-600 hidden sm:block">
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

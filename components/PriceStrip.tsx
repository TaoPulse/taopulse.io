"use client";

import { useState, useEffect } from "react";
import { useTaoPrice } from "@/hooks/useTaoPrice";

interface BtcPrice {
  usd: number;
  usd_24h_change: number;
}

export default function PriceStrip() {
  const { price: taoPrice, loading: taoLoading } = useTaoPrice();
  const [btcPrice, setBtcPrice] = useState<BtcPrice | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchBtc = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setBtcPrice(data.bitcoin);
        setLastUpdated(new Date());
      } catch {
        // silent
      }
    };

    fetchBtc();
    const interval = setInterval(fetchBtc, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Update lastUpdated when TAO price refreshes
  useEffect(() => {
    if (taoPrice) setLastUpdated(new Date());
  }, [taoPrice]);

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const coins = [
    taoPrice ? { label: "TAO", usd: taoPrice.usd, change: taoPrice.usd_24h_change } : null,
    btcPrice ? { label: "BTC", usd: btcPrice.usd, change: btcPrice.usd_24h_change } : null,
  ].filter(Boolean) as { label: string; usd: number; change: number }[];

  const loading = taoLoading && !btcPrice;

  return (
    <div className="bg-[#0a0f1a] border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-10 overflow-x-auto scrollbar-none">
          {loading ? (
            <div className="flex items-center gap-6">
              {["TAO", "BTC"].map((coin) => (
                <div key={coin} className="flex items-center gap-2 shrink-0 animate-pulse">
                  <span className="w-10 h-3 bg-white/10 rounded" />
                  <span className="w-20 h-3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {coins.map((coin) => {
                const isPositive = coin.change >= 0;
                return (
                  <div key={coin.label} className="flex items-center gap-2 shrink-0 text-sm">
                    <span className="font-semibold text-white">{coin.label}</span>
                    <span className="text-gray-300">${formatPrice(coin.usd)}</span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        isPositive
                          ? "text-emerald-400 bg-emerald-400/10"
                          : "text-red-400 bg-red-400/10"
                      }`}
                    >
                      {formatChange(coin.change)}
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

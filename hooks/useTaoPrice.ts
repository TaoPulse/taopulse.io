"use client";

import { useEffect, useState, useCallback } from "react";

interface TaoPrice {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
}

// Module-level shared state so all consumers get the same data
let cachedPrice: TaoPrice | null = null;
let lastFetched = 0;
const CACHE_MS = 30_000;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

async function fetchPrice() {
  const now = Date.now();
  if (now - lastFetched < CACHE_MS && cachedPrice) return;
  lastFetched = now;
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_24hr_change=true&include_market_cap=true",
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const data = await res.json();
    cachedPrice = data.bittensor;
    notify();
  } catch {
    // silent
  }
}

// Start the polling loop once
let pollingStarted = false;
function startPolling() {
  if (pollingStarted) return;
  pollingStarted = true;
  fetchPrice();
  setInterval(fetchPrice, CACHE_MS);
}

export function useTaoPrice() {
  const [price, setPrice] = useState<TaoPrice | null>(cachedPrice);
  const [loading, setLoading] = useState(!cachedPrice);

  const update = useCallback(() => {
    setPrice(cachedPrice);
    setLoading(false);
  }, []);

  useEffect(() => {
    listeners.add(update);
    startPolling();
    if (cachedPrice) {
      setPrice(cachedPrice);
      setLoading(false);
    }
    return () => {
      listeners.delete(update);
    };
  }, [update]);

  return { price, loading };
}

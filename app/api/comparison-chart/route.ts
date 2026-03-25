import { NextResponse } from "next/server";

const COINS = [
  { id: "bittensor", key: "tao" },
  { id: "bitcoin", key: "btc" },
  { id: "ethereum", key: "eth" },
  { id: "solana", key: "sol" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") ?? "30";

  try {
    const results = await Promise.all(
      COINS.map(({ id }) =>
        fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
          {
            headers: { "User-Agent": "TaoPulse/1.0" },
            signal: AbortSignal.timeout(10000),
            next: { revalidate: 3600 },
          }
        ).then((r) => {
          if (!r.ok) throw new Error(`CoinGecko failed for ${id}`);
          return r.json();
        })
      )
    );

    // Each result has prices: [[timestamp, price], ...]
    // Normalize each coin's prices to % change from first data point
    // Use daily data points; align by date string
    const coinData = results.map((result, i) => {
      const prices = result.prices as [number, number][];
      const base = prices[0]?.[1];
      if (!base) return { key: COINS[i].key, series: [] };

      const series = prices.map(([ts, price]) => ({
        date: new Date(ts).toISOString().split("T")[0],
        pct: parseFloat((((price - base) / base) * 100).toFixed(2)),
      }));

      return { key: COINS[i].key, series };
    });

    // Merge into unified date-keyed array using TAO's dates as the spine
    const taoSeries = coinData.find((c) => c.key === "tao")?.series ?? [];
    const lookups = Object.fromEntries(
      coinData.map(({ key, series }) => [
        key,
        Object.fromEntries(series.map(({ date, pct }) => [date, pct])),
      ])
    );

    const merged = taoSeries.map(({ date }) => {
      const point: Record<string, string | number> = { date };
      for (const { key } of COINS) {
        const val = lookups[key]?.[date];
        if (val !== undefined) point[key] = val;
      }
      return point;
    });

    return NextResponse.json(merged, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json(null);
  }
}

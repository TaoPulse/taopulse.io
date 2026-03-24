import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") ?? "30";

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/bittensor/market_chart?vs_currency=usd&days=${days}&interval=${days === "7" ? "hourly" : "daily"}`,
      {
        headers: { "User-Agent": "TaoPulse/1.0" },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error("CoinGecko failed");
    const data = await res.json();

    // data.prices = [[timestamp, price], ...]
    const prices = (data.prices as [number, number][]).map(([ts, price]) => ({
      date: new Date(ts).toISOString().split("T")[0],
      price: parseFloat(price.toFixed(2)),
    }));

    return NextResponse.json(prices, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json(null);
  }
}

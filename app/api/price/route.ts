import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true",
      {
        headers: { "User-Agent": "TaoPulse/1.0" },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) throw new Error("CoinGecko failed");
    const data = await res.json();
    const tao = data.bittensor;
    return NextResponse.json(
      {
        price: tao.usd,
        marketCap: tao.usd_market_cap,
        change24h: tao.usd_24h_change,
        volume24h: tao.usd_24h_vol,
      },
      {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
      }
    );
  } catch {
    return NextResponse.json(null);
  }
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TAO Price — TaoPulse Widget",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

interface PriceData {
  price: number;
  change24h: number;
}

async function getPriceData(): Promise<PriceData | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_24hr_change=true",
      {
        headers: { "User-Agent": "TaoPulse/1.0" },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      price: data.bittensor.usd,
      change24h: data.bittensor.usd_24h_change,
    };
  } catch {
    return null;
  }
}

export default async function PriceEmbed() {
  const data = await getPriceData();
  const isPositive = data ? data.change24h >= 0 : null;

  return (
    <div className="bg-[#080d14] min-h-screen flex items-start justify-center p-3">
      <div className="w-full bg-[#0f1623] border border-white/10 rounded-xl px-5 py-3.5 flex items-center gap-4">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center text-[11px] font-black text-black shrink-0">
          τ
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">
            TAO
          </span>
          <span className="text-xl font-bold font-mono text-white">
            {data
              ? `$${data.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"}
          </span>
          {data && isPositive !== null && (
            <span
              className={`text-sm font-semibold px-2.5 py-0.5 rounded-md shrink-0 ${
                isPositive
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {data.change24h.toFixed(2)}%
            </span>
          )}
        </div>
        <a
          href="https://www.taopulse.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors shrink-0"
        >
          TaoPulse.io
        </a>
      </div>
    </div>
  );
}

/**
 * /api/whale-history?address=...
 * Returns 30-day balance history for a wallet from TaoStats.
 */
import { NextResponse } from "next/server";

const TAOSTATS_BASE = "https://api.taostats.io";

function toTao(raw: unknown): number {
  return parseFloat(String(raw ?? "0")) / 1e9;
}

export type HistoryPoint = {
  date: string;
  balance_total: number;
  balance_free: number;
  balance_staked: number;
  rank: number | null;
  source: "taostats";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  try {
    const res = await fetch(
      `${TAOSTATS_BASE}/api/account/history/v1?address=${encodeURIComponent(address)}&limit=30`,
      { headers: { Authorization: apiKey }, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const json = await res.json();
    const points: HistoryPoint[] = [];

    for (const item of json.data ?? []) {
      const ts = item.timestamp ?? item.block_timestamp ?? item.date;
      if (!ts) continue;
      const date = new Date(ts).toISOString().slice(0, 10);
      points.push({
        date,
        balance_total: toTao(item.balance_total ?? item.balance),
        balance_free: toTao(item.balance_free ?? 0),
        balance_staked: toTao(item.balance_staked ?? 0),
        rank: item.rank ?? null,
        source: "taostats",
      });
    }

    // Sort ascending for chart
    points.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(points);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

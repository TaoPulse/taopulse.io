/**
 * /api/whale-history?address=...
 * Returns 30-day balance history for a wallet.
 * Merges TaoStats account/history API with our own KV daily snapshots.
 * Cached in KV for 2 hours per wallet.
 */
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const TAOSTATS_BASE = "https://api.taostats.io";
const CACHE_TTL = 2 * 60 * 60; // 2 hours

export const dynamic = "force-dynamic";

function toTao(raw: unknown): number {
  return parseFloat(String(raw ?? "0")) / 1e9;
}

export type HistoryPoint = {
  date: string;       // YYYY-MM-DD
  balance_total: number;
  balance_free: number;
  balance_staked: number;
  rank: number | null;
  source: "taostats" | "kv_snapshot";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const cacheKey = `whale-history:${address}`;

  // 1. Try KV cache
  try {
    const cached = await kv.get<{ points: HistoryPoint[]; cached_at: number }>(cacheKey);
    if (cached && Date.now() - cached.cached_at < CACHE_TTL * 1000) {
      return NextResponse.json(cached.points, { headers: { "X-Cache": "HIT" } });
    }
  } catch { /* fall through */ }

  // 2. Fetch from TaoStats account history
  const points: HistoryPoint[] = [];
  try {
    const res = await fetch(
      `${TAOSTATS_BASE}/api/account/history/v1?address=${address}&limit=30&order=timestamp_desc`,
      { headers: { Authorization: apiKey }, cache: "no-store" }
    ).then((r) => r.json());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of res.data ?? []) {
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
  } catch { /* TaoStats failed, fall through to KV snapshots */ }

  // 3. Supplement with our own KV daily snapshots (fills gaps or replaces if TaoStats returned nothing)
  try {
    const kvPoints: HistoryPoint[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      // Only add if not already from TaoStats
      if (points.some((p) => p.date === dateStr)) continue;
      const snap = await kv.get<Record<string, number>>(`whales:snapshot:${dateStr}`).catch(() => null);
      if (snap && address in snap) {
        kvPoints.push({
          date: dateStr,
          balance_total: snap[address],
          balance_free: 0, // not stored in snapshot
          balance_staked: 0,
          rank: null,
          source: "kv_snapshot",
        });
      }
    }
    points.push(...kvPoints);
  } catch { /* ignore */ }

  // Sort ascending by date for chart rendering
  points.sort((a, b) => a.date.localeCompare(b.date));

  // 4. Store in KV
  try {
    await kv.set(cacheKey, { points, cached_at: Date.now() }, { ex: CACHE_TTL + 300 });
  } catch { /* ignore */ }

  return NextResponse.json(points, { headers: { "X-Cache": "MISS" } });
}

/**
 * /api/whale-history?address=...
 * Returns 30-day balance history for a wallet.
 * Reads from Supabase whale_snapshots table.
 * Cached in KV for 25 hours (cron keeps data warm daily).
 */
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const CACHE_TTL = 25 * 60 * 60; // 25 hours

export const dynamic = "force-dynamic";

export type HistoryPoint = {
  date: string;       // YYYY-MM-DD
  balance_total: number;
  balance_free: number;
  balance_staked: number;
  rank: number | null;
  source: "supabase" | "kv_snapshot";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const cacheKey = `whale-history:${address}`;

  // 1. Try KV cache
  try {
    const cached = await kv.get<{ points: HistoryPoint[]; cached_at: number }>(cacheKey);
    if (cached && Date.now() - cached.cached_at < CACHE_TTL * 1000) {
      return NextResponse.json(cached.points, { headers: { "X-Cache": "HIT" } });
    }
  } catch { /* fall through */ }

  const points: HistoryPoint[] = [];

  // 2. Query Supabase whale_snapshots
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("whale_snapshots")
        .select("date, balance_total, balance_free, balance_staked, rank")
        .eq("address", address)
        .order("date", { ascending: false })
        .limit(30);

      if (error) {
        console.error("whale_snapshots query error:", error.message);
      } else {
        for (const row of data ?? []) {
          points.push({
            date: row.date,
            balance_total: Number(row.balance_total),
            balance_free: Number(row.balance_free),
            balance_staked: Number(row.balance_staked),
            rank: row.rank ?? null,
            source: "supabase",
          });
        }
      }
    } catch { /* fall through to KV snapshots */ }
  }

  // 3. Supplement with KV daily snapshots for any missing dates
  try {
    const kvPoints: HistoryPoint[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (points.some((p) => p.date === dateStr)) continue;
      const snap = await kv.get<Record<string, number>>(`whales:snapshot:${dateStr}`).catch(() => null);
      if (snap && address in snap) {
        kvPoints.push({
          date: dateStr,
          balance_total: snap[address],
          balance_free: 0,
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

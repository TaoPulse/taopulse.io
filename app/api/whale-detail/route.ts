/**
 * /api/whale-detail?address=...
 *
 * Returns transfers + delegations for a wallet.
 * Reads from Supabase (whale_transactions + whale_delegations).
 * Cached in KV for 23 hours — data stays fresh from daily cron.
 */
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const CACHE_TTL = 23 * 60 * 60; // 23 hours

export const dynamic = "force-dynamic";

type Transfer = {
  from: string | null;
  to: string | null;
  amount: number;
  counterparty: string | null;
  timestamp: string | null;
  block: number | null;
  transaction_hash: string | null;
  type: string;
};

type Delegation = {
  action: string;
  amount: number;
  hotkey: string;
  delegate_name: string | null;
  netuid: number | null;
  timestamp: string | null;
  block: number | null;
};

type WalletDetail = {
  address: string;
  transfers: Transfer[];
  delegations: Delegation[];
  last_active: string | null;
  recently_unstaked: boolean;
  cached_at: number;
  source: "supabase" | "empty";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const cacheKey = `whale-detail:${address}`;
  const bust = searchParams.get("bust") === "1";

  // 1. Try KV cache first
  try {
    const cached = !bust && await kv.get<WalletDetail>(cacheKey);
    if (cached && (Date.now() - cached.cached_at) < CACHE_TTL * 1000) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }
  } catch {
    // KV unavailable — fall through
  }

  // 2. Read from Supabase
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const [txResult, delResult] = await Promise.all([
    supabase
      .from("whale_transactions")
      .select("type, amount, counterparty, block_number, timestamp, transaction_hash")
      .eq("address", address)
      .order("timestamp", { ascending: false })
      .limit(50),
    supabase
      .from("whale_delegations")
      .select("action, amount, delegate, delegate_name, netuid, timestamp, block_number")
      .eq("address", address)
      .order("timestamp", { ascending: false })
      .limit(50),
  ]);

  if (txResult.error) {
    console.error("whale_transactions query error:", txResult.error.message);
  }
  if (delResult.error) {
    console.error("whale_delegations query error:", delResult.error.message);
  }

  const transfers: Transfer[] = (txResult.data ?? []).map((row) => ({
    from: row.type === "transfer_in" ? row.counterparty : address,
    to: row.type === "transfer_in" ? address : row.counterparty,
    amount: Number(row.amount),
    counterparty: row.counterparty ?? null,
    timestamp: row.timestamp ?? null,
    block: row.block_number ?? null,
    transaction_hash: row.transaction_hash ?? null,
    type: row.type,
  }));

  const delegations: Delegation[] = (delResult.data ?? []).map((row) => ({
    action: row.action,
    amount: Number(row.amount),
    hotkey: row.delegate,
    delegate_name: row.delegate_name ?? null,
    netuid: row.netuid ?? null,
    timestamp: row.timestamp ?? null,
    block: row.block_number ?? null,
  }));

  // Last active: most recent timestamp across both
  const allTimestamps = [
    ...transfers.map((t) => t.timestamp),
    ...delegations.map((d) => d.timestamp),
  ].filter(Boolean).sort().reverse();
  const last_active = allTimestamps[0] ?? null;

  // Recently unstaked: any UNDELEGATE in last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recently_unstaked = delegations.some(
    (d) =>
      d.action?.toUpperCase().includes("UNDELEGATE") &&
      d.timestamp &&
      new Date(d.timestamp).getTime() > sevenDaysAgo
  );

  const result: WalletDetail = {
    address,
    transfers,
    delegations,
    last_active,
    recently_unstaked,
    cached_at: Date.now(),
    source: transfers.length > 0 || delegations.length > 0 ? "supabase" : "empty",
  };

  // 3. Store in KV
  try {
    await kv.set(cacheKey, result, { ex: CACHE_TTL + 300 });
  } catch {
    // KV write failed — still return the result
  }

  return NextResponse.json(result, {
    headers: { "X-Cache": "MISS" },
  });
}

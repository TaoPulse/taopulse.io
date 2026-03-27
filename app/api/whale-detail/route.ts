import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const DETAIL_TTL = 15 * 60; // 15 minutes

export const dynamic = "force-dynamic";

function formatTs(ts: string | number | null | undefined): string | null {
  if (!ts) return null;
  const d = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

type WalletDetail = {
  address: string;
  transfers: {
    from: string;
    to: string;
    amount: number;
    fee: number;
    timestamp: string | null;
    block: number | null;
    extrinsic_id: string | null;
  }[];
  delegations: {
    action: string;
    amount: number;
    hotkey: string;
    coldkey: string;
    netuid: number | null;
    validator_name: string | null;
    timestamp: string | null;
    block: number | null;
  }[];
  last_active: string | null;
  recently_unstaked: boolean;
  cached_at: number;
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
    if (cached && (Date.now() - cached.cached_at) < DETAIL_TTL * 1000) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }
  } catch {
    // KV unavailable — fall through to Supabase
  }

  // 2. Query Supabase directly
  try {
    const supabase = getSupabaseAdmin();

    const [txResult, delResult] = await Promise.all([
      supabase
        ? supabase
            .from("whale_transactions")
            .select("*")
            .eq("address", address)
            .order("timestamp", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
      supabase
        ? supabase
            .from("whale_delegations")
            .select("*")
            .eq("address", address)
            .order("timestamp", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (txResult.error) {
      console.error("[whale-detail] whale_transactions query error:", txResult.error.message);
    }
    if (delResult.error) {
      console.error("[whale-detail] whale_delegations query error:", delResult.error.message);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transfers = (txResult.data ?? []).map((t: any) => {
      const typeUpper = (t.type ?? "").toUpperCase();
      const from = typeUpper === "RECEIVE" ? (t.counterparty ?? "") : t.address;
      const to = typeUpper === "RECEIVE" ? t.address : (t.counterparty ?? "");
      return {
        from,
        to,
        amount: typeof t.amount === "number" ? t.amount : parseFloat(t.amount ?? "0"),
        fee: 0,
        timestamp: formatTs(t.timestamp),
        block: t.block_number ?? null,
        extrinsic_id: t.transaction_hash ?? null,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegations = (delResult.data ?? []).map((d: any) => ({
      action: d.action ?? "UNKNOWN",
      amount: typeof d.amount === "number" ? d.amount : parseFloat(d.amount ?? "0"),
      hotkey: d.hotkey ?? "",
      coldkey: d.address ?? address,
      netuid: null,
      validator_name: null,
      timestamp: formatTs(d.timestamp),
      block: d.block_number ?? null,
    }));

    // Last active: most recent timestamp across both
    const allTimestamps = [
      ...transfers.map((t: { timestamp: string | null }) => t.timestamp),
      ...delegations.map((d: { timestamp: string | null }) => d.timestamp),
    ].filter(Boolean).sort().reverse();

    const last_active = allTimestamps[0] ?? null;

    // Recently unstaked: any UNDELEGATE in last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const recently_unstaked = delegations.some(
      (d: { action: string; timestamp: string | null }) =>
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
    };

    // 3. Store in KV (TTL = 15 min + 2 min buffer)
    try {
      await kv.set(cacheKey, result, { ex: DETAIL_TTL + 120 });
    } catch {
      // KV write failed — still return the result, just not cached
    }

    return NextResponse.json(result, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("whale-detail error:", err);
    return NextResponse.json({ error: "Failed to fetch wallet detail", detail: msg }, { status: 502 });
  }
}

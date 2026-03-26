import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const TAOSTATS_BASE = "https://api.taostats.io";
const DETAIL_TTL = 15 * 60; // 15 minutes — balance detail changes less frequently than price

export const dynamic = "force-dynamic";

function toTao(raw: unknown): number {
  return parseFloat(String(raw ?? "0")) / 1e9;
}

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

  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const cacheKey = `whale-detail:${address}`;

  // 1. Try KV cache first
  try {
    const cached = await kv.get<WalletDetail>(cacheKey);
    if (cached && (Date.now() - cached.cached_at) < DETAIL_TTL * 1000) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }
  } catch {
    // KV unavailable — fall through to live fetch
  }

  // 2. Fetch live from TaoStats
  const fetchOpts = { headers: { Authorization: apiKey }, cache: "no-store" as const };

  try {
    const [transfersRes, delegationsRes] = await Promise.all([
      fetch(
        `${TAOSTATS_BASE}/api/transfer/v1?coldkey=${address}&limit=10&order=timestamp_desc`,
        fetchOpts
      ).then((r) => r.json()),
      fetch(
        `${TAOSTATS_BASE}/api/delegation/v1?coldkey=${address}&limit=10&order=block_number_desc`,
        fetchOpts
      ).then((r) => r.json()),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transfers = (transfersRes.data ?? []).map((t: any) => ({
      from: typeof t.from === "object" ? (t.from?.ss58 ?? t.from) : t.from,
      to: typeof t.to === "object" ? (t.to?.ss58 ?? t.to) : t.to,
      amount: toTao(t.amount),
      fee: toTao(t.fee),
      timestamp: formatTs(t.timestamp ?? t.block_timestamp),
      block: t.block_number ?? null,
      extrinsic_id: t.extrinsic_id ?? null,
    })).filter((t: { amount: number }) => t.amount >= 0.001); // filter out 0-TAO subnet token movements

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegations = (delegationsRes.data ?? []).map((d: any) => ({
      action: d.action ?? "UNKNOWN",
      amount: toTao(d.amount ?? d.alpha_amount ?? 0),
      hotkey: typeof d.hotkey === "object" ? (d.hotkey?.ss58 ?? "") : (d.hotkey ?? ""),
      coldkey: typeof d.coldkey === "object" ? (d.coldkey?.ss58 ?? "") : (d.coldkey ?? ""),
      netuid: d.netuid ?? null,
      validator_name: d.validator_name ?? d.name ?? null,
      timestamp: formatTs(d.timestamp ?? d.block_timestamp),
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

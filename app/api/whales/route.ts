import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { kv } from "@vercel/kv";

const TAOSTATS_BASE = "https://api.taostats.io";
const CACHE_KEY = "whales:current";
const CACHE_TTL = 1800; // 30 minutes in seconds
const SNAPSHOT_PREFIX = "whales:snapshot:";

export const dynamic = "force-dynamic";

type KnownWallets = {
  exchange: Record<string, string>;
  foundation: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTao(raw: any): number {
  return parseFloat(raw ?? "0") / 1e9;
}

function todayKey() {
  return SNAPSHOT_PREFIX + new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return SNAPSHOT_PREFIX + d.toISOString().slice(0, 10);
}

async function fetchFromTaoStats() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) throw new Error("API key not configured");

  const fetchOpts = { headers: { Authorization: apiKey }, cache: "no-store" as const };

  const [pageResults, validatorsJson] = await Promise.all([
    Promise.all(
      [1, 2, 3].map((page) =>
        fetch(
          `${TAOSTATS_BASE}/api/account/latest/v1?order_by=balance_total_desc&limit=200&page=${page}`,
          fetchOpts
        ).then((r) => r.json())
      )
    ),
    fetch(
      `${TAOSTATS_BASE}/api/validator/latest/v1?limit=200&netuid=0`,
      fetchOpts
    ).then((r) => r.json()),
  ]);

  // Build coldkey → validator name map
  const validatorMap: Record<string, string> = {};
  for (const v of validatorsJson.data ?? []) {
    const coldkey = typeof v.coldkey === "object" ? (v.coldkey?.ss58 ?? "") : (v.coldkey ?? "");
    if (coldkey && v.name) {
      validatorMap[coldkey] = v.name;
    }
  }

  // Load known wallets from static file (fallback to empty if unavailable)
  let knownWallets: KnownWallets = { exchange: {}, foundation: {} };
  try {
    const knownWalletsPath = path.join(process.cwd(), "data", "known-wallets.json");
    knownWallets = JSON.parse(readFileSync(knownWalletsPath, "utf-8"));
  } catch {
    // file may not be available in all environments
  }

  // Flatten pages and cap at 500
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAccounts: any[] = pageResults.flatMap((p) => p.data ?? []).slice(0, 500);

  const whales = allAccounts.map((account, i) => {
    const address =
      typeof account.address === "object"
        ? (account.address?.ss58 ?? "")
        : (account.address ?? "");

    const balance_total = toTao(account.balance_total);
    const balance_free = toTao(account.balance_free);
    const balance_staked = toTao(account.balance_staked);

    // Use TaoStats 24hr field if available (often null)
    const taostats_24hr =
      account.balance_total_24hr_ago != null
        ? toTao(account.balance_total_24hr_ago)
        : null;

    let label: "validator" | "exchange" | "foundation" | "unknown" = "unknown";
    let label_name: string | null = null;

    if (validatorMap[address]) {
      label = "validator";
      label_name = validatorMap[address];
    } else if (knownWallets.exchange[address]) {
      label = "exchange";
      label_name = knownWallets.exchange[address];
    } else if (knownWallets.foundation[address]) {
      label = "foundation";
      label_name = knownWallets.foundation[address];
    }

    return {
      rank: account.rank ?? i + 1,
      address,
      balance_total,
      balance_free,
      balance_staked,
      taostats_24hr, // raw from TaoStats (may be null)
      label,
      label_name,
    };
  });

  return whales;
}

export async function GET() {
  try {
    // 1. Try KV cache first
    type CachedData = { data: ReturnType<typeof fetchFromTaoStats> extends Promise<infer T> ? T : never; fetched_at: number };
    const cached = await kv.get<CachedData>(CACHE_KEY);
    const now = Date.now();

    let whales: Awaited<ReturnType<typeof fetchFromTaoStats>>;

    if (cached && (now - cached.fetched_at) < CACHE_TTL * 1000) {
      // Fresh cache — use it
      whales = cached.data;
    } else {
      // Stale or empty — fetch fresh
      whales = await fetchFromTaoStats();

      // Store in KV cache (TTL = 35 min, slightly more than our check interval)
      await kv.set(CACHE_KEY, { data: whales, fetched_at: now }, { ex: CACHE_TTL + 300 });

      // Store daily snapshot if we don't have one yet today
      const todaySnapshotKey = todayKey();
      const hasSnapshot = await kv.exists(todaySnapshotKey);
      if (!hasSnapshot) {
        // Store as address → balance_total map for quick lookup
        const snapshot: Record<string, number> = {};
        for (const w of whales) {
          snapshot[w.address] = w.balance_total;
        }
        // Keep snapshot for 48 hours
        await kv.set(todaySnapshotKey, snapshot, { ex: 48 * 3600 });
      }
    }

    // 2. Load yesterday's snapshot for 24hr diff (our own data, not TaoStats)
    const yesterdaySnapshot = await kv.get<Record<string, number>>(yesterdayKey());

    // 3. Enrich with our own 24hr diff (preferred) or TaoStats fallback
    const enriched = whales.map((w) => {
      const prev = yesterdaySnapshot ? (yesterdaySnapshot[w.address] ?? null) : null;

      const change_24hr =
        prev !== null
          ? w.balance_total - prev           // our own snapshot diff
          : w.taostats_24hr !== null
            ? w.balance_total - w.taostats_24hr // TaoStats fallback
            : null;

      const change_24hr_pct =
        change_24hr !== null && (prev ?? w.taostats_24hr) !== null && (prev ?? w.taostats_24hr) !== 0
          ? (change_24hr / (prev ?? w.taostats_24hr!)) * 100
          : null;

      return {
        rank: w.rank,
        address: w.address,
        balance_total: w.balance_total,
        balance_free: w.balance_free,
        balance_staked: w.balance_staked,
        change_24hr,
        change_24hr_pct,
        label: w.label,
        label_name: w.label_name,
      };
    });

    return NextResponse.json(enriched, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=300" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch whale data:", err);
    return NextResponse.json({ error: "Failed to fetch whale data", detail: msg }, { status: 502 });
  }
}

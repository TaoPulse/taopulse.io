/**
 * /api/whales — serves the top 500 whale richlist from KV cache.
 * Data is populated by /api/cron/snapshot every 30 minutes.
 * Falls back to a live TaoStats fetch if KV is empty (first run).
 */
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { readFileSync } from "fs";
import path from "path";

const TAOSTATS_BASE = "https://api.taostats.io";

export const dynamic = "force-dynamic";

type KnownWallets = {
  exchange: Record<string, string>;
  foundation: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTao(raw: any): number {
  return parseFloat(raw ?? "0") / 1e9;
}

async function fetchLive(apiKey: string) {
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
    fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?limit=200&netuid=0`, fetchOpts).then((r) => r.json()),
  ]);

  const validatorMap: Record<string, string> = {};
  for (const v of validatorsJson.data ?? []) {
    const coldkey = typeof v.coldkey === "object" ? (v.coldkey?.ss58 ?? "") : (v.coldkey ?? "");
    if (coldkey && v.name) validatorMap[coldkey] = v.name;
  }

  let knownWallets: KnownWallets = { exchange: {}, foundation: {} };
  try {
    const p = path.join(process.cwd(), "data", "known-wallets.json");
    knownWallets = JSON.parse(readFileSync(p, "utf-8"));
  } catch { /* ignore */ }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAccounts: any[] = pageResults.flatMap((p) => p.data ?? []).slice(0, 500);

  // Load yesterday snapshot for 24hr diff
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = "whales:snapshot:" + yesterday.toISOString().slice(0, 10);
  const yesterdaySnapshot = await kv.get<Record<string, number>>(yesterdayKey).catch(() => null);

  return allAccounts.map((account, i) => {
    const address =
      typeof account.address === "object" ? (account.address?.ss58 ?? "") : (account.address ?? "");
    const balance_total = toTao(account.balance_total);
    const balance_free = toTao(account.balance_free);
    const balance_staked = toTao(account.balance_staked);
    const taostats_24hr = account.balance_total_24hr_ago != null ? toTao(account.balance_total_24hr_ago) : null;

    const prev = yesterdaySnapshot ? (yesterdaySnapshot[address] ?? null) : null;
    const change_24hr =
      prev !== null ? balance_total - prev
      : taostats_24hr !== null ? balance_total - taostats_24hr
      : null;
    const change_24hr_pct =
      change_24hr !== null && (prev ?? taostats_24hr) !== null && (prev ?? taostats_24hr) !== 0
        ? (change_24hr / (prev ?? taostats_24hr!)) * 100
        : null;

    let label: "validator" | "exchange" | "foundation" | "unknown" = "unknown";
    let label_name: string | null = null;
    if (validatorMap[address]) { label = "validator"; label_name = validatorMap[address]; }
    else if (knownWallets.exchange[address]) { label = "exchange"; label_name = knownWallets.exchange[address]; }
    else if (knownWallets.foundation[address]) { label = "foundation"; label_name = knownWallets.foundation[address]; }

    return { rank: account.rank ?? i + 1, address, balance_total, balance_free, balance_staked, change_24hr, change_24hr_pct, label, label_name };
  });
}

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Serve from KV if fresh (cron keeps this warm every 30 min)
    const cached = await kv.get<{ data: Awaited<ReturnType<typeof fetchLive>>; fetched_at: number }>("whales:current");
    if (cached?.data) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=300",
          "X-Cache": "HIT",
          "X-Cached-At": new Date(cached.fetched_at).toISOString(),
        },
      });
    }

    // KV empty (first deploy) — fetch live and warm the cache
    const whales = await fetchLive(apiKey);
    await kv.set("whales:current", { data: whales, fetched_at: Date.now() }, { ex: 35 * 60 });

    return NextResponse.json(whales, {
      headers: {
        "Cache-Control": "s-maxage=1800, stale-while-revalidate=300",
        "X-Cache": "MISS",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch whale data:", err);
    return NextResponse.json({ error: "Failed to fetch whale data", detail: msg }, { status: 502 });
  }
}

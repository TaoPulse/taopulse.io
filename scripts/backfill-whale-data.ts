/**
 * scripts/backfill-whale-data.ts
 *
 * Backfills 30 days of balance history, transfers, and delegations
 * for the top 100 TaoStats wallets into Supabase.
 *
 * Usage:
 *   npx tsx scripts/backfill-whale-data.ts
 *
 * Env vars required:
 *   TAOSTATS_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Rate: 1 wallet every 8 seconds (~14 minutes for 100 wallets)
 */

import { createClient } from "@supabase/supabase-js";

const TAOSTATS_BASE = "https://api.taostats.io";
const DELAY_MS = 8_000; // 8 seconds between wallets

// ── helpers ───────────────────────────────────────────────────────────────────

function toTao(raw: unknown): number {
  return parseFloat(String(raw ?? "0")) / 1e9;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function isoDate(ts: unknown): string | null {
  if (!ts) return null;
  try {
    return new Date(String(ts)).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function isoTimestamp(ts: unknown): string | null {
  if (!ts) return null;
  try {
    return new Date(String(ts)).toISOString();
  } catch {
    return null;
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) throw new Error("TAOSTATS_API_KEY is required");
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

  const supabase = createClient(supabaseUrl, supabaseKey);
  const fetchOpts = { headers: { Authorization: apiKey } };

  // ── 1. Fetch top 100 wallets ─────────────────────────────────────────────
  log("Fetching top 100 wallets from TaoStats...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wallets: any[] = [];

  for (const page of [1, 2]) {
    const limit = 50;
    const res = await fetch(
      `${TAOSTATS_BASE}/api/account/latest/v1?order_by=balance_total_desc&limit=${limit}&page=${page}`,
      fetchOpts
    ).then((r) => r.json());
    wallets.push(...(res.data ?? []));
    if (wallets.length >= 100) break;
  }

  const top100 = wallets.slice(0, 100);
  log(`Got ${top100.length} wallets. Starting backfill with ${DELAY_MS / 1000}s delay between wallets...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < top100.length; i++) {
    const account = top100[i];
    const address =
      typeof account.address === "object"
        ? (account.address?.ss58 ?? "")
        : (account.address ?? "");

    if (!address) {
      log(`[${i + 1}/100] Skipping wallet with no address`);
      continue;
    }

    log(`[${i + 1}/100] Processing ${address}...`);

    try {
      // ── 2a. Balance history (30 days) ──────────────────────────────────────
      const histRes = await fetch(
        `${TAOSTATS_BASE}/api/account/history/v1?address=${address}&limit=30&order=timestamp_desc`,
        fetchOpts
      ).then((r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshots = (histRes.data ?? []).map((item: any) => {
        const ts = item.timestamp ?? item.block_timestamp ?? item.date;
        const date = isoDate(ts);
        if (!date) return null;
        return {
          address,
          date,
          balance_total: toTao(item.balance_total ?? item.balance),
          balance_free: toTao(item.balance_free ?? 0),
          balance_staked: toTao(item.balance_staked ?? 0),
          rank: item.rank ?? account.rank ?? null,
        };
      }).filter(Boolean);

      if (snapshots.length > 0) {
        const { error: snapErr } = await supabase
          .from("whale_snapshots")
          .upsert(snapshots, { onConflict: "address,date" });
        if (snapErr) log(`  WARN snapshots upsert: ${snapErr.message}`);
        else log(`  snapshots: ${snapshots.length} rows upserted`);
      }

      // ── 2b. Transfers ──────────────────────────────────────────────────────
      const txRes = await fetch(
        `${TAOSTATS_BASE}/api/transfer/v1?coldkey=${address}&limit=100&order=timestamp_desc`,
        fetchOpts
      ).then((r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions = (txRes.data ?? []).map((item: any) => {
        const fromAddr =
          typeof item.from === "object" ? (item.from?.ss58 ?? "") : (item.from ?? "");
        const toAddr =
          typeof item.to === "object" ? (item.to?.ss58 ?? "") : (item.to ?? "");
        const isInbound = toAddr === address;
        const counterparty = isInbound ? fromAddr : toAddr;
        const blockNum = item.block_number ?? item.block ?? null;
        const txHash = item.extrinsic_id ?? item.transaction_hash ?? item.hash ?? null;
        const id = `${address}-${blockNum}-${txHash ?? ""}`;
        return {
          id,
          address,
          type: isInbound ? "transfer_in" : "transfer_out",
          amount: toTao(item.amount),
          counterparty: counterparty || null,
          block_number: blockNum ? parseInt(String(blockNum), 10) : null,
          timestamp: isoTimestamp(item.timestamp ?? item.block_timestamp),
          transaction_hash: txHash ?? null,
        };
      });

      if (transactions.length > 0) {
        const { error: txErr } = await supabase
          .from("whale_transactions")
          .upsert(transactions, { onConflict: "id" });
        if (txErr) log(`  WARN transactions upsert: ${txErr.message}`);
        else log(`  transactions: ${transactions.length} rows upserted`);
      }

      // ── 2c. Delegations ────────────────────────────────────────────────────
      const delRes = await fetch(
        `${TAOSTATS_BASE}/api/delegation/v1?coldkey=${address}&limit=100&order=timestamp_desc`,
        fetchOpts
      ).then((r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegations = (delRes.data ?? []).map((item: any) => {
        const delegate =
          typeof item.delegate === "object"
            ? (item.delegate?.ss58 ?? item.delegate?.hotkey ?? "")
            : (item.delegate ?? item.hotkey ?? "");
        const blockNum = item.block_number ?? item.block ?? null;
        const netuid = item.netuid ?? null;
        const action = (item.action ?? item.type ?? "DELEGATE").toUpperCase();
        const id = `${address}-${blockNum}-${action}-${delegate}-${netuid ?? 0}`;
        return {
          id,
          address,
          action,
          delegate: delegate || "",
          delegate_name: item.delegate_name ?? item.validator_name ?? null,
          netuid: netuid !== null ? parseInt(String(netuid), 10) : null,
          amount: toTao(item.amount ?? item.tao ?? 0),
          alpha: item.alpha != null ? toTao(item.alpha) : null,
          usd: item.usd != null ? parseFloat(String(item.usd)) : null,
          alpha_price_in_tao:
            item.alpha_price_in_tao != null
              ? parseFloat(String(item.alpha_price_in_tao))
              : null,
          alpha_price_in_usd:
            item.alpha_price_in_usd != null
              ? parseFloat(String(item.alpha_price_in_usd))
              : null,
          timestamp: isoTimestamp(item.timestamp ?? item.block_timestamp),
          block_number: blockNum ? parseInt(String(blockNum), 10) : null,
        };
      });

      if (delegations.length > 0) {
        const { error: delErr } = await supabase
          .from("whale_delegations")
          .upsert(delegations, { onConflict: "id" });
        if (delErr) log(`  WARN delegations upsert: ${delErr.message}`);
        else log(`  delegations: ${delegations.length} rows upserted`);
      }

      successCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  ERROR processing ${address}: ${msg}`);
      errorCount++;
    }

    // Rate limit: wait 8s between wallets (skip delay after last wallet)
    if (i < top100.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  log(`Backfill complete. Success: ${successCount}, Errors: ${errorCount}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

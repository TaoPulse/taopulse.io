/**
 * Backfill script: populate Supabase whale history tables for top 100 wallets.
 *
 * Usage:
 *   npx tsx scripts/backfill-whale-history.ts           # process all 100
 *   npx tsx scripts/backfill-whale-history.ts --start=55  # resume from wallet 55
 *
 * Tables populated:
 *   - whale_snapshots       (30-day balance history per wallet)
 *   - whale_transactions    (transfer history per wallet)
 *   - whale_delegations     (delegation events per wallet)
 *   - whale_alpha_balances  (today's alpha staking positions)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TAOSTATS_BASE = "https://api.taostats.io";
const TAOSTATS_API_KEY = process.env.TAOSTATS_API_KEY ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const fetchOpts = {
  headers: { Authorization: TAOSTATS_API_KEY },
};

function toTao(raw: unknown): number {
  return parseFloat(String(raw ?? "0")) / 1e9;
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Parse --start=N argument (1-indexed)
  const startArg = process.argv.find((a) => a.startsWith("--start="));
  const startFrom = startArg ? Math.max(1, parseInt(startArg.split("=")[1], 10)) : 1;
  if (startFrom > 1) console.log(`Resuming from wallet ${startFrom}...\n`);
  else console.log("Starting whale history backfill...\n");

  // ── Step 1: Fetch top 100 wallets ────────────────────────────────────────
  console.log("Fetching top 100 wallets from TaoStats...");
  const accountsRes = await fetch(
    `${TAOSTATS_BASE}/api/account/latest/v1?order_by=balance_total&limit=100&page=1`,
    fetchOpts
  ).then((r) => r.json());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts: any[] = accountsRes.data ?? [];
  if (accounts.length === 0) {
    console.error("No accounts returned from TaoStats. Aborting.");
    process.exit(1);
  }
  console.log(`Fetched ${accounts.length} wallets.\n`);

  // Counters for summary
  let totalSnapshots = 0;
  let totalTransactions = 0;
  let totalDelegations = 0;
  let totalAlphaBalances = 0;

  const today = todayDate();

  // ── Step 2: Process each wallet one at a time ────────────────────────────
  for (let idx = startFrom - 1; idx < accounts.length; idx++) {
    const account = accounts[idx];
    const address =
      typeof account.address === "object"
        ? (account.address?.ss58 ?? "")
        : (account.address ?? "");

    if (!address) {
      console.warn(`Wallet ${idx + 1}/${accounts.length}: no address, skipping`);
      continue;
    }

    const rank = account.rank ?? idx + 1;
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

    let snapshotCount = 0;
    let txCount = 0;
    let delCount = 0;
    let alphaCount = 0;

    try {
      // ── 2a. Balance history ─────────────────────────────────────────────
      const histRes = await fetch(
        `${TAOSTATS_BASE}/api/account/history/v1?address=${address}&limit=30&order=timestamp_desc`,
        fetchOpts
      ).then((r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshotRows: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of (histRes.data ?? []) as any[]) {
        const ts = item.timestamp ?? item.block_timestamp ?? item.date;
        if (!ts) continue;
        const date = new Date(ts).toISOString().slice(0, 10);
        snapshotRows.push({
          address,
          date,
          balance_total: toTao(item.balance_total ?? item.balance),
          balance_free: toTao(item.balance_free ?? 0),
          balance_staked: toTao(item.balance_staked ?? 0),
          rank: item.rank ?? rank,
        });
      }

      if (snapshotRows.length > 0) {
        const { error } = await supabase
          .from("whale_snapshots")
          .upsert(snapshotRows, { onConflict: "address,date" });
        if (error) console.error(`  [snapshots] upsert error for ${shortAddr}:`, error.message);
        else snapshotCount = snapshotRows.length;
      }

      // ── 2b. Transfers ───────────────────────────────────────────────────
      const txRes = await fetch(
        `${TAOSTATS_BASE}/api/transfer/v1?address=${address}&limit=100`,
        fetchOpts
      ).then((r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txRows: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of (txRes.data ?? []) as any[]) {
        const toAddr =
          typeof item.to === "object" ? (item.to?.ss58 ?? "") : (item.to ?? "");
        const fromAddr =
          typeof item.from === "object" ? (item.from?.ss58 ?? "") : (item.from ?? "");
        const type = toAddr === address ? "transfer_in" : "transfer_out";
        const counterparty = type === "transfer_in" ? fromAddr : toAddr;

        if (!item.id || !item.timestamp) continue;

        txRows.push({
          id: String(item.id),
          address,
          type,
          amount: toTao(item.amount),
          counterparty: counterparty || null,
          block_number: item.block_number ?? null,
          timestamp: item.timestamp,
          transaction_hash: item.transaction_hash ?? null,
        });
      }

      if (txRows.length > 0) {
        const { error } = await supabase
          .from("whale_transactions")
          .upsert(txRows, { onConflict: "id" });
        if (error) console.error(`  [transactions] upsert error for ${shortAddr}:`, error.message);
        else txCount = txRows.length;
      }

      // ── 2c. Delegations ─────────────────────────────────────────────────
      const delRes = await fetch(
        `${TAOSTATS_BASE}/api/delegation/v1?nominator=${address}&limit=100`,
        fetchOpts
      ).then((r) => r.json());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delRows: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of (delRes.data ?? []) as any[]) {
        const nominatorAddr =
          typeof item.nominator === "object"
            ? (item.nominator?.ss58 ?? "")
            : (item.nominator ?? "");
        const delegateAddr =
          typeof item.delegate === "object"
            ? (item.delegate?.ss58 ?? "")
            : (item.delegate ?? "");

        if (!item.id || !item.timestamp) continue;

        delRows.push({
          id: String(item.id),
          address: nominatorAddr || address,
          action: item.action,
          delegate: delegateAddr || null,
          delegate_name: item.delegate_name ?? null,
          netuid: item.netuid ?? null,
          amount: toTao(item.amount),
          alpha: item.alpha != null ? toTao(item.alpha) : null,
          usd: item.usd != null ? parseFloat(String(item.usd)) : null,
          alpha_price_in_tao: item.alpha_price_in_tao != null ? parseFloat(String(item.alpha_price_in_tao)) : null,
          alpha_price_in_usd: item.alpha_price_in_usd != null ? parseFloat(String(item.alpha_price_in_usd)) : null,
          block_number: item.block_number ?? null,
          timestamp: item.timestamp,
        });
      }

      if (delRows.length > 0) {
        const { error } = await supabase
          .from("whale_delegations")
          .upsert(delRows, { onConflict: "id" });
        if (error) console.error(`  [delegations] upsert error for ${shortAddr}:`, error.message);
        else delCount = delRows.length;
      }

      // ── 2d. Alpha balances (today) ──────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alphaRows: any[] = [];

      // Root stake as netuid=0
      const balanceStakedRoot = toTao(account.balance_staked_root ?? 0);
      if (balanceStakedRoot > 0) {
        alphaRows.push({
          address,
          date: today,
          netuid: 0,
          hotkey: null,
          balance_alpha: 0,
          balance_as_tao: balanceStakedRoot,
          rank,
        });
      }

      // Alpha balances per subnet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const ab of (account.alpha_balances ?? []) as any[]) {
        alphaRows.push({
          address,
          date: today,
          netuid: ab.netuid,
          hotkey: ab.hotkey ?? null,
          balance_alpha: toTao(ab.balance),
          balance_as_tao: toTao(ab.balance_as_tao),
          rank,
        });
      }

      if (alphaRows.length > 0) {
        const { error } = await supabase
          .from("whale_alpha_balances")
          .upsert(alphaRows, { onConflict: "address,date,netuid,hotkey" });
        if (error) console.error(`  [alpha_balances] upsert error for ${shortAddr}:`, error.message);
        else alphaCount = alphaRows.length;
      }

      console.log(
        `Wallet ${idx + 1}/${accounts.length} [${shortAddr}]: ` +
        `${snapshotCount} snapshots, ${txCount} transfers, ${delCount} delegations, ${alphaCount} alpha positions`
      );

      totalSnapshots += snapshotCount;
      totalTransactions += txCount;
      totalDelegations += delCount;
      totalAlphaBalances += alphaCount;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Wallet ${idx + 1}/${accounts.length} [${shortAddr}]: ERROR — ${msg}`);
    }

    // 8 second delay between wallets (skip delay after last wallet)
    if (idx < accounts.length - 1) {
      await delay(8000);
    }
  }

  console.log("\n─── Backfill complete ───────────────────────────────────────");
  console.log(`whale_snapshots:      ${totalSnapshots} rows upserted`);
  console.log(`whale_transactions:   ${totalTransactions} rows upserted`);
  console.log(`whale_delegations:    ${totalDelegations} rows upserted`);
  console.log(`whale_alpha_balances: ${totalAlphaBalances} rows upserted`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

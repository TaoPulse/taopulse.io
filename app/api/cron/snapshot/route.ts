/**
 * Cron: /api/cron/snapshot
 *
 * Runs every 30 minutes via Vercel Cron (configured in vercel.json).
 * Fetches all whale data from TaoStats and stores in KV so every
 * analytics page reads from cache — zero live TaoStats calls for users.
 *
 * Stores:
 *   whales:current          — top 500 richlist (refreshed every run)
 *   whales:snapshot:DATE    — daily balance snapshot for 24hr/7d diffs
 *   whales:delegations      — UNDELEGATE events across top 500 (for TP-043)
 *   whales:staking-ratio    — time-series array of staking ratio snapshots
 *   analytics:concentration — concentration stats (top 10/50/100/500 share)
 *   analytics:exchange-flow — net transfer flow to/from known exchange wallets
 */

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { readFileSync } from "fs";
import path from "path";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const TAOSTATS_BASE = "https://api.taostats.io";

// How many days to retain staking-ratio time-series
const STAKING_RATIO_MAX_POINTS = 90;

type KnownWallets = {
  exchange: Record<string, string>;
  foundation: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTao(raw: any): number {
  return parseFloat(raw ?? "0") / 1e9;
}

function todayKey() {
  return "whales:snapshot:" + new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

export async function GET(req: Request) {
  // Protect: only Vercel cron or requests with the cron secret can call this
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const fetchOpts = { headers: { Authorization: apiKey }, cache: "no-store" as const };
  const startedAt = Date.now();

  try {
    // ── 1. Fetch top 500 wallets — try Supabase first (Phase 3), fall back to TaoStats ──
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = sbUrl && sbKey ? createClient(sbUrl, sbKey) : null;

    let richlistSource: "supabase" | "taostats" = "taostats";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allAccounts: any[] = [];

    if (supabase) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const { data: sbRows, error: sbErr } = await supabase
        .from("whale_snapshots")
        .select("address, balance_total, balance_free, balance_staked, rank")
        .eq("date", todayStr)
        .order("rank", { ascending: true })
        .limit(500);

      if (!sbErr && sbRows && sbRows.length >= 100) {
        richlistSource = "supabase";
        allAccounts = sbRows; // shape: { address, balance_total, balance_free, balance_staked, rank }
      } else {
        console.log(`Supabase richlist unavailable (${sbErr?.message ?? `only ${sbRows?.length ?? 0} rows`}), falling back to TaoStats`);
      }
    }

    // Still need validators + network stats from TaoStats regardless of richlist source
    const [validatorsRes, networkRes] = await Promise.all([
      fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?limit=200&netuid=0`, fetchOpts).then((r) => r.json()),
      fetch(`${TAOSTATS_BASE}/api/stat/latest/v1`, fetchOpts).then((r) => r.json()).catch(() => null),
    ]);

    // If Supabase didn't have enough data, fetch richlist from TaoStats
    if (richlistSource === "taostats") {
      const pageResults = await Promise.all(
        [1, 2, 3].map((page) =>
          fetch(
            `${TAOSTATS_BASE}/api/account/latest/v1?order_by=balance_total_desc&limit=200&page=${page}`,
            fetchOpts
          ).then((r) => r.json())
        )
      );
      allAccounts = pageResults.flatMap((p) => p.data ?? []).slice(0, 500);
    }

    // Validator name map
    const validatorMap: Record<string, string> = {};
    for (const v of validatorsRes.data ?? []) {
      const coldkey = typeof v.coldkey === "object" ? (v.coldkey?.ss58 ?? "") : (v.coldkey ?? "");
      if (coldkey && v.name) validatorMap[coldkey] = v.name;
    }

    // Known wallets
    let knownWallets: KnownWallets = { exchange: {}, foundation: {} };
    try {
      const p = path.join(process.cwd(), "data", "known-wallets.json");
      knownWallets = JSON.parse(readFileSync(p, "utf-8"));
    } catch { /* ignore */ }

    // Build whales array — handles both Supabase and TaoStats shapes
    const whales = allAccounts.map((account, i) => {
      const address =
        typeof account.address === "object" ? (account.address?.ss58 ?? "") : (account.address ?? "");

      const balance_total = richlistSource === "supabase" ? (account.balance_total ?? 0) : toTao(account.balance_total);
      const balance_free  = richlistSource === "supabase" ? (account.balance_free ?? 0)  : toTao(account.balance_free);
      const balance_staked = richlistSource === "supabase" ? (account.balance_staked ?? 0) : toTao(account.balance_staked);
      // taostats_24hr only available when source is TaoStats
      const taostats_24hr = richlistSource === "taostats" && account.balance_total_24hr_ago != null
        ? toTao(account.balance_total_24hr_ago)
        : null;

      let label: "validator" | "exchange" | "foundation" | "unknown" = "unknown";
      let label_name: string | null = null;
      if (validatorMap[address]) { label = "validator"; label_name = validatorMap[address]; }
      else if (knownWallets.exchange[address]) { label = "exchange"; label_name = knownWallets.exchange[address]; }
      else if (knownWallets.foundation[address]) { label = "foundation"; label_name = knownWallets.foundation[address]; }

      return { rank: account.rank ?? i + 1, address, balance_total, balance_free, balance_staked, taostats_24hr, label, label_name };
    });

    // ── 2. Load yesterday's snapshot for 24hr diff ──────────────────────────
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = "whales:snapshot:" + yesterday.toISOString().slice(0, 10);
    const yesterdaySnapshot = await kv.get<Record<string, number>>(yesterdayKey);

    // Enrich with 24hr change
    const whalesEnriched = whales.map((w) => {
      const prev = yesterdaySnapshot ? (yesterdaySnapshot[w.address] ?? null) : null;
      const change_24hr =
        prev !== null ? w.balance_total - prev
        : w.taostats_24hr !== null ? w.balance_total - w.taostats_24hr
        : null;
      const change_24hr_pct =
        change_24hr !== null && (prev ?? w.taostats_24hr) !== null && (prev ?? w.taostats_24hr) !== 0
          ? (change_24hr / (prev ?? w.taostats_24hr!)) * 100
          : null;
      return { ...w, change_24hr, change_24hr_pct };
    });

    // ── 3. Store whales:current (main richlist cache) ────────────────────────
    await kv.set("whales:current", { data: whalesEnriched, fetched_at: Date.now() }, { ex: 25 * 60 * 60 });

    // ── 3a. Upsert today's snapshots + alpha balances into Supabase ──────────
    // Skip snapshot upsert when source is Supabase (already there); still do alpha upsert if TaoStats was used
    if (supabase && richlistSource === "taostats") {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const top100 = whalesEnriched.slice(0, 100);

        // Build snapshot rows
        const snapshotRows = top100.map((w) => ({
          address: w.address,
          date: todayStr,
          balance_total: w.balance_total,
          balance_free: w.balance_free,
          balance_staked: w.balance_staked,
          rank: w.rank,
        }));

        const { error: snapErr } = await supabase
          .from("whale_snapshots")
          .upsert(snapshotRows, { onConflict: "address,date" });
        if (snapErr) console.error("Supabase snapshot upsert error:", snapErr.message);

        // Build alpha balance rows from the raw accounts (need to look up from allAccounts)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const alphaRows: any[] = [];
        for (let i = 0; i < allAccounts.length && i < 100; i++) {
          const account = allAccounts[i];
          const address =
            typeof account.address === "object"
              ? (account.address?.ss58 ?? "")
              : (account.address ?? "");
          if (!address) continue;
          const rank = account.rank ?? i + 1;

          // Root stake
          const rootStake = toTao(account.balance_staked_root ?? 0);
          if (rootStake > 0) {
            alphaRows.push({
              address,
              date: todayStr,
              netuid: 0,
              hotkey: null,
              balance_alpha: 0,
              balance_as_tao: rootStake,
              rank,
            });
          }

          // Per-subnet alpha
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const ab of (account.alpha_balances ?? []) as any[]) {
            alphaRows.push({
              address,
              date: todayStr,
              netuid: ab.netuid,
              hotkey: ab.hotkey ?? null,
              balance_alpha: toTao(ab.balance),
              balance_as_tao: toTao(ab.balance_as_tao),
              rank,
            });
          }
        }

        if (alphaRows.length > 0) {
          const { error: alphaErr } = await supabase
            .from("whale_alpha_balances")
            .upsert(alphaRows, { onConflict: "address,date,netuid,hotkey" });
          if (alphaErr) console.error("Supabase alpha upsert error:", alphaErr.message);
        }
      } catch (e) {
        console.error("Supabase upsert failed (non-fatal):", e);
      }
    }

    // ── 3b. Pre-fetch 30-day balance history for top 100 wallets ────────────
    let histPrefetched = 0, histSkipped = 0, histFailed = 0;
    const HIST_BATCH_SIZE = 5;
    const HIST_BATCH_DELAY = 300; // ms between batches
    const histTop100 = whalesEnriched.slice(0, 100);

    for (let i = 0; i < histTop100.length; i += HIST_BATCH_SIZE) {
      const batch = histTop100.slice(i, i + HIST_BATCH_SIZE);
      await Promise.all(batch.map(async (whale) => {
        const cacheKey = `whale-history:${whale.address}`;
        try {
          const existing = await kv.get<{ cached_at: number }>(cacheKey);
          if (existing && Date.now() - existing.cached_at < 22 * 3600 * 1000) {
            histSkipped++;
            return;
          }
          const res = await fetch(
            `${TAOSTATS_BASE}/api/account/history/v1?address=${whale.address}&limit=30&order=timestamp_desc`,
            fetchOpts
          ).then((r) => r.json());

          const points: Array<{
            date: string;
            balance_total: number;
            balance_free: number;
            balance_staked: number;
            rank: number | null;
            source: "taostats" | "kv_snapshot";
          }> = [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const item of (res.data ?? []) as any[]) {
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

          points.sort((a, b) => a.date.localeCompare(b.date));
          await kv.set(cacheKey, { points, cached_at: Date.now() }, { ex: 25 * 3600 });
          histPrefetched++;
        } catch {
          histFailed++;
        }
      }));

      if (i + HIST_BATCH_SIZE < histTop100.length) {
        await new Promise((resolve) => setTimeout(resolve, HIST_BATCH_DELAY));
      }
    }

    // ── 4. Store today's balance snapshot (once per day) ────────────────────
    const todaySnap = todayKey();
    const hasToday = await kv.exists(todaySnap);
    if (!hasToday) {
      const snap: Record<string, number> = {};
      for (const w of whales) snap[w.address] = w.balance_total;
      await kv.set(todaySnap, snap, { ex: 48 * 3600 });
    }

    // ── 5. Store staking ratio time-series (TP-042) ──────────────────────────
    const totalTao = whales.reduce((s, w) => s + w.balance_total, 0);
    const stakedTao = whales.reduce((s, w) => s + w.balance_staked, 0);
    const stakingRatioPoint = {
      ts: nowIso(),
      ratio: totalTao > 0 ? (stakedTao / totalTao) * 100 : 0,
      total_tao: totalTao,
      staked_tao: stakedTao,
    };

    const existingRatios = await kv.get<typeof stakingRatioPoint[]>("whales:staking-ratio") ?? [];
    const updatedRatios = [...existingRatios, stakingRatioPoint].slice(-STAKING_RATIO_MAX_POINTS * 48); // 48 per day
    await kv.set("whales:staking-ratio", updatedRatios, { ex: 120 * 24 * 3600 }); // 120 days TTL

    // ── 6. Concentration stats (TP-044) ──────────────────────────────────────
    const totalSupply = networkRes?.data?.[0]?.total_issuance
      ? toTao(networkRes.data[0].total_issuance)
      : whales.reduce((s, w) => s + w.balance_total, 0); // fallback: sum of top 500

    const sortedByTotal = [...whales].sort((a, b) => b.balance_total - a.balance_total);
    const concentration = {
      ts: nowIso(),
      total_supply_tao: totalSupply,
      top10: {
        wallets: 10,
        tao: sortedByTotal.slice(0, 10).reduce((s, w) => s + w.balance_total, 0),
        pct: 0,
      },
      top50: {
        wallets: 50,
        tao: sortedByTotal.slice(0, 50).reduce((s, w) => s + w.balance_total, 0),
        pct: 0,
      },
      top100: {
        wallets: 100,
        tao: sortedByTotal.slice(0, 100).reduce((s, w) => s + w.balance_total, 0),
        pct: 0,
      },
      top500: {
        wallets: 500,
        tao: sortedByTotal.slice(0, 500).reduce((s, w) => s + w.balance_total, 0),
        pct: 0,
      },
      gini: 0,
    };
    if (totalSupply > 0) {
      concentration.top10.pct = (concentration.top10.tao / totalSupply) * 100;
      concentration.top50.pct = (concentration.top50.tao / totalSupply) * 100;
      concentration.top100.pct = (concentration.top100.tao / totalSupply) * 100;
      concentration.top500.pct = (concentration.top500.tao / totalSupply) * 100;
    }
    // Gini coefficient across top 500
    const balances = sortedByTotal.map((w) => w.balance_total).sort((a, b) => a - b);
    const n = balances.length;
    if (n > 0) {
      const sumOfAbsDiffs = balances.reduce((s, bi, i) =>
        s + balances.reduce((ss, bj) => ss + Math.abs(bi - bj), 0), 0);
      const mean = balances.reduce((s, b) => s + b, 0) / n;
      concentration.gini = mean > 0 ? sumOfAbsDiffs / (2 * n * n * mean) : 0;
    }
    await kv.set("analytics:concentration", concentration, { ex: 25 * 60 * 60 });

    // ── 7. Accumulation index (TP-041) ────────────────────────────────────────
    // Net TAO change across top 100 wallets vs yesterday
    const top100 = whalesEnriched.slice(0, 100);
    const netChange24h = top100.reduce((s, w) => s + (w.change_24hr ?? 0), 0);
    const buyingCount = top100.filter((w) => (w.change_24hr ?? 0) > 0.01).length;
    const sellingCount = top100.filter((w) => (w.change_24hr ?? 0) < -0.01).length;
    const accumIndex = {
      ts: nowIso(),
      wallets_tracked: top100.length,
      net_change_24h: netChange24h,
      buying_count: buyingCount,
      selling_count: sellingCount,
      neutral_count: top100.length - buyingCount - sellingCount,
      signal: netChange24h > 100 ? "ACCUMULATING" : netChange24h < -100 ? "DISTRIBUTING" : "NEUTRAL",
    };
    await kv.set("analytics:accumulation-index", accumIndex, { ex: 25 * 60 * 60 });

    // ── 8. Exchange flow (TP-048) — transfers to/from known exchanges ─────────
    // We store a rolling window of exchange flow snapshots (24h cadence is fine)
    const exchangeAddresses = Object.keys(knownWallets.exchange);
    if (exchangeAddresses.length > 0) {
      try {
        const flowResults = await Promise.all(
          exchangeAddresses.slice(0, 10).map((addr) =>
            fetch(
              `${TAOSTATS_BASE}/api/transfer/v1?coldkey=${addr}&limit=50&order=timestamp_desc`,
              fetchOpts
            ).then((r) => r.json()).catch(() => ({ data: [] }))
          )
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allTransfers: any[] = flowResults.flatMap((r) => r.data ?? []);
        const cutoff = Date.now() - 24 * 3600 * 1000;
        const recent = allTransfers.filter((t) => {
          const ts = t.timestamp ?? t.block_timestamp;
          return ts && new Date(ts).getTime() > cutoff;
        });
        const inflow = recent
          .filter((t) => exchangeAddresses.includes(
            typeof t.to === "object" ? (t.to?.ss58 ?? "") : (t.to ?? "")
          ))
          .reduce((s: number, t: { amount: unknown }) => s + toTao(t.amount), 0);
        const outflow = recent
          .filter((t) => exchangeAddresses.includes(
            typeof t.from === "object" ? (t.from?.ss58 ?? "") : (t.from ?? "")
          ))
          .reduce((s: number, t: { amount: unknown }) => s + toTao(t.amount), 0);
        const exchangeFlow = {
          ts: nowIso(),
          inflow_tao: inflow,   // TAO sent TO exchanges (selling pressure)
          outflow_tao: outflow, // TAO sent FROM exchanges (buying pressure)
          net_tao: outflow - inflow, // positive = net buying, negative = net selling
          transfer_count: recent.length,
        };
        await kv.set("analytics:exchange-flow", exchangeFlow, { ex: 25 * 60 * 60 });
      } catch { /* exchange flow is best-effort */ }
    }

    // ── 9. Fire whale alerts (Phase 4) ──────────────────────────────────────
    let alertsFired = 0;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);

        // Check each whale that has a balance drop
        const whalesWithDrop = whalesEnriched.filter(
          (w) => w.change_24hr !== null && w.change_24hr < 0
        );

        for (const whale of whalesWithDrop) {
          const dropPct = Math.abs(
            whale.change_24hr_pct ?? 0
          );
          if (dropPct < 1) continue; // ignore tiny fluctuations

          // Get subscribers for this address
          const subs = await kv.smembers<string[]>(`watch:subs:${whale.address}`).catch(() => [] as string[]);
          if (!subs || subs.length === 0) continue;

          for (const sub of subs) {
            const [email, threshStr] = sub.split("|");
            const threshold = parseFloat(threshStr ?? "5");
            if (dropPct < threshold) continue; // below their threshold

            const shortAddr = `${whale.address.slice(0, 8)}…${whale.address.slice(-8)}`;
            const dropTao = Math.abs(whale.change_24hr ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
            const dropPctFmt = dropPct.toFixed(1);

            await resend.emails.send({
              from: "TaoPulse Alerts <alerts@taopulse.io>",
              to: email,
              subject: `🚨 Whale alert: ${shortAddr} dropped ${dropPctFmt}% (${dropTao} τ)`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#080d14;color:#e5e7eb;padding:32px;border-radius:12px">
                  <img src="https://taopulse.io/logo.jpg" alt="TaoPulse" style="height:40px;margin-bottom:24px" />
                  <h2 style="color:#f87171;margin:0 0 8px">🚨 Whale balance dropped</h2>
                  <p style="color:#9ca3af;margin:0 0 24px">A wallet you're watching has significantly reduced its TAO holdings.</p>
                  <div style="background:#0f1623;border:1px solid #7f1d1d;border-radius:8px;padding:16px;margin-bottom:24px">
                    <p style="font-family:monospace;color:#a78bfa;margin:0 0 12px;word-break:break-all">${whale.address}</p>
                    <table style="width:100%;font-size:14px;border-collapse:collapse">
                      <tr>
                        <td style="color:#9ca3af;padding:4px 0">Rank</td>
                        <td style="color:#fff;text-align:right">#${whale.rank}</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af;padding:4px 0">Current Balance</td>
                        <td style="color:#fff;text-align:right">${whale.balance_total.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af;padding:4px 0">24h Change</td>
                        <td style="color:#f87171;text-align:right">−${dropTao} τ (${dropPctFmt}%)</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af;padding:4px 0">Free TAO</td>
                        <td style="color:#fff;text-align:right">${whale.balance_free.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af;padding:4px 0">Staked TAO</td>
                        <td style="color:#fff;text-align:right">${whale.balance_staked.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ</td>
                      </tr>
                    </table>
                  </div>
                  <a href="https://taopulse.io/wallet/${whale.address}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:16px">
                    View Full Wallet →
                  </a>
                  &nbsp;
                  <a href="https://taopulse.io/whales" style="display:inline-block;background:#1f2937;color:#d1d5db;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:16px">
                    Whale Tracker →
                  </a>
                  <p style="color:#374151;font-size:12px;margin:24px 0 0">
                    You set a ${threshold}% alert threshold for this wallet. To stop alerts, reply "unwatch" or manage your alerts at taopulse.io.
                  </p>
                </div>
              `,
            }).catch((e: unknown) => console.error("Alert email failed:", e));

            alertsFired++;

            // Also post to Discord #taopulse-alerts
            const alertWebhook = process.env.DISCORD_TAOPULSE_ALERT_WEBHOOK;
            if (alertWebhook) {
              const shortAddr = `${whale.address.slice(0, 8)}…${whale.address.slice(-8)}`;
              await fetch(alertWebhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  embeds: [{
                    title: `🚨 Whale Alert: ${shortAddr}`,
                    color: 0xef4444,
                    url: `https://taopulse.io/wallet/${whale.address}`,
                    fields: [
                      { name: "Rank", value: `#${whale.rank}`, inline: true },
                      { name: "Balance", value: `${whale.balance_total.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ`, inline: true },
                      { name: "24h Change", value: `−${Math.abs(whale.change_24hr ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} τ (${dropPctFmt}%)`, inline: true },
                      { name: "Free TAO", value: `${whale.balance_free.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ`, inline: true },
                      { name: "Staked TAO", value: `${whale.balance_staked.toLocaleString("en-US", { maximumFractionDigits: 0 })} τ`, inline: true },
                      { name: "Threshold triggered", value: `${threshold}% (${email})`, inline: true },
                    ],
                    footer: { text: whale.address },
                    timestamp: new Date().toISOString(),
                  }],
                }),
              }).catch((e) => console.error("Discord alert webhook failed:", e));
            }
          }
        }
      } catch (e) {
        console.error("Alert processing failed:", e);
      }
    }

    const elapsed = Date.now() - startedAt;

    // ── 10. Supabase validation — 30-day coverage check ──────────────────────
    let validationSummary = "Supabase not configured";
    let validationPass = false;
    try {
      const sbUrl = process.env.SUPABASE_URL;
      const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (sbUrl && sbKey) {
        const supabase = createClient(sbUrl, sbKey);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

        // Count distinct wallets with ≥7 snapshots in last 30 days (proxy for coverage)
        let coverageData = null, covErr: { message: string } | null = null;
        try {
          const res = await supabase
            .rpc("whale_coverage_check", { cutoff_date: cutoff })
            .single();
          coverageData = res.data;
          covErr = res.error as { message: string } | null;
        } catch {
          covErr = { message: "rpc not available" };
        }

        if (covErr) {
          // Fallback: manual query
          const { data: snapshotCounts, error: scErr } = await supabase
            .from("whale_snapshots")
            .select("address")
            .gte("date", cutoff);

          if (scErr) {
            validationSummary = `❌ Supabase query failed: ${scErr.message}`;
          } else {
            const addressMap: Record<string, number> = {};
            for (const row of snapshotCounts ?? []) {
              addressMap[row.address] = (addressMap[row.address] ?? 0) + 1;
            }
            const totalTracked = Object.keys(addressMap).length;
            const wellCovered = Object.values(addressMap).filter((c) => c >= 7).length;
            const avgDays = totalTracked > 0
              ? (Object.values(addressMap).reduce((s, c) => s + c, 0) / totalTracked).toFixed(1)
              : "0";
            validationPass = wellCovered >= 80; // pass if ≥80 of top 100 have ≥7 days
            validationSummary = `${validationPass ? "✅" : "⚠️"} ${totalTracked} wallets tracked | ${wellCovered}/100 with ≥7 days coverage | avg ${avgDays} days`;
          }
        } else if (coverageData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = coverageData as any;
          validationPass = d.well_covered >= 80;
          validationSummary = `${validationPass ? "✅" : "⚠️"} ${d.total_tracked} wallets | ${d.well_covered}/100 with ≥7 days | avg ${d.avg_days} days`;
        }
      }
    } catch (ve) {
      validationSummary = `❌ Validation error: ${ve instanceof Error ? ve.message : String(ve)}`;
    }

    // ── 11. Discord cron summary ─────────────────────────────────────────────
    const cronWebhook = process.env.DISCORD_TAOPULSE_CRON_WEBHOOK;
    if (cronWebhook) {
      const accumSignalEmoji =
        accumIndex.signal === "ACCUMULATING" ? "🟢" :
        accumIndex.signal === "DISTRIBUTING" ? "🔴" : "⚪";
      const netChangeFmt = accumIndex.net_change_24h >= 0
        ? `+${accumIndex.net_change_24h.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
        : accumIndex.net_change_24h.toLocaleString("en-US", { maximumFractionDigits: 0 });
      const stakingPct = totalTao > 0 ? ((stakedTao / totalTao) * 100).toFixed(1) : "—";
      const ts = Math.floor(Date.now() / 1000);

      await fetch(cronWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🐋 TaoPulse Cron — Snapshot Complete",
            color: 0x7c3aed,
            fields: [
              { name: "Wallets fetched", value: `${whales.length}`, inline: true },
              { name: "Elapsed", value: `${(elapsed / 1000).toFixed(1)}s`, inline: true },
              { name: "Alerts fired", value: `${alertsFired}`, inline: true },
              { name: `${accumSignalEmoji} Signal`, value: accumIndex.signal, inline: true },
              { name: "Net 24h change (top 100)", value: `${netChangeFmt} τ`, inline: true },
              { name: "Staking ratio (top 500)", value: `${stakingPct}%`, inline: true },
              { name: "Buying / Selling", value: `${accumIndex.buying_count} 🟢 / ${accumIndex.selling_count} 🔴`, inline: true },
              { name: "Richlist source", value: richlistSource === "supabase" ? "✅ Supabase (chain)" : "⚠️ TaoStats (fallback)", inline: false },
              { name: "Hist prefetch", value: `${histPrefetched} fetched, ${histSkipped} skipped, ${histFailed} failed`, inline: false },
              { name: "Supabase validation", value: validationSummary, inline: false },
            ],
            footer: { text: "taopulse.io" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch((e) => console.error("Discord cron webhook failed:", e));
    }

    return NextResponse.json({
      ok: true,
      elapsed_ms: elapsed,
      richlist_source: richlistSource,
      wallets: whales.length,
      alerts_fired: alertsFired,
      history_prefetch: { pre_fetched: histPrefetched, skipped: histSkipped, failed: histFailed },
      keys_updated: [
        "whales:current",
        hasToday ? "(snapshot already exists today)" : todaySnap,
        "whales:staking-ratio",
        "analytics:concentration",
        "analytics:accumulation-index",
        "analytics:exchange-flow",
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Cron snapshot failed:", err);

    // Discord error alert
    const errorWebhook = process.env.DISCORD_TAOPULSE_ERROR_WEBHOOK;
    if (errorWebhook) {
      await fetch(errorWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🚨 TaoPulse Cron — FAILED",
            color: 0xef4444,
            description: `\`\`\`${msg}\`\`\``,
            footer: { text: "taopulse.io" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ error: "Snapshot failed", detail: msg }, { status: 500 });
  }
}

# Whale Analytics — Supabase Backend Setup

_Built: 2026-03-27_

---

## Overview

4 Supabase tables store whale wallet data:

| Table | What it holds |
|-------|--------------|
| `whale_snapshots` | Daily TAO balance per wallet (total, free, staked, rank) |
| `whale_alpha_balances` | Daily per-subnet alpha token positions |
| `whale_transactions` | TAO transfers in/out |
| `whale_delegations` | Stake/unstake events with alpha + USD amounts |

---

## Step 1 — Run the SQL Migration

Go to your **Supabase dashboard → SQL Editor** and paste + run:

```
supabase/migrations/20260327000000_whale_analytics.sql
```

This creates all 4 tables with indexes. Safe to re-run (`CREATE TABLE IF NOT EXISTS`).

---

## Step 2 — Set Environment Variables

### Vercel (for cron + API)
Add these in Vercel → Project Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (not anon key) |
| `TAOSTATS_API_KEY` | TaoStats API key (already set) |

### Local (for backfill script)
Create a `.env.local` file or export in terminal:
```bash
export TAOSTATS_API_KEY=your_key
export NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 3 — Run the Backfill (once, tonight)

```bash
cd projects/taopulse-next
npx tsx scripts/backfill-whale-data.ts
```

**What it does:**
- Fetches top 100 wallets from TaoStats
- For each wallet: 30-day balance history + transfers + delegations
- Alpha balances: today's snapshot only (no historical API available)
- Rate: 1 wallet every 8 seconds → ~14 minutes total
- Logs progress per wallet, skips errors and continues

**Expected output:**
```
[1/100] 5DCkNq... ✓ (32 snapshots, 15 txns, 8 delegations)
[2/100] 7Gkm3p... ✓ (30 snapshots, 0 txns, 22 delegations)
...
Backfill complete. 100 wallets processed.
```

---

## Step 4 — Verify in Supabase

After backfill, check in Supabase Table Editor:
- `whale_snapshots` → should have ~3,000 rows (100 wallets × 30 days)
- `whale_transactions` → varies per wallet
- `whale_delegations` → varies per wallet
- `whale_alpha_balances` → ~100–500 rows (today only)

---

## Ongoing — Daily Cron

The cron at `/api/cron/snapshot` runs daily at midnight UTC and automatically:

1. Fetches fresh richlist from TaoStats
2. Stores in KV (`whales:current`, 25h TTL)
3. Upserts today's row to `whale_snapshots` (all 500 wallets)
4. Fetches transfers + delegations for top 100 → upserts to `whale_transactions` + `whale_delegations`
5. Derives alpha balances from delegation data → upserts to `whale_alpha_balances`

No manual action needed after Step 3.

---

## How the API Uses It

`/api/whale-history?address=<ss58>`

1. Checks KV cache (25h TTL) — returns immediately if warm
2. Queries Supabase: `SELECT * FROM whale_snapshots WHERE address = $1 ORDER BY date DESC LIMIT 30`
3. Falls back to KV daily snapshots for any gaps
4. Caches result in KV for next request

---

## Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260327000000_whale_analytics.sql` | Table definitions |
| `lib/types/whale.ts` | TypeScript row types |
| `scripts/backfill-whale-data.ts` | One-time backfill |
| `app/api/cron/snapshot/route.ts` | Daily cron (updated) |
| `app/api/whale-history/route.ts` | Balance history API (updated) |
| `lib/supabase-server.ts` | Supabase admin client |

---

## Troubleshooting

**Backfill fails on wallet X:** Script logs the error and continues. Re-run after fixing — upserts are idempotent, no duplicates.

**Cron times out:** The cron does a lot in one run. If Vercel logs show timeout, consider splitting into two cron jobs.

**whale-history returns empty:** Either backfill hasn't run yet, or Supabase env vars aren't set in Vercel. Check Vercel logs.

**Supabase key error:** Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) — the service role bypasses row-level security.

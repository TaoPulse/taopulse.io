# Whale Analytics — Supabase Backend

_Built: 2026-03-27 | Last updated: 2026-03-28_

---

## Overview

4 Supabase tables store whale wallet data:

| Table | What it holds |
|-------|--------------|
| `whale_snapshots` | Daily TAO balance per wallet (total, free, staked, rank) |
| `whale_alpha_balances` | Daily per-subnet alpha staking positions per hotkey |
| `whale_transactions` | TAO transfers in/out |
| `whale_delegations` | Stake/unstake events with alpha + USD amounts |

---

## Data Flow

```
Chain (Bittensor RPC)
  ↓  nightly (4 AM UTC, GitHub Actions)
Supabase  ←  one-time backfill (TaoStats, seeded 2026-03-27, won't run again)
  ↓  on API request
KV Cache (23h TTL)
  ↓
UI (/whales, /wallet/[address])
```

TaoStats is **no longer used** for these 4 tables. The nightly chain scan is the sole ongoing writer.

---

## Table Structures

**`whale_snapshots`** — PK: `(address, date)`
| Column | Type | Notes |
|--------|------|-------|
| `address` | text | Coldkey (ss58) |
| `date` | date | |
| `balance_total` | numeric | Free + staked (TAO) |
| `balance_free` | numeric | |
| `balance_staked` | numeric | |
| `rank` | int | Among all wallets that day |

**`whale_alpha_balances`** — PK: `(address, date, netuid, hotkey)`
| Column | Type | Notes |
|--------|------|-------|
| `address` | text | Coldkey (ss58) |
| `date` | date | |
| `netuid` | int | Subnet ID |
| `hotkey` | text | Validator being staked to |
| `balance_alpha` | numeric | Raw alpha tokens |
| `balance_as_tao` | numeric | Alpha converted to TAO equivalent |
| `rank` | int | |

> **Note:** `hotkey` is part of the primary key. One coldkey can stake to multiple validators on the same subnet — without `hotkey` in the PK, upserts would overwrite and lose data.

**`whale_transactions`** — PK: `id`, unique `(address, block_number, tx_hash)`
| Column | Type | Notes |
|--------|------|-------|
| `address` | text | Coldkey |
| `type` | text | IN / OUT |
| `amount` | numeric | TAO |
| `counterparty` | text | Other side of transfer |
| `block_number` | bigint | |
| `timestamp` | timestamptz | |
| `transaction_hash` | text | |

**`whale_delegations`** — PK: `id`, unique `(address, block_number, action, delegate, netuid)`
| Column | Type | Notes |
|--------|------|-------|
| `address` | text | Coldkey |
| `action` | text | DELEGATE / UNDELEGATE |
| `delegate` | text | Hotkey being staked to |
| `delegate_name` | text | Validator name if known |
| `netuid` | int | |
| `amount` | numeric | TAO |
| `alpha` | numeric | Alpha tokens |
| `usd` | numeric | USD equivalent |
| `alpha_price_in_tao` | numeric | |
| `alpha_price_in_usd` | numeric | |
| `timestamp` | timestamptz | |
| `block_number` | bigint | |

---

## Current Data Status (as of 2026-03-28)

| Table | Rows | Wallets | Days |
|-------|------|---------|------|
| `whale_snapshots` | 3,169 | 102 | 31 (2026-02-25 → 2026-03-27) |
| `whale_alpha_balances` | 4,150 | 34 | 1 (today only — nightly scan, 34 wallets have alpha positions) |
| `whale_transactions` | 3,962 | 20 | historical (2022-10 → 2026-03-27) |
| `whale_delegations` | 220 | 4 | historical |

> `whale_alpha_balances` has 34 wallets because only 34 of the top 500 have alpha staking positions on chain. The rest hold free TAO only — this is correct, not a bug.

---

## Who Writes to Each Table

| Table | Writer | Frequency | Source |
|-------|--------|-----------|--------|
| `whale_snapshots` | Nightly chain scan | Daily, 4 AM UTC | Bittensor chain direct |
| `whale_alpha_balances` | Nightly chain scan | Daily, 4 AM UTC | Bittensor chain direct |
| `whale_transactions` | One-time backfill | Done (2026-03-27) | TaoStats |
| `whale_delegations` | One-time backfill | Done (2026-03-27) | TaoStats |

**The 30-min TaoStats cron (`/api/cron/snapshot`) no longer writes to any of these 4 tables.**
> TODO: Remove step 3a from the cron (the upsert to `whale_snapshots` + `whale_alpha_balances`) — not built yet.

---

## Setup Steps (already done, for reference)

### Step 1 — SQL Migration
Run `supabase/migrations/20260327000000_whale_analytics.sql` in Supabase dashboard → SQL Editor.
**Status: ✅ Done**

### Step 2 — Environment Variables
| Variable | Where |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + `.env.local` |
| `TAOSTATS_API_KEY` | Vercel (cron only) |
| `NEXT_PUBLIC_SUPABASE_URL` | GitHub Actions secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Actions secrets |

**Status: ✅ Done**

### Step 3 — One-Time Backfill
```bash
npx tsx scripts/backfill-whale-data.ts
```
Seeded 30 days of balance history (TaoStats source). Won't run again.
**Status: ✅ Done (2026-03-27)**

### Step 4 — Nightly Chain Scan
`.github/workflows/nightly-chain-scan.yml` — runs daily at 4 AM UTC.
Writes top 500 balances + alpha positions to `whale_snapshots` and `whale_alpha_balances`.
**Status: ✅ Live (first run: 2026-03-27 11:54 PM ET, 462,720 accounts, ~3 min runtime)**

---

## How the API Uses These Tables

`/api/whale-history?address=<ss58>`
1. Checks KV cache (23h TTL) — returns immediately if warm
2. Queries Supabase: `SELECT * FROM whale_snapshots WHERE address = $1 ORDER BY date DESC LIMIT 30`
3. Falls back to KV daily snapshots for any gaps
4. Caches result in KV for next request

`/api/whales` — reads from `whale_snapshots` (latest snapshot date)

`/api/whale-detail` — still hits TaoStats directly for transactions/delegations (**TODO: refactor to use `whale_transactions` + `whale_delegations`**)

---

## Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260327000000_whale_analytics.sql` | Table definitions |
| `lib/types/whale.ts` | TypeScript row types |
| `scripts/backfill-whale-data.ts` | One-time backfill (done, don't re-run without reason) |
| `scripts/nightly-chain-scan.ts` | Nightly chain scan — primary data source |
| `.github/workflows/nightly-chain-scan.yml` | GH Actions workflow (4 AM UTC daily) |
| `app/api/cron/snapshot/route.ts` | 30-min cron (reads from these tables, should stop writing to them) |
| `app/api/whale-history/route.ts` | Balance history API |
| `lib/supabase-server.ts` | Supabase admin client |

---

## Open TODOs

1. **Remove step 3a from `/api/cron/snapshot`** — it still upserts to `whale_snapshots` + `whale_alpha_balances` from TaoStats when falling back. Chain scan owns those tables now. (Not built yet — confirm before building)
2. **Refactor `/api/whale-detail`** → read from `whale_transactions` + `whale_delegations` instead of hitting TaoStats
3. **Fix `whale_alpha_balances` migration** → add `hotkey` to the primary key (`(address, date, netuid, hotkey)` instead of `(address, date, netuid)`). Current prod schema has the old PK — needs an `ALTER TABLE` migration.

---

## Troubleshooting

**`whale_alpha_balances` shows fewer wallets than expected:** Only wallets with active alpha staking positions appear. Wallets holding free TAO only won't have rows here. This is correct.

**Cron using TaoStats fallback:** Nightly job hasn't run for today yet (before 4 AM UTC). Normal.

**`whale-history` returns empty:** Either the nightly scan hasn't run yet for this wallet, or Supabase env vars aren't in Vercel.

**Supabase key error:** Use `SUPABASE_SERVICE_ROLE_KEY` (not the anon key).

**Nightly scan skips a day:** Check GitHub Actions logs. Public RPC can be flaky — fallback RPC: `wss://bittensor-finney.api.onfinality.io/public-ws`

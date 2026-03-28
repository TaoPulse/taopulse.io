# Whale Analytics — Supabase Backend

_Built: 2026-03-27 | Last updated: 2026-03-28_

---

## Changelog

### 2026-03-28
- Rewrote doc to reflect current state (all 4 tables live, nightly chain scan running)
- Documented `hotkey` must be in `whale_alpha_balances` PK — needs ALTER TABLE migration in prod
- Decided nightly chain scan is sole writer for `whale_snapshots` + `whale_alpha_balances` (TaoStats no longer used for these)
- `whale_alpha_balances` write strategy: union of Set A (top 500 by total TAO) + Set B (top 25 per subnet). Top 25 chosen — most subnets have far fewer stakers, covers signal without bloat
- Rank not stored in `whale_alpha_balances` — computed via window function after nightly scan, cached in KV at 24h TTL
- `whale_transactions` + `whale_delegations`: nightly block scan (last 24h, ~7,200 blocks), chain-direct, no TaoStats going forward. History builds naturally day by day
- `whale_delegations`: dropped `usd` + `alpha_price_in_usd` columns — UI converts at render time using current TAO price. `delegate_name` left null (not on chain)
- Added 2 future tables: `subnet_snapshots` (total staked per subnet/day) + `validator_snapshots` (stake + delegator count per validator/subnet/day)
- **Going forward:** design changes are appended as dated changelog entries — nothing gets overwritten

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

**Write strategy — union of two sets (deduped by PK):**
- **Set A:** All alpha positions for the top 500 wallets by total TAO → answers "where do the big whales stake?"
- **Set B:** Top 25 wallets per subnet by `balance_as_tao` → answers "who are the biggest stakers on subnet X?"

Wallets in both sets get one row (PK deduplication handles it naturally). This makes the table work for both whale profiling and per-subnet staking analysis from a single query.

**Storage estimate:** 128 subnets × 25 wallets max = 3,200 rows/day worst case for Set B. Reality is lower — most subnets have far fewer than 25 stakers. Combined with Set A: ~200k–400k rows/year total.

**Rank column:** No `rank` column stored in the table. Rank is ambiguous in a union (a Set A wallet could rank 40th on a subnet, breaking the "top 25" expectation). Instead:
- Rank is computed once per day via window function: `RANK() OVER (PARTITION BY netuid ORDER BY balance_as_tao DESC)`
- Result is cached in KV with 24h TTL immediately after the nightly scan completes
- API reads from KV — no Supabase query, no computation at request time
- Stale until 4 AM UTC next day, which is fine since data is chain-sourced and only updates nightly

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

**Write strategy:**
- **Ongoing (nightly, chain-direct):** Scan last 24h of blocks (~7,200 blocks at ~12s/block), extract all transfer events involving top 500 wallets, write to this table. History builds naturally over time.
- **Existing rows:** 3,962 rows from one-time TaoStats backfill (2026-03-27) — historical data, won't be re-fetched
- **No TaoStats dependency going forward**
- **No historical backfill needed** — start from today, accumulate day by day

**`whale_delegations`** — PK: `id`, unique `(address, block_number, action, delegate, netuid)`
| Column | Type | Notes |
|--------|------|-------|
| `address` | text | Coldkey |
| `action` | text | DELEGATE / UNDELEGATE |
| `delegate` | text | Hotkey being staked to |
| `delegate_name` | text | Null — validator names not on chain (see TODO) |
| `netuid` | int | |
| `amount` | numeric | TAO |
| `alpha` | numeric | Alpha tokens |
| `alpha_price_in_tao` | numeric | Subnet ratio at time of event (subnetTAO/subnetAlphaIn) |
| `timestamp` | timestamptz | |
| `block_number` | bigint | |

> **USD columns dropped** (`usd`, `alpha_price_in_usd`) — UI converts to USD using current TAO price at render time.

**Write strategy:**
- **Ongoing (nightly, chain-direct):** Same block scan as `whale_transactions` — scan last 24h of blocks, extract stake/unstake events for top 500 wallets. Same pass, no extra chain calls.
- **Existing rows:** 220 rows from one-time TaoStats backfill (4 wallets only) — legacy, won't be re-fetched
- **No TaoStats dependency going forward**
- **`delegate_name`:** Validator names are not stored on chain. Left null for now — future option: maintain a separate `validator_names` lookup table

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

## Design Decisions

### 2026-03-28 — `whale_alpha_balances` primary key fix
**Decision:** Add `hotkey` to the primary key of `whale_alpha_balances`.

**Why:** A coldkey can stake to multiple validators (hotkeys) on the same subnet. With the old PK of `(address, date, netuid)`, a second upsert for the same wallet+date+subnet would overwrite the first row — silently losing one validator position. The correct PK is `(address, date, netuid, hotkey)`.

**Action needed:** The prod Supabase schema still has the old PK. Needs an `ALTER TABLE` migration before data loss can occur (currently low risk since only 34 wallets have alpha positions).

---

### 2026-03-28 — Chain scan is sole writer for balance tables
**Decision:** Nightly chain scan (`scripts/nightly-chain-scan.ts`) is the only job that writes to `whale_snapshots` and `whale_alpha_balances`. TaoStats is no longer used for these two tables.

**Why:** The one-time backfill (2026-03-27) seeded 30 days of history from TaoStats. That's done. The chain scan runs daily and adds a new day, giving us a growing history with no TaoStats dependency.

**Action needed:** Remove step 3a from `/api/cron/snapshot` — it still upserts to these tables as a side effect. (Confirmed design, not built yet.)

---

## Open TODOs

1. **Remove step 3a from `/api/cron/snapshot`** — it still upserts to `whale_snapshots` + `whale_alpha_balances` from TaoStats when falling back. Chain scan owns those tables now. (Not built yet — confirm before building)
2. **Refactor `/api/whale-detail`** → read from `whale_transactions` + `whale_delegations` instead of hitting TaoStats
3. **Fix `whale_alpha_balances` PK migration** → `ALTER TABLE` to change PK from `(address, date, netuid)` to `(address, date, netuid, hotkey)` in prod Supabase
4. **Add `subnet_snapshots` table** — see below

---

## Future: `subnet_snapshots` Table

### Why

To get total staked per subnet, you might think to aggregate `whale_alpha_balances` — but that only covers the top 500 wallets. Smaller wallets staking to subnets wouldn't be counted, so totals would be understated.

The chain already has exact subnet-level totals natively. The nightly scan already fetches `subnetTAO` and `subnetAlphaIn` per netuid (to compute the alpha→TAO conversion ratio) — but currently throws them away after use.

### Design

Add a `subnet_snapshots` table. Nightly scan writes one row per subnet per day alongside the wallet data.

**Proposed schema — PK: `(netuid, date)`**
| Column | Type | Notes |
|--------|------|-------|
| `netuid` | int | Subnet ID |
| `date` | date | |
| `subnet_tao` | numeric | Total TAO locked in subnet |
| `subnet_alpha_in` | numeric | Total alpha issued |
| `price_ratio` | numeric | `subnetTAO / subnetAlphaIn` — alpha→TAO conversion rate |
| `total_staked_tao` | numeric | Total TAO equivalent staked across all validators |

**Storage:** ~64 subnets × 365 days = ~23k rows/year. Negligible.

**No TaoStats needed** — all data comes from chain directly, already fetched by the nightly scan.

### Status
❌ Not built yet — confirm before building

---

## Future: `validator_snapshots` Table

### Why

The nightly scan already fetches all alpha entries as `(coldkey, hotkey, netuid) → stake`. Currently we group by coldkey to build the wallet richlist. Grouping by **hotkey + netuid** instead gives total stake per validator per subnet — no extra chain calls needed.

This answers questions like:
- Which validators have the most stake on subnet X?
- How has a validator's stake grown over time?
- How many delegators does a validator have?

### Design

**Proposed schema — PK: `(hotkey, netuid, date)`**
| Column | Type | Notes |
|--------|------|-------|
| `hotkey` | text | Validator address |
| `netuid` | int | Subnet ID |
| `date` | date | |
| `total_staked_alpha` | numeric | Sum of all coldkey stakes to this hotkey on this subnet |
| `total_staked_tao` | numeric | Alpha → TAO equivalent |
| `delegator_count` | int | Number of unique coldkeys staking to this validator |

**Storage:** ~few hundred validators × ~64 subnets × 365 days ≈ 500k rows/year. Still tiny.

**No extra chain calls** — same `subtensorModule.alpha.entries()` fetch the nightly scan already does, just aggregated differently before writing to Supabase.

### Status
❌ Not built yet — confirm before building

---

## Troubleshooting

**`whale_alpha_balances` shows fewer wallets than expected:** Only wallets with active alpha staking positions appear. Wallets holding free TAO only won't have rows here. This is correct.

**Cron using TaoStats fallback:** Nightly job hasn't run for today yet (before 4 AM UTC). Normal.

**`whale-history` returns empty:** Either the nightly scan hasn't run yet for this wallet, or Supabase env vars aren't in Vercel.

**Supabase key error:** Use `SUPABASE_SERVICE_ROLE_KEY` (not the anon key).

**Nightly scan skips a day:** Check GitHub Actions logs. Public RPC can be flaky — fallback RPC: `wss://bittensor-finney.api.onfinality.io/public-ws`

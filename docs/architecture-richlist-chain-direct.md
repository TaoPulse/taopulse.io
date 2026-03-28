# Architecture: Chain-Direct Richlist (Future Plan)

_Last updated: 2026-03-27_

## Background

Currently TaoPulse uses TaoStats API for all whale/richlist data. During the one-time backfill
(2026-03-27), we hit 429 rate limits on the transfers endpoint. This triggered a discussion about
moving to direct Bittensor chain data via `@polkadot/api`.

---

## The Problem with Going Fully Chain-Direct

The Bittensor chain has **no sorted index** by balance. To get "top 500 wallets" you'd need to:

1. Pull **every account** on chain (hundreds of thousands)
2. Fetch balance for each
3. Sort yourself
4. Take top 500

This is viable as a **nightly batch job** but not as a real-time or 30-min cron query.

---

## Proposed Architecture

### Nightly GitHub Actions Job (runs ~midnight ET)

- **Runtime:** GitHub Actions (free tier, no 5-min timeout like Vercel)
- **Estimated duration:** 1–2 hours (needs benchmarking first)
- **Language:** TypeScript with `@polkadot/api`
- **RPC endpoint:** `wss://entrypoint-finney.opentensor.ai:443` (free, Opentensor Foundation)

#### What it pulls from chain:
| Data | Substrate call |
|------|---------------|
| All accounts + free balances | `api.query.system.account.entries()` |
| Total coldkey stake | `api.query.subtensorModule.totalColdkeyStake.entries()` |
| Merge free + staked = total balance per address | computed |

#### What it stores in Supabase:
- Full account list with balances → derive top 500 ourselves
- Daily snapshots for 24h/7d/30d diffs (same as current `whale_snapshots` table)

#### What the 30-min cron then does:
- Reads top 500 **from Supabase** instead of calling TaoStats
- Zero TaoStats dependency for the richlist

---

## What We Gain
- ✅ No TaoStats dependency for richlist (fully independent)
- ✅ No rate limits ever on the nightly job
- ✅ Full historical data in our own DB
- ✅ Flexible queries (top 500 by free balance, staked, etc.)
- ✅ Cost: $0 (polkadot/api is open source, RPC is free)

## Dependency Matrix (post-migration)

| Data | Source | Notes |
|------|--------|-------|
| Richlist (top 500) | ✅ Chain (nightly scan) | `system.account.entries()` + stake merge |
| Validator names | ✅ Chain (identity pallet) | `api.query.identity.identityOf(address)` — on-chain standard |
| Balance history (24h/7d/30d) | ✅ Our Supabase snapshots | Built from nightly scan |
| Alpha balances per subnet | ⚠️ Subnet pallet | Doable but complex — future phase |
| Transfer history | ⚠️ TaoStats or block indexer | Only needed for wallet detail page (`/wallet/[address]`). Hard to replace — requires scanning every block. Keep TaoStats for this only. |

## What We Lose / Still Need TaoStats For
- ⚠️ **Alpha balances per subnet** — subnet pallet data, more complex to pull (future phase)
- ⚠️ **Transfer history** — only for wallet detail page; need to index blocks or keep TaoStats for this specifically

---

## Migration Plan

### Phase 1 — Benchmark (do this first)
- Write a proof-of-concept script: connect to RPC, run `system.account.entries()`, measure time + account count
- If < 2 hours: viable. If > 4 hours: reconsider.

### Phase 2 — Build nightly job
- GitHub Actions workflow: `.github/workflows/nightly-chain-scan.yml`
- Runs at `0 4 * * *` UTC (midnight ET)
- Script: `scripts/nightly-chain-scan.ts`
- Stores results to Supabase `whale_snapshots` table (same schema, compatible)

### Phase 3 — Switch cron to read from DB
- Update `/api/cron/snapshot/route.ts` to read richlist from Supabase instead of TaoStats
- Keep TaoStats calls only for: validator names, alpha balances, transfers

### Phase 4 — Reduce TaoStats dependency further (optional)
- Validator names: maintain manually in `data/known-wallets.json`
- Alpha balances: add subnet pallet queries to nightly job
- Transfers: lower priority, keep TaoStats for now

---

## POC Results (2026-03-27)

**Goal:** Benchmark whether we could replace TaoStats as the richlist source by querying the Bittensor chain directly — fetching all accounts, sorting by balance, and deriving the top 500 ourselves.

**Why we explored this:** The one-time backfill for whale history was hitting TaoStats 429 rate limits hard. That raised the question — should we cut TaoStats dependency entirely and go chain-direct?

### Approach

Used `@polkadot/api` to connect to the public Bittensor RPC (`wss://entrypoint-finney.opentensor.ai:443`) and run:

1. `api.query.system.account.entries()` — pull every account + free balance on chain
2. `api.query.subtensorModule.totalColdkeyStake(address)` — pull staked balance per account
3. Merge free + staked = total balance, sort descending, take top 10

The problem with `entries()` in one shot is it tries to fetch hundreds of thousands of accounts over a public WebSocket — which either hangs or gets cut off. Switched to **paginated fetching** via `entriesPaged({ pageSize: 1000 })`, which chunked it reliably.

### Benchmark Results

| Metric | Result |
|---|---|
| Total accounts on chain | **462,504** |
| Account fetch time | **1m 8s** |
| Stake fetch time | **FAILED** |
| Sort + merge time | 0.5s |
| Total run time | ~1m 10s |

### Findings

- ✅ **Chain-direct richlist is viable** — 462k accounts in 1m 8s is well within GitHub Actions free tier budget for a nightly job
- ❌ **Stake query failed** — module path `api.query.subtensorModule.totalColdkeyStake` was wrong. Likely `TotalColdkeyStake` (capital T) or different pallet path. Needs one fix to confirm.
- ⚠️ **Not urgent** — daily TaoStats cron is within free limits. Only worth building out if the cron itself starts hitting rate limits regularly

**One remaining task:** Find the correct `subtensorModule` storage key for total coldkey stake (enumerate `api.query.subtensorModule` methods or check Bittensor substrate runtime source).

---

## Current Status (2026-03-28) — Updated

### Phase 1 — POC ✅ Complete (2026-03-27)
- Script: `scripts/poc-chain-richlist.ts`
- 462,707 accounts fetched in 1m 10s — well within budget
- Alpha/stake query fixed: bits field needs `.toJSON()?.bits`, right-shift 64 bits for RAO integer

### Phase 2 — Nightly GH Actions job ✅ Complete (2026-03-27)
- Workflow: `.github/workflows/nightly-chain-scan.yml` — runs at `0 4 * * *` UTC
- Script: `scripts/nightly-chain-scan.ts`
- First successful run: 2026-03-27 ~11:54 PM ET — 462,720 accounts, 500 rows → Supabase, 173s runtime
- Writes to `whale_snapshots` table (same schema as TaoStats cron)

### Supabase tables (as of 2026-03-28)
| Table | Rows | Source |
|---|---|---|
| `whale_snapshots` | 3,169 | Nightly chain scan + 30-min TaoStats cron |
| `whale_alpha_balances` | 4,150 | 30-min TaoStats cron (upserted every run) |
| `whale_transactions` | 3,962 | One-time backfill (2026-03-27) |
| `whale_delegations` | 220 | One-time backfill (2026-03-27) |

### Phase 3 — Switch cron richlist source to Supabase ❌ Not done
- 30-min cron (`/api/cron/snapshot`) still fetches richlist from TaoStats
- Not urgent — cron is within TaoStats free limits
- Revisit if cron starts hitting 429s

### Phase 4 — Reduce TaoStats dependency further ❌ Not started
- Low priority

---

## Notes
- GitHub Actions free tier: 2,000 min/month for public repos, unlimited for private (within reason)
- `@polkadot/api` npm package — open source, no auth needed
- Public RPC can be flaky — may need retry logic and/or fallback to a second RPC endpoint
- Alternative public RPCs: `wss://bittensor-finney.api.onfinality.io/public-ws`

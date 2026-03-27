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

## Current Status (2026-03-27)
- ❌ Not started
- Backfill (using TaoStats) is running — will populate 30 days of history for top 100 wallets
- 429 rate limits only hit on the one-time backfill's transfer endpoint; normal cron is within free limits
- **Decision:** Stay on TaoStats for now. Revisit if cron itself starts hitting rate limits.
- **Next step when ready:** Write the benchmark POC script first before committing to this architecture.

---

## Notes
- GitHub Actions free tier: 2,000 min/month for public repos, unlimited for private (within reason)
- `@polkadot/api` npm package — open source, no auth needed
- Public RPC can be flaky — may need retry logic and/or fallback to a second RPC endpoint
- Alternative public RPCs: `wss://bittensor-finney.api.onfinality.io/public-ws`

# Architecture: Chain-Direct Richlist (Future Plan)

_Last updated: 2026-03-27_

## Background

Currently TaoPulse uses TaoStats API for all whale/richlist data. During the one-time backfill (2026-03-27), we hit 429 rate limits on the transfers endpoint. This triggered a discussion about moving to direct Bittensor chain data via `@polkadot/api`.

---

## The Problem with Going Fully Chain-Direct

The Bittensor chain has no sorted index by balance. To get "top 500 wallets" you'd need to:

1. Pull every account on chain (hundreds of thousands)
2. Fetch balance for each
3. Sort yourself
4. Take top 500

This is viable as a nightly batch job but not as a real-time or 30-min cron query.

---

## Proposed Architecture

### Nightly GitHub Actions Job (runs ~midnight ET)

- **Runtime:** GitHub Actions (free, no 5-min Vercel timeout)
- **Estimated duration:** 1–2 hours (needs benchmarking first)
- **Language:** TypeScript with `@polkadot/api`
- **RPC endpoint:** `wss://entrypoint-finney.opentensor.ai:443` (free, Opentensor Foundation)

**What it pulls from chain:**
- All accounts + free balances → `api.query.system.account.entries()`
- Total coldkey stake → `api.query.subtensorModule.totalColdkeyStake.entries()`
- Merge free + staked = total balance (computed)

**What it stores in Supabase:**
- Full account list with balances → derive top 500 ourselves
- Daily snapshots for 24h/7d/30d diffs (same `whale_snapshots` schema)

**What the 30-min cron then does:**
- Reads top 500 from Supabase instead of TaoStats

---

## Dependency Matrix (post-migration)

| Data | Source | Notes |
|------|--------|-------|
| Richlist (top 500) | ✅ Chain (nightly scan) | `system.account.entries()` + stake merge |
| Validator names | ✅ Chain (identity pallet) | `api.query.identity.identityOf(address)` |
| Balance history (24h/7d/30d) | ✅ Our Supabase | Built from nightly scan |
| Alpha balances per subnet | ⚠️ Subnet pallet | Doable but complex — future phase |
| Transfer history | ⚠️ TaoStats only | Wallet detail page only. Hard to replace. |

---

## Migration Plan

- **Phase 1 — Benchmark:** POC script, measure time + account count. <2h = viable.
- **Phase 2 — Build nightly job:** `.github/workflows/nightly-chain-scan.yml`, runs `0 4 * * *` UTC
- **Phase 3 — Switch cron to DB:** Read richlist from Supabase, keep TaoStats for transfers only
- **Phase 4 (optional):** Alpha balances via subnet pallet

---

## Current Status

- ❌ Not started. On TaoStats for now.
- Next step: Phase 1 benchmark POC

---

## Notes

- Fallback RPC: `wss://bittensor-finney.api.onfinality.io/public-ws`

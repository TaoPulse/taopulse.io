# Subnet Page UI Design

_Created: 2026-03-28 | Rule: Append only. Never overwrite existing content._

---

## Changelog

### 2026-03-28 — Initial design session

---

## Data Source

All data from `subnet_snapshots` Supabase table (chain-direct, nightly). No TaoStats dependency.

Static metadata (name, category) from `data/subnets.json`.

---

## Table Columns

| Column | Content | Notes |
|--------|---------|-------|
| Subnet | SN number + name + category badge | e.g. `SN64 Apex [LLM/Text]` |
| TVL | TAO amount + USD equivalent | e.g. `217,176 TAO / $18.2M` |
| Alpha Price | TAO + USD | e.g. `0.0869 TAO / $7.28` |
| Market Cap | TAO + USD | e.g. `206K TAO / $17.3M` |
| Emission | % of daily 3,600 TAO | e.g. `8.2% daily` |
| Validators | count | secondary/smaller text |
| Miners | active miner count | secondary/smaller text |

---

## Sort Options

- Default sort: **TVL** (highest first)
- Also sortable by: Emission, Market Cap, Alpha Price, Validators

---

## What Users Care About (per subnet)

### Performance / Value
- Market cap
- Alpha price in TAO + USD
- Price change 24h / 7d
- Total staked TAO (TVL equivalent)
- APY for staking into that subnet

### Activity
- Active validators / miners count
- Stake inflows/outflows (net stake change over 24h)
- Whale activity — which big wallets are entering/exiting

### Discovery
- Subnet name + description + what it does
- GitHub / website link
- Which subnets are trending (biggest stake increase %)

### Risk Signals
- Concentration — top 3 validators hold X% of stake
- Emission rate (how much TAO the subnet is getting per block)
- Subnet age (newer = riskier)

### Most Actionable (for typical user)
Price, APY, market cap, and net stake change (momentum) — tells them "is this subnet worth staking into right now?"

---

## Data Availability vs Build Effort

| Signal | Available now | Needs work |
|--------|--------------|------------|
| Market cap | ✅ `subnet_snapshots` | — |
| Alpha price (TAO + USD) | ✅ `subnet_snapshots` | — |
| TVL | ✅ `subnet_snapshots` | — |
| Emission rate | ✅ `subnet_snapshots` | — |
| Subnet age | ✅ `registration_block` | — |
| Validator / miner count | ✅ `subnet_snapshots` | — |
| Price change 24h/7d | ⏳ needs 2+ days of data | builds naturally |
| Net stake change 24h | ⏳ needs 2+ days of data | builds naturally |
| APY | ⏳ needs formula + validator fee data | medium effort |
| Concentration (top 3 validators) | ⏳ needs `validator_snapshots` query | low effort |
| Whale activity | ⏳ needs `whale_alpha_balances` join | medium effort |
| GitHub / website | ✅ `subnets.json` | — |
| Trending (stake % increase) | ⏳ needs 2+ days of data | builds naturally |

---

## Open Design Questions (to resolve before building)

1. **Stats bar** — keep existing 4 stat cards (Total Subnets, Active, Highest Emission, Total Daily TAO)? Or swap some for chain stats like Total TAO Staked across all subnets?
2. **Top Movers / Trending sections** — keep, remove, or replace with chain-sourced data?
3. **Search/filter** — keep category filter + search bar?
4. **Subnet click** — still navigates to `/subnets/[id]` detail page?

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

## Open Design Questions (to resolve before building)

1. **Stats bar** — keep existing 4 stat cards (Total Subnets, Active, Highest Emission, Total Daily TAO)? Or swap some for chain stats like Total TAO Staked across all subnets?
2. **Top Movers / Trending sections** — keep, remove, or replace with chain-sourced data?
3. **Search/filter** — keep category filter + search bar?
4. **Subnet click** — still navigates to `/subnets/[id]` detail page?

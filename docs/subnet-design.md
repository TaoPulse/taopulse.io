# Subnet Analytics — Design Doc

> ⚠️ **EDITING RULE: Append only. Never overwrite or rewrite existing content.**
> All changes go as new dated changelog entries.

_Created: 2026-03-28_

---

## Changelog

### 2026-03-28
- Initial design doc created from discussion
- Decided APY to be added later (needs emission data)
- Priority: Performance/Value + Activity metrics first
- Validator/miner count deferred (low priority for staking decisions)
- Discovery section added: name/description/links via curated static JSON, trending via whale_delegations net flow (day 1) + TVL change % (after history builds)

---

## Performance / Value Metrics

| Metric | Formula / Source | Status |
|--------|-----------------|--------|
| Alpha price in TAO | `subnetTAO / subnetAlphaIn` | ✅ Already fetched in nightly scan |
| Alpha price in USD | `price_in_tao × tao_price` | ✅ Computed at render time |
| TVL (total staked TAO) | `subnetTAO` | ✅ Already fetched in nightly scan |
| Market cap (TAO) | `subnetAlphaOut × (subnetTAO / subnetAlphaIn)` | 🔲 Needs `subnetAlphaOut` chain query |
| Market cap (USD) | `market_cap_tao × tao_price` | 🔲 Computed at render time once MC in TAO exists |
| Price change 24h | `(today_price - yesterday_price) / yesterday_price` | 🔲 Needs history (auto after 1 day of data) |
| Price change 7d | `(today_price - 7d_ago_price) / 7d_ago_price` | 🔲 Needs history (auto after 7 days of data) |
| APY | `(subnet_emission_per_day × 365) / total_staked_tao` | ⏳ Deferred — needs emission data |

**Chain sources needed:**
- `subtensorModule.subnetTAO.entries()` — already fetched ✅
- `subtensorModule.subnetAlphaIn.entries()` — already fetched ✅
- `subtensorModule.subnetAlphaOut.entries()` — one extra query, needed for market cap

---

## Activity Metrics

| Metric | Source | Status |
|--------|--------|--------|
| Net stake inflow/outflow 24h | Aggregate `whale_delegations` by netuid | 🔲 Data exists, needs aggregation query |
| Whale activity (who's entering/exiting) | `whale_delegations` filtered by netuid, joined with `whale_snapshots` for rank | 🔲 Data exists, needs UI |
| Active validator count | `subtensorModule.keys(netuid)` | ⏳ Deferred — low priority |
| Active miner count | `subtensorModule.keys(netuid)` | ⏳ Deferred — low priority |

**Key insight:** Net stake flow is the momentum indicator — shows which subnets whales are piling into vs pulling out of. High signal for staking decisions. Raw data is already being captured in `whale_delegations` from the nightly block scan.

---

## Discovery Metrics

| Metric | Source | Notes |
|--------|--------|-------|
| Subnet name | On-chain: `subtensorModule.subnetNames` | |
| Description + what it does | Curated static `data/subnets.json` in repo | Not on-chain. Seeded from `top-25-subnets.md`. We own/maintain it |
| GitHub / website link | Curated static `data/subnets.json` | Same file as above |
| Trending (biggest stake increase %) | Two sources: | |
| → Day 1+ | `whale_delegations` net flow by netuid | Works immediately, no history needed |
| → After history builds | `(today_tvl - yesterday_tvl) / yesterday_tvl` from `subnet_snapshots` | More accurate, available after first day of data |

**Data strategy for static metadata:**
- `data/subnets.json` — keyed by `netuid`, fields: `name`, `description`, `tags`, `github`, `website`
- Seeded from existing `docs/top-25-subnets.md`
- Updated manually as subnets evolve
- Future: subnet owners can submit PRs or a form

---

## Proposed `subnet_snapshots` Table

**PK: `(netuid, date)`**

| Column | Type | Notes |
|--------|------|-------|
| `netuid` | int | Subnet ID |
| `date` | date | |
| `subnet_tao` | numeric | Total TAO locked in subnet pool (TVL) |
| `subnet_alpha_in` | numeric | Alpha tokens inside the pool |
| `subnet_alpha_out` | numeric | Alpha tokens in circulation (outside pool) |
| `price_ratio` | numeric | `subnetTAO / subnetAlphaIn` — alpha price in TAO |
| `market_cap_tao` | numeric | `subnetAlphaOut × price_ratio` |
| `total_staked_tao` | numeric | Total TAO equivalent staked across all validators |

**Not stored (computed at render time):**
- Price in USD = `price_ratio × tao_price`
- Market cap in USD = `market_cap_tao × tao_price`
- Price change % = window function over historical rows

---

## Proposed UI — Subnets Page

**Table columns (priority order):**
1. Subnet name + ID
2. Alpha price (TAO + USD)
3. Market cap (TAO)
4. TVL (subnetTAO)
5. 24h price change %
6. Net stake flow 24h (inflow/outflow)
7. 7d price change % (after history builds)

**Whale activity feed (sidebar or subnet detail page):**
- "Whale #2 staked 5,000 TAO into SN19 — 2h ago"
- "Whale #7 unstaked 1,200 TAO from SN1 — 5h ago"

---

## Build Order

1. **`subnet_snapshots` table + nightly scan integration** — fetch `subnetAlphaOut`, compute market cap, store alongside existing price/TVL data
2. **Subnets page UI** — table with price, MC, TVL, 24h change
3. **Net stake flow aggregation** — query `whale_delegations` by netuid for inflow/outflow
4. **Whale activity feed** — filter + surface delegation events per subnet
5. **APY** — add emission data fetch when ready

# TaoPulse.io — Feature Roadmap
_Researched: 2026-03-25 by Veera | Updated: 2026-03-26_

## Competitive Landscape

| Site | Focus | Weakness |
|------|-------|----------|
| taostats.io | Power-user block explorer, raw chain data | Not beginner-friendly, dense UI |
| taomarketcap.com | Validators + miners + price | No education, no onboarding |
| bittensor.com | Official docs | No analytics, static |
| TaoPulse | Beginner-friendly analytics + education | ✅ Our moat |

**Our edge:** None of the competitors hold a beginner's hand. TaoPulse is the only site that combines "what is this?" + "how do I buy it?" + live analytics. Double down on that.

---

## Proposed Features (prioritized)

### 🔴 HIGH PRIORITY — Quick wins, high user value

#### TP-017 — TAO Price Chart ✅ Already exists
- Lives on `/what-is-tao` via `TaoPriceChart`, `EmissionsChart`, and `SupplyChart` components

#### TP-018 — Wallet Address Lookup / Portfolio Tracker (public)
- **What:** Enter any TAO wallet address → see balance, staked amount, which validators, recent transactions
- **Why:** Huge for power users. "Check my wallet" is one of the most common crypto user actions.
- **How:** TaoStats API has `/api/account/` endpoints. No auth needed for read.
- **Effort:** Medium
- **Route:** `/wallet/[address]` or enhance existing `/portfolio`

#### TP-019 — Subnet Detail Pages (enhanced)
- **What:** Each subnet gets a rich page: description, live emission %, active miners/validators, APY estimate, how to stake on it
- **Why:** Currently subnets are just a list. Deep pages = SEO gold + real utility for people researching where to stake.
- **How:** Extend existing `/subnets/[id]` pages with live TaoStats data
- **Effort:** Medium
- **Route:** `/subnets/[id]` (already exists as stubs, needs live data + content)

#### TP-020 — TAO vs BTC / ETH / SOL Comparison Chart
- **What:** Simple side-by-side % performance chart (30d, 90d, 1y)
- **Why:** TAO investors always want to know "how is TAO doing vs BTC?" — this is a top Google search for any alt coin
- **How:** CoinGecko free API for all assets
- **Effort:** Low-Medium
- **Route:** Section on home or `/price`

---

### 🟡 MEDIUM PRIORITY — Differentiators that build traffic

#### TP-021 — "Should I Stake or Mine?" Decision Tool
- **What:** Interactive questionnaire → recommends whether user should be a staker, validator, or miner based on their TAO amount, technical skill, time commitment
- **Why:** Beginners are overwhelmed by this question. A guided flow would be a unique, shareable tool.
- **How:** Pure frontend logic, no API needed
- **Effort:** Low (pure UI/logic)
- **Route:** `/should-i-stake-or-mine` (already exists? check)

#### TP-022 — Staking APY Calculator (per validator)
- **What:** Pick a validator → enter TAO amount → see projected weekly/monthly/yearly yield
- **Why:** The generic staking calc exists but isn't validator-specific. People want to know "if I stake with Validator X, what do I earn?"
- **How:** TaoStats validator API + simple math
- **Effort:** Medium
- **Route:** Enhance `/staking` or add to `/validators`

#### TP-023 — TAO Tokenomics Deep Dive Page
- **What:** Visual breakdown of TAO supply, emission schedule, halving history, circulating vs staked vs locked
- **Why:** Every serious investor wants this. Currently it's scattered across the "What is TAO?" page.
- **How:** Mix of static (emission schedule, halvings) + live TaoStats (circulating supply, staked %)
- **Effort:** Medium (mostly content + visualization)
- **Route:** `/tokenomics`

#### TP-024 — "Top Movers" Widget (subnets gaining/losing emission)
- **What:** Small widget showing which subnets gained or lost the most emission % in the last 24h
- **Why:** Traders love momentum signals. "What's hot right now?"
- **How:** TaoStats API — compare current emission vs previous period
- **Effort:** Medium
- **Route:** Home page widget + `/subnets`

#### TP-025 — TAO Halving History + Next Halving Countdown (enhanced)
- **What:** Existing halving page, but add: historical halving dates + price at each halving + visual timeline
- **Why:** Halving narratives drive crypto price cycles. Historical context = shareable content.
- **Effort:** Low (mostly content, existing page to enhance)
- **Route:** Enhance `/halving`

---

### 🟢 LOWER PRIORITY — Long-term growth features

#### TP-026 — Exchange Price Comparison (live)
- **What:** Real-time TAO price across exchanges (Binance, Kraken, MEXC, Gate.io, etc.) with spread %
- **Why:** Arbitrage-aware traders want this. Also helpful for "where should I buy?"
- **How:** Exchange APIs or CoinGecko's exchange endpoint
- **Effort:** Medium-High
- **Route:** `/buy-tao` enhancement or `/exchanges`

#### TP-027 — TAO Tax Estimator
- **What:** Enter staking rewards earned → estimate taxable income (US-focused)
- **Why:** Stakers have tax obligations on rewards. This is a real pain point with zero good tools.
- **How:** Pure frontend math, no API. Disclaimer: "not financial/tax advice"
- **Effort:** Low-Medium
- **Route:** `/tax`

#### TP-028 — Subnet Leaderboard (weekly/monthly emission winners)
- **What:** Which subnets have consistently topped emission over time?
- **Why:** Helps stakers identify reliable vs volatile subnets for long-term staking decisions
- **How:** Needs historical emission data — TaoStats may have this
- **Effort:** Medium-High
- **Route:** `/subnets/leaderboard`

#### TP-029 — "New to Bittensor" Guided Tour
- **What:** Interactive step-by-step onboarding: "I have $500, I want to invest in TAO — walk me through it"
- **Why:** The full journey exists across pages but isn't connected. A guided flow = better conversions to newsletter signups
- **How:** Multi-step UI component, links to existing pages
- **Effort:** Medium
- **Route:** `/start-here` or `/guide`

#### TP-030 — Embed Widgets for Other Sites
- **What:** Shareable embeddable widgets: price badge, subnet emission chart, staking calculator
- **Why:** Distribution. If other Bittensor sites embed TaoPulse widgets, traffic and backlinks grow.
- **How:** iframe-friendly pages at `/embed/price`, `/embed/subnets`, etc.
- **Effort:** Medium

---

## SEO / Content Quick Wins (no dev needed)

- Blog/articles section with TAO-specific guides (ranks for long-tail searches)
- "Best TAO wallets 2026" page (already exists, just needs SEO tuning)
- Structured data (JSON-LD) for all pages
- More internal linking between pages

---

## Recommended Next Sprint (3 tasks)

1. **TP-019** — Enhance subnet detail pages with live data — SEO compound value
2. **TP-023** — Tokenomics page — fills a real gap, shareable
3. **TP-018** — Wallet address lookup — high utility for power users

All three use existing TaoStats API (already integrated), no new dependencies.

---

## 🏆 NORTH STAR — Own the Data Layer (TP-NORTH)

**Vision:** Stop being a TaoStats frontend. Become TaoPulse — a fully independent, beginner-friendly Bittensor data platform that pulls directly from the chain.

**Why this matters:**
- TaoStats is a third-party explorer — if they go down, change their API, or start charging, our core data breaks
- We currently display TaoStats data with a TaoPulse skin — that's not a moat
- Owning the data layer = real competitive advantage. No one else is doing beginner-friendly UX *with* direct chain data.
- Long-term: TaoPulse could become THE go-to Bittensor interface, not just an analytics site

**What "owning the data" means:**
- Query Bittensor chain directly via Substrate RPC (`wss://entrypoint-finney.opentensor.ai:443`)
- Use the Bittensor JS/Python SDK to decode chain state: validators, subnets, stake, emissions, balances
- Cache data in our own layer (Redis or Vercel KV) — our own API, our own freshness
- Replace all `api.taostats.io` calls with `api.taopulse.io` (our own endpoints)

**What we get:**
- Data no one else has (raw chain state, faster refresh, custom aggregations)
- No dependency on TaoStats uptime or pricing
- Ability to build features TaoStats never will (beginner UX, calculators, guided flows)
- Credibility: "Data direct from chain" > "Powered by TaoStats"

**Phases:**
1. **Phase 1** — Mirror: Build our own data pipeline alongside TaoStats (fallback if ours fails → TaoStats)
2. **Phase 2** — Replace: Swap all TaoStats calls to our own endpoints one by one
3. **Phase 3** — Expand: Add data TaoStats doesn't expose (custom aggregations, historical trends, alerts)

**Tech approach:**
- Bittensor has a public WebSocket RPC at `wss://entrypoint-finney.opentensor.ai:443`
- `@polkadot/api` (JS) can connect and query chain state
- Vercel Cron Jobs to refresh data every 60s → store in Vercel KV
- Eventually: dedicated data server (Railway/Render) for heavier queries

**Effort:** High — this is a multi-week project, not a sprint task. But it's the right long-term bet.

**Start when:** After the site gets real traffic (post Reddit launch). Validate demand first, then invest in infrastructure.

---

## 💡 New Opportunities (Identified 2026-03-26)

### 🔴 HIGH PRIORITY

#### TP-031 — TAO Price Alert Signup
- **What:** User enters a price target → gets email when TAO hits it
- **Why:** Aggressive newsletter driver. Real utility for investors watching entry points.
- **How:** Simple form → Beehiiv tag + Vercel cron checking price API
- **Effort:** Medium
- **Extends:** `/` homepage or `/price`

#### TP-032 — "Start Here" Guided Journey (`/start-here`)
- **What:** Interactive flow — "I have $X, I want to invest in TAO, walk me through it"
- **Why:** Best conversion tool for beginners. Connects buy → wallet → staking in one guided path. All pages already exist, just need stitching.
- **How:** Multi-step UI component, links to existing pages, no new API needed
- **Effort:** Low
- **Extends:** New page, links to `/buy-tao`, `/wallets`, `/staking`

#### TP-033 — Validator Deep-Dive Pages (`/validators/[hotkey]`)
- **What:** Each validator gets their own page — stake, APY trend, uptime, nominator count, history
- **Why:** SEO gold (people Google validator names). Power users want this before committing stake.
- **How:** Extend existing validator API data
- **Effort:** Medium
- **Extends:** `/validators`

---

### 🟡 MEDIUM PRIORITY

#### TP-034 — Weekly News Digest Page (`/weekly`)
- **What:** Auto-generated public page: "Bittensor news this week — [date]"
- **Why:** Ranks for "bittensor news" searches. Gives newsletter subscribers a reason to visit weekly.
- **How:** Pull from existing news feed API, render as static page via cron
- **Effort:** Low
- **Extends:** `/news`

#### TP-035 — dTAO Subnet APY Tracker
- **What:** Alpha token prices, liquidity, and estimated APY per subnet — beginner-friendly
- **Why:** dTAO is new and confusing. Nothing beginner-friendly exists for this yet. First-mover opportunity.
- **How:** TaoStats has alpha token data endpoints
- **Effort:** Medium-High
- **Extends:** `/subnets/[id]`

#### TP-036 — TAO Tax Estimator (`/tax`)
- **What:** Enter staking rewards earned → estimated US tax liability
- **Why:** Real pain point, zero good tools exist. Pure frontend math.
- **How:** No API needed. Add "not tax advice" disclaimer.
- **Effort:** Low
- **Route:** `/tax`

#### TP-037 — Subnet Comparison Tool
- **What:** Pick 2-3 subnets → compare emission, APY, miner count, growth trend side by side
- **Why:** Useful for stakers deciding where to stake. No competitor has this.
- **How:** Extends existing subnet API data
- **Effort:** Medium
- **Extends:** `/subnets`

---

### 🟢 LOWER PRIORITY

#### TP-038 — Embeddable Widgets (`/embed/price`, `/embed/subnets`)
- **What:** Shareable iframe widgets for other Bittensor sites to embed
- **Why:** Distribution play — backlinks + traffic from other sites embedding TaoPulse data
- **How:** iframe-friendly lightweight pages
- **Effort:** Medium
- **Route:** `/embed/*`

#### TP-039 — Exchange Price Comparison
- **What:** Live TAO price across Kraken, Binance, MEXC, Gate.io with spread %
- **Why:** Helps users find the best rate. Natural extension of buy-tao page.
- **How:** Exchange APIs or CoinGecko exchange endpoint
- **Effort:** Medium
- **Extends:** `/buy-tao`

#### TP-040 — Whale Wallet Tracker + Alert System
- **Why:** Whale movements are high-signal for TAO price direction. No good whale tracker exists for TAO yet — first-mover opportunity. Also drives newsletter signups (alerts require email).
- **Route:** `/whales`
- **Effort:** Medium-High

##### Phase 1 — Richlist Page (building first)
- **Scope:** Top 500 wallets ranked by total TAO
- **Columns:** Rank | Address (full, copyable, links to /wallet/[address]) | Total TAO | Free TAO | Staked TAO | 24hr Change (Δ TAO + %)
- **Highlight logic:**
  - 🔴 Red row/badge = balance dropped in last 24hr (selling signal)
  - 🟢 Green row/badge = balance increased in last 24hr (accumulating)
  - ⚪ No change = neutral
- **Data source:** `GET /api/account/latest/v1?order_by=balance_total_desc&limit=200&page=N`
  - API max is 200/page — fetch pages 1–3 in parallel server-side to get top 500
  - API returns `balance_total`, `balance_free`, `balance_staked`, `balance_total_24hr_ago` — no cron needed for phase 1
- **API confirmed:** 464,540 total accounts, endpoint live, sorts correctly, 200/page max
- **Refresh rate:** Page auto-refreshes data every 30 minutes (client-side polling to a `/api/whales` route)
- **Wallet labels:**
  - 🔵 Validator — auto-detected by cross-referencing `/api/validator/latest/v1` coldkey addresses (name shown if available)
  - 🟡 Exchange — manually curated JSON file (Kraken, Binance, MEXC etc.)
  - 🟣 Foundation — manually curated JSON file (Opentensor wallets)
  - ⚪ Unknown — everyone else
  - Curated labels stored in `data/known-wallets.json` in the repo, community-maintainable

##### Phase 2 — Wallet Deep Dive (expandable rows)
- **Trigger:** Click/expand any row in the richlist
- **Show inline:**
  - Recent transfer history — counterparty address, amount, fee, timestamp, tx hash
  - Delegation history — every STAKE/UNDELEGATE action, validator name, subnet, amount, timestamp
  - "Last active" — timestamp of last on-chain activity
  - ⚠️ "Recently unstaked" flag — if UNDELEGATE in last 7 days, show early warning badge (unstaking precedes selling)
- **APIs:**
  - `GET /api/transfer/v1?coldkey={address}&limit=10`
  - `GET /api/delegation/v1?coldkey={address}&limit=10`
- **UX:** Lazy-loaded on expand (don't fetch for all 1000 upfront)

##### Phase 3 — Balance History Charts
- **What:** Mini sparkline chart per wallet showing balance trend over last 7–30 days
- **Trigger:** Shown in expanded row view (Phase 2)
- **API:** `GET /api/account/history/v1?address={address}&limit=30` — daily snapshots of balance_total, rank, staked
- **Value:** Visualize accumulation vs distribution patterns over time

##### Phase 4 — Alert System (decisions pending)
- **Delivery:** TBD — email only vs Telegram vs browser push
- **Threshold:** TBD — any drop vs user-selectable (5% / 10% / 20%)
- **Direction:** TBD — sell alerts only vs buy + sell
- **Early signal:** Alert on UNDELEGATE events (pre-sell indicator) in addition to balance drops
- **Storage:** TBD — Vercel KV vs Supabase
- **Email service:** TBD — Resend vs Beehiiv (Beehiiv is newsletter; Resend better for triggered alerts)

---

## 🔬 Analytics Roadmap (Future — post TP-040)
_All data sourced from TaoStats API. Aggregation logic built on our side._

### TP-041 — Whale Accumulation Index (`/analytics`)
- Net buy/sell score across top 100 wallets over 7d / 30d
- "Are whales accumulating or distributing right now?" — single clear signal
- **API:** `account/latest/v1` + `account/history/v1`

### TP-042 — Staking Ratio Trend
- % of top 500 wallets staked over time — rising = bullish, falling = bearish
- Leading indicator for price direction
- **API:** `balance_staked` vs `balance_free` from account history

### TP-043 — UNDELEGATE Spike Detector
- Real-time feed of large unstaking events across the network
- Alert when multiple whales unstake in the same 24h window (coordinated sell signal)
- **API:** `delegation/v1` filtered by action=UNDELEGATE + large amounts

### TP-044 — TAO Concentration Risk
- What % of total TAO is held by top 10 / 50 / 100 / 1000 wallets?
- Gini coefficient over time — is TAO becoming more or less concentrated?
- **API:** `account/latest/v1` richlist + total supply

### TP-045 — New Whale Detection
- Wallets that entered the top 500 in the last 7 / 30 days
- "Fresh money" signal — who is accumulating quietly?
- **API:** `account/latest/v1` rank diff vs `account/history/v1`

### TP-046 — Subnet Whale Intelligence
- Which subnets are the top whales staked to?
- Subnet popularity among top holders — rotation signals
- If top holders are moving stake from SN-X to SN-Y, that's alpha
- **API:** `alpha_balances` field on account records

### TP-047 — Validator Dominance Shifts
- Which validators are gaining / losing whale stake over time?
- Useful for nominators deciding where to stake
- **API:** `validator/latest/v1` stake + stake_24hr_change

### TP-048 — Exchange Flow Tracker
- Transfers TO known exchange wallets = likely selling pressure
- Transfers FROM exchanges = likely buying / accumulation
- Net exchange flow chart over time
- **API:** `transfer/v1` filtered by known exchange coldkeys (from `data/known-wallets.json`)

### TP-049 — Whale vs Retail Divergence
- Compare balance trends of top 100 wallets vs wallets ranked 1000–10000
- Are smart money and retail moving in the same direction or opposite?
- Divergence = potential contrarian signal
- **API:** Multiple `account/latest/v1` + `account/history/v1` queries

---

## ⚠️ Infrastructure Note — Data Source Independence

**Current dependency:** TaoStats API (`api.taostats.io`) — free tier, single API key.

**Risk:** TaoStats could rate-limit, block, or paywall us as we grow. They could also go down.

### Mitigation Plan (in priority order)

**Immediate (already planned):**
- Cache all TaoStats responses server-side — users never hit TaoStats directly
- 30min refresh cadence = minimal API calls regardless of traffic
- Abstract all data fetching behind internal `/api/*` routes so the source is swappable

**Short term:**
- Monitor TaoStats API usage — add logging to `/api/whales` and other routes
- Identify fallback sources per endpoint:
  - Price → CoinGecko, CoinMarketCap
  - Subnet data → Bittensor Python SDK metagraph
  - Account balances → Subscan (Substrate chain indexer)

**Medium term:**
- Run a **Subtensor archive node** — full independence, no API keys, no rate limits
  - Bittensor node can be queried directly via WebSocket RPC
  - Subtensor repo: https://github.com/opentensor/subtensor
  - Resource requirement: ~50-100GB storage, moderate CPU

**Long term:**
- Build our own indexer on top of the Subtensor node
- Selectively use TaoStats for supplementary data (names, labels) only
- Full data ownership = competitive moat (nobody can cut us off)

### TP-050 — Data Source Abstraction Layer
- Wrap all TaoStats calls in a `lib/data/` module with clear interfaces
- Add fallback logic: if TaoStats fails, try alternative source
- Track which source served each response in logs
- **Priority:** Do this before going viral — not after

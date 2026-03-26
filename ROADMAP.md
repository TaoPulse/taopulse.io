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

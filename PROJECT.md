# TaoPulse.io — Project Context
_Last updated: 2026-03-24_

## ⚠️ Development Rules (non-negotiable)
1. **QA every page after changes.** Check the live URL. Catch issues before the user does.
2. **No static data.** If real-time data is unavailable: show "—", "data unavailable", or "~est." — never hardcode numbers that look live. Never use fake fallback values.
3. **Trust but verify.** Block numbers, dates, API endpoints, wallet URLs — verify against live sources. Don't rely on training data for current facts.

## What It Is
A beginner-friendly TAO/Bittensor analytics and education site. Target audience: crypto investors who are new to Bittensor and want to understand TAO, buy it, store it safely, stake it, and explore subnets. Built by Thiyaghu, maintained by Veera.

**Live URL:** https://taopulse.io  
**GitHub:** https://github.com/TaoPulse/taopulse.io  
**Hosting:** Vercel (Hobby plan, free) — auto-deploys on push to main  
**Tech stack:** Next.js (App Router), TypeScript, Tailwind CSS, deployed as SSR on Vercel  
**Domain registrar:** Namecheap → DNS A record points to Vercel (216.198.79.1)

---

## User Journey (the intended flow)
1. **Home** — what is this site, quick price strip
2. **What is TAO?** — education, investment thesis, why it's special
3. **Buy TAO** — exchange comparison, step-by-step purchase guide
4. **Wallets** — storage guide, 8 verified wallets in 3 categories
5. **Staking** — earn yield guide, classic vs dTAO, beginner-safe
6. **Subnets** — 128+ subnet explorer with emission data
7. **News** — live TAO/Bittensor news feed

---

## Page Status

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Home | / | ✅ Live | Price strip, subnet preview, staking calc |
| What is TAO | /what-is-tao | ✅ Live | Education + investment thesis |
| Buy TAO | /buy-tao | ✅ Live | Exchange guide, step-by-step |
| Wallets | /wallets | ✅ Live (just updated) | 8 verified wallets, direct download links |
| Staking | /staking | ✅ Live (just rewritten) | Classic vs dTAO, emission, risk table |
| Subnets | /subnets | ✅ Live | 128+ subnets, categorized, emission bars |
| News | /news | ✅ Live (just fixed) | CryptoPanic + Reddit + Bittensor RSS |

---

## Key Decisions Made (don't revisit without reason)

### Content Standards
- **Trust but verify** — every URL, wallet, feature claim must be verified before publishing. A user finding dead links = lost traffic forever.
- **Gemini for research** — better than relying on training data alone for wallet/protocol facts. Always cross-check.
- **Handholding is correct** — users are crypto beginners. More explanation > less. Seed phrase warnings in red boxes, "start with 1-5 TAO" advice, etc.

### Wallets (verified list — do not add unverified wallets)
**Browser Extensions:**
- Talisman (talisman.xyz) — gold standard, TAO staking built-in, Ledger support ✅
- Crucible (crucible.wtf) — Smart Allocator feature, auto-rebalances stake across subnets ✅
- Bittensor Wallet by Tensora — Chrome Web Store, native non-custodial ✅

**Mobile:**
- TAO.com (tao.com) — iOS + Android, FaceID, fiat on-ramp, best for beginners ✅
- Nova Wallet (novawallet.io) — iOS + Android, Ledger Bluetooth support ✅
- Zengo (zengo.com) — MPC instead of seed phrase, no seed phrase risk ✅

**Hardware:**
- Ledger (ledger.com) — use with Talisman or Crucible to manage TAO ✅
- Polkadot Vault (paritytech.github.io/parity-signer) — air-gapped cold storage ✅

**REMOVED / NEVER USE:** Tensor Wallet — does not exist, was hallucinated.

### Staking
- Classic root staking: TAO stays TAO, ~15-20% APY, no slashing risk
- dTAO subnet staking: TAO converts to subnet token, impermanent loss risk, higher upside
- Method order: Wallet app FIRST (beginner), CLI second (advanced)
- Recommend TAO.com (mobile) and Talisman (desktop) for beginners
- No Tensor Wallet references anywhere

### Emission
- ~7,200 TAO/day total emitted across all subnets
- Subnet's share = proportional to stake attracted
- SN68 was top emission at ~4.3% (~310 TAO/day, ~$86k/day at $279)
- Reward flow: subnet emission → validators → stakers (proportional cut)

### News Feed
- Vercel server-side API routes (no CORS issues)
- Sources: CryptoPanic free API, Reddit r/bittensor_ (with custom User-Agent), Bittensor RSS
- Filter tabs: All | Reddit | Community | CryptoPanic | Blog

---

## Email / Newsletter

**Platform:** Beehiiv (embedded via iframe)
- Embed script: `https://subscribe-forms.beehiiv.com/embed.js`
- Embed form ID: `a290cdad-6846-4bac-99df-55e0cc240ece`
- Attribution script in `app/layout.tsx`
- Component: `components/EmailSignupForm.tsx`
- Newsletter name: **TAO Alpha** — weekly TAO intel, every Monday
- Beehiiv dashboard manages welcome email and weekly email templates
- Logo URL for email templates: `https://taopulse.io/logo.jpg`

---

## Open Tasks (taopulse-specific)

| # | Task | Priority | Notes |
|---|------|----------|-------|

| TP-015 | Macrocosmos SN13 API — live social feed on news page | Low | API key saved in TOOLS.md ✅ |

## Completed Tasks

| # | Task | Done | Notes |
|---|------|------|-------|
| TP-003 | Live TAO price strip | ✅ | CoinGecko free API, working |
| TP-005 | News feeds working | ✅ | Google News (Reddit route) works; CoinDesk/CoinTelegraph RSS sparse for TAO — expected |
| TP-007 | StakingCalculator APY labels | ✅ | Now shows "(est.)" labels, updated price to $300, clearer disclaimer |
| TP-010 | Halving countdown page | ✅ | /halving live with dynamic blocks remaining |
| TP-011 | Portfolio tracker page | ✅ | /portfolio live, uses live price API |
| TP-012 | Subnet directory page | ✅ | /subnets/directory live, static from docs (labeled) |
| TP-013 | Sitemap includes all pages | ✅ | halving, portfolio, directory added |
| TP-014 | Static data wording QA | ✅ | All pages now use "est.", "data unavailable", or verified live sources |
| TP-009 | TaoStats API key in Vercel | ✅ | Live data working on staking, subnet, validator pages |
| TP-001 | Staking page — live validator data | ✅ | TaoStats API live |
| TP-002 | Subnet page — live emission data | ✅ | TaoStats API live |
| TP-015 | Macrocosmos SN13 API | ❌ Blocked | gRPC incompatible with Vercel serverless. Needs Macrocosmos HTTP API or self-hosted server. |
| TP-016 | TAO Alpha newsletter branding + /admin/weekly generator | ✅ | Beehiiv embedded, draft generator at /admin/weekly, logo in email |
| TP-004 | Validator comparison page with live stake/uptime | ✅ | /validators live, sortable table, linked from /staking |
| TP-008 | Nav overflow on medium screens | ✅ | Switched to lg breakpoint — md screens now use hamburger menu |
| TP-019 | Subnet detail pages with live data | ✅ | Live miners/validators/emission/reg cost from TaoStats, fixed 7200 TAO/day |
| TP-023 | Tokenomics page | ✅ | /tokenomics live — supply, emission schedule, TAO vs BTC comparison |
| TP-018 | Wallet address lookup | ✅ | /wallet and /wallet/[address] live, linked from nav + portfolio |

---

## Known Issues / Watch Out For
- **TaoStats API key not in Vercel**: TP-001, TP-002, TP-004 all blocked on this. Need to add TAOSTATS_API_KEY to Vercel project env vars.
- **Reddit API on Vercel**: Reddit sometimes blocks Vercel server IPs. News falls back gracefully.
- **CryptoPanic free tier**: Free endpoint may not work without auth token — returns empty gracefully.
- **dTAO is new**: Bittensor's Dynamic TAO launched late 2024. Info may evolve — re-verify periodically.
- **Nav has 10 items**: Getting crowded on medium screens. Consider a dropdown for secondary pages.

---

## How to Run Locally
```bash
cd projects/taopulse-next
npm install
npm run dev
# Opens at localhost:3000
```

## How to Deploy
Push to main branch → Vercel auto-deploys (usually 2-3 min). Check https://taopulse.io after ~3 min.

---

## For Coding Agents
Read this file first before starting any taopulse work. It will save you significant context-gathering time. Key things:
- Always verify URLs before publishing
- Never add Tensor Wallet (it doesn't exist)
- Wallet app method goes BEFORE CLI method
- Run `npm run build` and fix errors before committing
- Push to main — Vercel handles the rest

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

## Open Tasks (taopulse-specific)

| # | Task | Priority | Notes |
|---|------|----------|-------|
| TP-001 | T-012: Staking page — validator data should be live from TaoStats API | High | Currently hardcoded validator list |
| TP-002 | Subnet page — fetch live emission data from TaoStats API | High | Currently static data |
| TP-003 | Home page — live TAO price strip needs verified API source | Medium | Check if CoinGecko or TaoStats |
| TP-004 | Add proper validator comparison with live stake/uptime from taostats.io | Medium | taostats.io/validators has the data |
| TP-005 | News: verify CryptoPanic is actually returning articles (was empty before) | Medium | Check after deploy |
| TP-006 | Usage monitoring — context size warning + daily cost tracker | Medium | Discussed but not built yet |
| TP-007 | StakingCalculator component — verify APY inputs are accurate | Low | Uses hardcoded 17% APY estimate |

---

## Known Issues / Watch Out For
- **Reddit API on Vercel**: Reddit sometimes blocks Vercel server IPs. News falls back to CryptoPanic + RSS.
- **CryptoPanic "free" API**: No auth token needed but rate-limited. Watch for 429s.
- **Subnet data is static**: The 128 subnets page was built with scraped taostats data. Goes stale. Need live API.
- **Validator table is hardcoded**: 5 validators with made-up stake numbers. Need live TaoStats data.
- **dTAO is new**: Bittensor's Dynamic TAO launched late 2024. Info may evolve — re-verify periodically.

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

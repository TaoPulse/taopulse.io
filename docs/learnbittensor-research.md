# LearnBittensor.org — Research Summary
_Source: https://docs.learnbittensor.org_
_Pulled: 2026-03-24_

---

## What is Bittensor?

An open-source platform where participants produce digital commodities (AI inference, training, storage, compute, protein folding, financial prediction, etc.) backed by the Subtensor blockchain. TAO (τ) is the incentive token.

**Not like Bitcoin mining** — "mining" here means producing real AI/compute outputs, not hashing blocks. Blockchain validation is handled by Opentensor Foundation (Proof-of-Authority).

---

## The 4 Roles

| Role | What they do |
|------|-------------|
| **Miner** | Produces the digital commodity in a subnet (AI inference, storage, compute, etc.) |
| **Validator** | Evaluates miner quality; ranks them; feeds into Yuma Consensus |
| **Subnet Creator** | Sets the incentive mechanism — defines what miners must produce and how validators score it |
| **Staker** | Delegates TAO to validators; earns passive rewards proportional to stake |

---

## Subnets

- Each subnet = independent competition marketplace with its own goal
- 128+ subnets exist (browse: tao.app)
- Subnets don't normally talk to each other (cross-subnet API exists but rarely used)
- If a miner/validator is bottom 3 in a subnet at end of tempo → can be deregistered
- Anyone can create a subnet (requires technical knowledge + registration cost in TAO)

---

## Emission Model (critical — updated Nov 2025)

### Key numbers
- **0.5 TAO per block** emitted total (~3,600 TAO/day)
- One block every ~12 seconds
- One **tempo** = ~360 blocks = ~72 minutes (when rewards distribute within subnets)

### Two stages
1. **Injection** — each block, TAO flows into subnet liquidity pools based on that subnet's share
2. **Distribution** — at end of each tempo (~72 min), Yuma Consensus distributes accumulated rewards to miners, validators, stakers, and subnet owner

### How subnet share is determined — Flow-Based Model ("Taoflow", active Nov 2025)
**Replaces the old price-based model.**

- Based on **net TAO inflows** (staking minus unstaking activity) into each subnet
- Uses an **Exponential Moving Average (EMA)** with a ~30-day half-life (~86.8-day window)
- Subnets with **negative net flows get zero emissions**
- Rewards subnets that attract genuine user engagement, not just price speculation
- More responsive than the old model; subnets gaming via "TAO treasury" strategies no longer work

**Formula (simplified):**
```
share(subnet) = (EMA_net_flows ^ p) / sum(all subnets EMA ^ p)
TAO_injected = 0.5 TAO × share(subnet)
```
Default power `p=1` = linear/proportional. Higher `p` = winner-takes-more dynamics.

### Within-subnet emission split
| Recipient | Share |
|-----------|-------|
| Subnet Creator (owner) | 18% |
| Validators | 41% |
| Miners | 41% |

### Staker reward calculation
Stakers share in the **validator's cut**, proportional to their delegated stake:
- Example: Validator has 800 TAO own stake + 200 TAO delegated (3 stakers)
- Validator keeps 83.6% of emissions (80% own + 18% take on delegated portion)
- Stakers split the remaining 16.4%, proportional to their delegation

**Default validator take = 18%** of emissions earned on delegated stake.

---

## Alpha Tokens (dTAO — Dynamic TAO)

Each subnet has its own **alpha token** (subnet-specific token). When you stake to a subnet:
- TAO goes into the subnet's liquidity pool
- You receive alpha tokens in return
- Alpha tokens = your claim on future emissions from that subnet
- Alpha has its own price relative to TAO (like an AMM pool)
- **Risk:** impermanent loss if you stake then unstake while price moved

**Classic (root) staking** = stake TAO to a validator at the root level → stay in TAO, no alpha exposure → safer, lower ceiling.

---

## Alpha Halving
Each subnet's alpha token follows its own halving schedule (starting from when that subnet was created), independent of TAO's halving.

---

## Yuma Consensus
The algorithm that:
1. Takes validator rankings of miners
2. Weighs them (validators who agree with consensus get higher weight)
3. Computes final emission split per miner/validator
4. Incentivizes honest validation — validators who collude or act against consensus earn less

---

## Who Maintains Bittensor
- **Opentensor Foundation** — nonprofit, maintains core Subtensor blockchain
- **Latent Holdings** — maintains btcli SDK, tao.app, docs, and Subnet 14 (TAOHASH)
- Head of Docs: Michael "Trexman" Trestman

---

## Key Terminology Reference

| Term | Meaning |
|------|---------|
| Subtensor | The Bittensor blockchain |
| TAO (τ) | The main token; used for staking, emissions, governance |
| Alpha (α) | Subnet-specific token; received when staking into a subnet |
| Tempo | ~72-minute cycle after which rewards distribute within a subnet |
| Block | ~12 seconds; 0.5 TAO emitted per block |
| Yuma Consensus | Algorithm that distributes rewards based on validator rankings |
| dTAO / Dynamic TAO | The new system where each subnet has its own alpha token (launched late 2024) |
| Taoflow | Flow-based emission model (active Nov 2025) replacing price-based model |
| Nominator / Delegator | A staker who delegates TAO to a validator |
| btcli | Bittensor CLI tool for interacting with the network |
| Subnet 0 (Root) | Special root subnet for classic TAO staking |

---

## Useful External Links

| Resource | URL |
|----------|-----|
| Official Docs | https://docs.learnbittensor.org |
| Subnet Explorer + Tokenomics | https://tao.app |
| Dynamic TAO White Paper | https://drive.google.com/file/d/1vkuxOFPJyUyoY6dQzfIWwZm2_XL3AEOx/view |
| Bittensor Discord | https://discord.com/channels/799672011265015819/830068283314929684 |
| GitHub (Opentensor) | https://github.com/opentensor |
| Subnet Listings (LearnBittensor) | https://learnbittensor.org/subnets |

---

## TaoPulse Content Opportunities (from this research)

1. **Emissions explainer page** — "How TAO emissions work" — flow model is new (Nov 2025) and not well documented for beginners. High SEO value.
2. **Yuma Consensus explainer** — simplified for non-technical readers
3. **Alpha tokens / dTAO deep dive** — lots of confusion here; good content gap
4. **Validator take calculator** — show stakers their actual yield after validator cut
5. **"What is a tempo?" FAQ** — simple but commonly searched
6. **Subnet creator guide** — who can create one, what it costs, what the 18% means
7. **Staking math page** — show the delegation math with examples (like the 800+200 TAO example above)

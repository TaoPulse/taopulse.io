# Top 25 Bittensor Subnets — Comprehensive Reference Guide

> **Last updated:** March 2026  
> **Source:** TaoStats, official subnet GitHub repos, Bittensor docs (docs.learnbittensor.org), Macrocosmos docs, community resources  
> **Note:** Live metrics (miner/validator counts, registration costs) are dynamic. Always verify at [taostats.io/subnets](https://taostats.io/subnets) before committing capital.

---

## Table of Contents

1. [Summary Table](#summary-table)
2. [How Bittensor Subnets Work](#how-bittensor-subnets-work)
3. [Cost Framework](#cost-framework)
4. [Subnet Details](#subnet-details)
   - [SN1 — Apex (Algorithmic Intelligence)](#sn1--apex-algorithmic-intelligence)
   - [SN2 — Omron (Verifiable AI / zk-ML)](#sn2--omron-verifiable-ai--zk-ml)
   - [SN3 — MyShell (TTS & Voice AI)](#sn3--myshell-tts--voice-ai)
   - [SN4 — Targon (Confidential Compute / Inference)](#sn4--targon-confidential-compute--inference)
   - [SN5 — OpenKaito / Image (Text-to-Image)](#sn5--openkaito--image-text-to-image)
   - [SN6 — Nous Fine-Tuning](#sn6--nous-fine-tuning)
   - [SN7 — SubVortex (Subtensor Infrastructure)](#sn7--subvortex-subtensor-infrastructure)
   - [SN8 — Taoshi / Vanta (Proprietary Trading)](#sn8--taoshi--vanta-proprietary-trading)
   - [SN9 — IOTA Pretraining (Foundation Models)](#sn9--iota-pretraining-foundation-models)
   - [SN10 — Sturdy Finance (DeFi/Yield Optimization)](#sn10--sturdy-finance-defiyield-optimization)
   - [SN11 — Dippy (Roleplay / Character AI)](#sn11--dippy-roleplay--character-ai)
   - [SN13 — Data Universe (Decentralized Data)](#sn13--data-universe-decentralized-data)
   - [SN14 — Palaidn (Cybersecurity)](#sn14--palaidn-cybersecurity)
   - [SN15 — Blockchain Insights](#sn15--blockchain-insights)
   - [SN17 — 404-Gen (3D Asset Generation)](#sn17--404-gen-3d-asset-generation)
   - [SN18 — Cortex.t / AI Scraping](#sn18--cortext--ai-scraping)
   - [SN19 — Naïve Bayes / Vision (Multi-Modal)](#sn19--naïve-bayes--vision-multi-modal)
   - [SN21 — Any Compute (GPU Marketplace)](#sn21--any-compute-gpu-marketplace)
   - [SN22 — Desearch (AI-Powered Search)](#sn22--desearch-ai-powered-search)
   - [SN23 — NicheImage (Decentralized Image Gen)](#sn23--nicheimage-decentralized-image-gen)
   - [SN25 — Distributed Training (Hivemind)](#sn25--distributed-training-hivemind)
   - [SN27 — Compute Subnet (Decentralized Compute)](#sn27--compute-subnet-decentralized-compute)
   - [SN28 — Foundry S&P 500 Oracle](#sn28--foundry-sp-500-oracle)
   - [SN30 — Wombo Dream (Creative Content)](#sn30--wombo-dream-creative-content)
   - [SN34 — BitMind GAS (Deepfake Detection)](#sn34--bitmind-gas-deepfake-detection)

---

## Summary Table

| # | Subnet | Category | Active Miners (est.) | Validators (est.) | Miner Cost | Validator Cost |
|---|--------|----------|---------------------|-------------------|------------|----------------|
| SN1 | Apex | Algorithmic Intelligence | ~128–192 | ~32–64 | ~0.1–1 τ reg + GPU | ~5,000–50,000 τ stake |
| SN2 | Omron | Verifiable AI (zk-ML) | ~100–180 | ~20–64 | ~0.1–1 τ reg + CPU/GPU | ~5,000–50,000 τ stake |
| SN3 | MyShell | TTS / Voice AI | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU | ~5,000–50,000 τ stake |
| SN4 | Targon | Confidential Inference | ~100–192 | ~20–64 | ~0.1–1 τ reg + A100/H100 | ~5,000–100,000 τ stake |
| SN5 | NicheImage (orig. ImageSubnet) | Text-to-Image | ~128–192 | ~32–64 | ~0.1–1 τ reg + GPU (24GB+) | ~5,000–50,000 τ stake |
| SN6 | Nous Fine-Tuning | LLM Fine-Tuning | ~128–192 | ~32–64 | ~0.1–1 τ reg + GPU cluster | ~5,000–50,000 τ stake |
| SN7 | SubVortex | Infrastructure | ~100–180 | ~20–64 | ~0.1–1 τ reg + VPS | ~5,000–20,000 τ stake |
| SN8 | Vanta Network | Prop Trading Signals | ~128–192 | ~32–64 | ~0.1–1 τ reg + CPU | ~5,000–100,000 τ stake |
| SN9 | IOTA Pretraining | Foundation Models | ~128–192 | ~32–64 | ~0.1–1 τ reg + GPU cluster | ~5,000–100,000 τ stake |
| SN10 | Sturdy Finance | DeFi Yield | ~100–192 | ~20–64 | ~0.1–1 τ reg + CPU | ~5,000–50,000 τ stake |
| SN11 | Dippy | Character AI | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU | ~5,000–50,000 τ stake |
| SN13 | Data Universe | Data Scraping | ~128–200 | ~32–64 | ~0.1–1 τ reg + Storage + CPU | ~5,000–50,000 τ stake |
| SN14 | Palaidn | Cybersecurity | ~80–192 | ~20–64 | ~0.1–1 τ reg + CPU | ~5,000–20,000 τ stake |
| SN15 | Blockchain Insights | On-Chain Analytics | ~80–192 | ~20–64 | ~0.1–1 τ reg + CPU | ~5,000–20,000 τ stake |
| SN17 | 404-Gen | 3D Generation | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU (VRAM) | ~5,000–50,000 τ stake |
| SN18 | Cortex.t / Synthetic Data | AI Data Gen | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU | ~5,000–50,000 τ stake |
| SN19 | Vision / Dojo | Multi-Modal AI | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU | ~5,000–50,000 τ stake |
| SN21 | Any Compute | GPU Marketplace | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU node | ~5,000–50,000 τ stake |
| SN22 | Desearch | AI Search | ~100–192 | ~20–64 | ~0.1–1 τ reg + CPU + APIs | ~5,000–50,000 τ stake |
| SN23 | NicheImage | Image Gen | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU (24GB+) | ~5,000–50,000 τ stake |
| SN25 | Distributed Training | Model Training | ~80–192 | ~20–64 | ~0.1–1 τ reg + GPU cluster | ~5,000–100,000 τ stake |
| SN27 | Compute | Decentralized GPU | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU | ~5,000–100,000 τ stake |
| SN28 | Foundry S&P500 | Financial Prediction | ~100–192 | ~20–64 | ~0.1–1 τ reg + CPU | ~5,000–50,000 τ stake |
| SN30 | Wombo Dream | Creative Content | ~100–192 | ~20–64 | ~0.1–1 τ reg + GPU (24GB+) | ~5,000–50,000 τ stake |
| SN34 | BitMind GAS | Deepfake Detection | ~80–192 | ~20–64 | ~0.1–1 τ reg (no GPU needed as discriminator) | ~5,000–50,000 τ stake |

> **Dynamic Costs Note:** Registration fees fluctuate based on subnet demand — ranging from as low as 0.0001 τ to several τ. Check `btcli subnet register --netuid X` for live cost. Validator stake minimum is 1,000 stake weight per the Bittensor protocol. In practice, competitive slots in established subnets require significantly more (commonly 5,000–100,000+ τ delegated).

---

## How Bittensor Subnets Work

Bittensor is a decentralized network where each **subnet** is an independent incentive market:

- **Miners** produce digital commodities (AI outputs, compute, data).
- **Validators** evaluate miner work and assign scores (weights).
- **Yuma Consensus** aggregates validator weights to determine TAO emissions.
- Each subnet supports up to **256 UID slots** (192 miners + 64 validators by default).
- **Registration** requires burning TAO to get a UID; cost is dynamic.
- **Validators** need ≥1,000 stake-weight (`α + 0.18 × τ`) to get a validator permit.

The **taostats URL pattern** for each subnet is: `https://taostats.io/subnets/netuid-{N}/`

---

## Cost Framework

### Miner Costs
1. **Registration fee (dynamic):** Burns TAO when you register. Currently ranges from ~0.001–5+ τ per registration depending on subnet demand. Check live with `btcli subnet burn-cost`.
2. **Hardware:** Varies by subnet — typically:
   - CPU-only: ~$50–200/month cloud
   - GPU (RTX 3090/4090 24GB): ~$500–1,000/month cloud
   - A100/H100 (80GB): ~$2,000–4,000/month cloud
3. **Re-registration risk:** If your miner is pruned (lowest emissions), you pay another registration fee.

### Validator Costs
1. **Stake requirement:** Protocol minimum is 1,000 stake-weight. In competitive subnets, top-64 validators may require 5,000–100,000+ τ staked (or delegated from others).
2. **At current TAO price (~$300–400, March 2026):** 5,000 τ ≈ $1.5M–2M; 1,000 τ ≈ $300k–400k. This makes solo validating capital-intensive.
3. **Hardware:** Validators typically need less compute than miners (mostly scoring/downloading), but still require reliable VPS or cloud nodes ($100–500/month).
4. **Alternative:** Parent-key delegation — borrow stake from root network validators to meet threshold.

---

## Subnet Details

---

### SN1 — Apex (Algorithmic Intelligence)

**NetUID:** 1  
**Owner:** Macrocosmos (formerly OpenTensor Foundation)  
**Category:** Algorithmic Problem Solving / Competition-Based AI

#### What It Does
Subnet 1 (now called **Apex**) is the original Bittensor subnet, evolved from text prompting into a competition-based algorithmic intelligence platform. Miners submit Python algorithms via the **Apex CLI** to compete in structured challenges called "Competitions." Each competition runs multiple "Rounds" where miners are scored against benchmarks.

**Current active competitions include:**
- **RL Battleship** — Reinforcement learning agents compete in a 10×10 battleship strategy game
- **IOTA Simulator** — Distributed training simulation; miners submit routing/balancing algorithms for heterogeneous node networks

Validators continuously evaluate submissions and distribute TAO rewards to the best-performing algorithms.

#### Participants
- **Active miners:** ~128–192 (subnet fills to near-capacity given prestige)
- **Validators:** ~32–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ (dynamic) | GPU (optional, RL training helps); ~$200–500/month compute |
| Validator | ~0.1–2 τ (dynamic) | 5,000–50,000+ τ staked; ~$200–500/month cloud node |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-1/
- 💻 **GitHub:** https://github.com/macrocosm-os/apex
- 📖 **Docs:** https://docs.macrocosmos.ai/subnets/subnet-1-apex
- 🌐 **Platform:** https://www.macrocosmos.ai/sn1

---

### SN2 — Omron (Verifiable AI / zk-ML)

**NetUID:** 2  
**Owner:** Inference Labs  
**Category:** Zero-Knowledge Machine Learning (zk-ML) / Proof-of-Inference

#### What It Does
Subnet 2 (**Omron**, formerly "Inference Labs") builds the world's largest **peer-to-peer Verified Intelligence network** using zero-knowledge proofs (zk-ML). Miners convert AI models into ZK circuits and generate cryptographic proofs alongside predictions. This creates verifiable "Proof-of-Inference" — validators can verify a model's prediction came from a specific AI model without re-running the entire computation.

**Incentive structure:** Miners are rewarded based on:
- Proof size efficiency
- Time to generate proofs
- Correctness of the prediction

ZK-proofs are more CPU-intensive than GPU, making this accessible to non-GPU miners while also incentivizing GPU optimization.

#### Participants
- **Active miners:** ~100–180
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU-heavy; GPU beneficial for proof generation. ~$200–800/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; proof verification infrastructure; ~$200–500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-2/
- 💻 **GitHub:** https://github.com/inference-labs-inc/subnet-2
- 📖 **Docs:** https://omron.ai
- 🐳 **Docker:** ghcr.io/inference-labs-inc/subnet-2

---

### SN3 — MyShell (TTS & Voice AI)

**NetUID:** 3  
**Owner:** MyShell  
**Category:** Text-to-Speech / Voice Synthesis

#### What It Does
Subnet 3 is focused on **Text-to-Speech (TTS) synthesis and voice AI**. Miners run high-quality voice synthesis models and respond to validator requests for audio generation. This subnet powers voice capabilities for AI applications requiring natural-sounding speech output.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU (16GB+ VRAM); ~$500–1,500/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$200–500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-3/
- 🌐 **Website:** https://myshell.ai
- 💻 **GitHub:** https://github.com/MyShell-ai (search Bittensor subnet)

---

### SN4 — Targon (Confidential Compute / Inference)

**NetUID:** 4  
**Owner:** Manifold Labs  
**Category:** Secure AI Inference / Confidential Computing

#### What It Does
**Targon** is a next-generation AI infrastructure platform leveraging **Confidential Compute (CC)** and **Protected PCIe (PPCIE)** technology to create a verifiable, trustworthy AI inference network. It uses hardware-level security (NVIDIA Confidential Compute, AMD SEV-SNP) to provide:

- Hardware-enforced memory encryption
- GPU Trusted Execution Environments (TEE)
- Remote attestation for verifiable computation
- End-to-end secure AI inference

Miners provide GPU compute with TEE attestation. Validators verify that inference was performed correctly in a secure enclave.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | A100/H100 with Confidential Compute enabled (~$2,000–5,000/month); high barrier |
| Validator | ~0.1–2 τ | 5,000–100,000+ τ staked; ~$500–1,000/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-4/
- 💻 **GitHub:** https://github.com/manifold-inc/targon
- 📖 **Miner Docs:** https://github.com/manifold-inc/targon/blob/main/docs/miner/miner.md

---

### SN5 — OpenKaito / Image (Text-to-Image)

**NetUID:** 5  
**Owner:** Community (originally unconst / Stability focused)  
**Category:** Text-to-Image Generation

#### What It Does
Subnet 5 originally launched as the **ImageSubnet**, incentivizing miners to serve Stable Diffusion models. Miners respond to text prompts by generating images. Validators score images based on:
- **Aesthetic quality** (perceptual quality scoring)
- **Prompt adherence** (how closely the image matches the prompt)
- **Diversity** (similar images are penalized to encourage variety)

Miners can run various diffusion models (Stable Diffusion, SDXL, and others). This has evolved into a broader image generation competition platform.

#### Participants
- **Active miners:** ~128–192
- **Validators:** ~32–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU with 24GB+ VRAM (RTX 3090/4090, A100); ~$600–2,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; GPU for running validation models; ~$500–1,000/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-5/
- 💻 **GitHub (original):** https://github.com/unconst/ImageSubnet
- 📝 Note: Subnet may have migrated to newer repos — check taostats for current owner

---

### SN6 — Nous Fine-Tuning

**NetUID:** 6  
**Owner:** Nous Research  
**Category:** LLM Fine-Tuning Benchmark

#### What It Does
**Subnet 6** rewards miners for fine-tuning Large Language Models with **continuously generated synthetic data** from Subnet 18 (Cortex.t). This is the first-ever:
- Continuous fine-tuning benchmark with daily new data
- Incentivized fine-tuning competition
- Cross-subnet data pipeline (SN18 data → SN6 training)

**How it works:**
1. Miners fine-tune models and publish them to 🤗 Hugging Face, committing metadata to the chain.
2. Validators download models, evaluate them against the latest SN18-generated data.
3. Yuma Consensus determines emissions proportional to loss performance.

#### Participants
- **Active miners:** ~128–192
- **Validators:** ~32–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | Multi-GPU cluster (A100/H100 for competitive fine-tuning); ~$1,000–5,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; GPU for running evaluation; ~$500–1,500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-6/
- 💻 **GitHub:** https://github.com/NousResearch/finetuning-subnet
- 📖 **Leaderboard:** https://huggingface.co/spaces/NousResearch/finetuning_subnet_leaderboard

---

### SN7 — SubVortex (Subtensor Infrastructure)

**NetUID:** 7  
**Owner:** SubVortex Community  
**Category:** Network Infrastructure / Subtensor Nodes

#### What It Does
**Subnet 7 (SubVortex)** incentivizes running **Bittensor network infrastructure** — specifically, decentralized Subtensor (blockchain) nodes. Miners provide subtensor RPC endpoints, contributing to the decentralization and resilience of the Bittensor blockchain itself. Validators test availability, latency, and correctness of these nodes.

This subnet is critical for Bittensor's decentralization — without distributed subtensor nodes, the network would be dependent on centralized endpoints.

#### Participants
- **Active miners:** ~100–180
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | VPS with 16GB RAM, 500GB+ SSD, fast internet; ~$50–200/month |
| Validator | ~0.1–2 τ | 5,000–20,000+ τ staked; ~$100–300/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-7/
- 💻 **GitHub:** Search "SubVortex bittensor" on GitHub

---

### SN8 — Taoshi / Vanta (Proprietary Trading)

**NetUID:** 8  
**Owner:** Taoshi (now rebranded Vanta Network)  
**Category:** Quantitative Trading / Financial Prediction

#### What It Does
**Vanta Network (formerly Proprietary Trading Network / PTN)** is one of the most competitive Bittensor subnets. Miners submit **trading signals** (LONG, SHORT, FLAT) for:
- **Forex pairs**
- **Crypto pairs**
- **Equity pairs**

**Scoring is strict:**
- Miners must generate positive returns with <10% max drawdown or they're **eliminated permanently**
- Anti-plagiarism system detects copied signals — plagiarizers are permanently blacklisted
- **Eliminated hotkeys can never re-register** — requires a fresh hotkey
- Top miners earn millions of dollars in TAO payouts

This subnet effectively creates the world's most competitive decentralized trading signal network.

#### Participants
- **Active miners:** ~128–192 (high turnover due to eliminations)
- **Validators:** ~32–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU sufficient (model research more important than raw compute); ~$100–500/month |
| Validator | ~0.1–2 τ | 5,000–100,000+ τ staked; ~$200–500/month |

**⚠️ Important:** Once your hotkey is eliminated or deregistered, it's **permanently blacklisted**. Only register with a hotkey you're committed to.

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-8/
- 💻 **GitHub:** https://github.com/taoshidev/vanta-network
- 📖 **Dashboard:** https://dashboard.taoshi.io/
- 🌐 **Website:** https://taoshi.io

---

### SN9 — IOTA Pretraining (Foundation Models)

**NetUID:** 9  
**Owner:** Macrocosmos  
**Category:** Foundation Model Pretraining

#### What It Does
**Subnet 9 (IOTA)** incentivizes miners to train and continuously improve **pretrained foundation models** on the Falcon Refined Web dataset. It acts as a **continuous benchmark**: miners compete to achieve the lowest loss on randomly sampled pages.

**Mechanism:**
1. Miners train models and publish to 🤗 Hugging Face with metadata committed on-chain.
2. Validators download models and evaluate loss on random Falcon batches.
3. The miner with the lowest loss on the most batches wins the most emissions.

This is one of the most compute-intensive subnets — competitive miners need significant GPU clusters to train frontier-scale models.

#### Participants
- **Active miners:** ~128–192
- **Validators:** ~32–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | Multi-GPU / GPU cluster (A100×8 or H100×8); ~$5,000–20,000/month minimum for competition |
| Validator | ~0.1–2 τ | 5,000–100,000+ τ staked; A100 for model evaluation; ~$1,000–3,000/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-9/
- 💻 **GitHub:** https://github.com/macrocosm-os/pretraining
- 📖 **Docs:** https://docs.macrocosmos.ai/subnets/subnet-9-iota
- 🏆 **Leaderboard:** https://www.macrocosmos.ai/sn9

---

### SN10 — Sturdy Finance (DeFi/Yield Optimization)

**NetUID:** 10  
**Owner:** Sturdy Finance  
**Category:** DeFi Yield Optimization / Prediction

#### What It Does
**Subnet 10** incentivizes miners to predict and optimize **DeFi yield allocations**. Miners submit predictions about the best yield opportunities across DeFi protocols, and validators compare predictions against actual on-chain outcomes. This creates a decentralized financial intelligence network that could be used by yield aggregators to optimize capital allocation.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU + blockchain API access; ~$100–300/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$100–300/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-10/
- 💻 **GitHub:** https://github.com/Sturdy-subnet/sturdy-subnet
- 🌐 **Website:** https://sturdy.finance

---

### SN11 — Dippy (Roleplay / Character AI)

**NetUID:** 11  
**Owner:** Dippy  
**Category:** Character AI / Roleplay / Companionship AI

#### What It Does
**Subnet 11** incentivizes miners to run the best **roleplay and character-based language models**. Validators send roleplay prompts and evaluate miners' responses for quality, character consistency, safety, and engagement. This powers Dippy's consumer AI companion applications.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU (24GB+ for competitive LLMs); ~$500–2,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$300–800/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-11/
- 🌐 **Website:** https://dippy.ai
- 💻 **GitHub:** https://github.com/impel-intelligence/dippy-bittensor-subnet

---

### SN13 — Data Universe (Decentralized Data)

**NetUID:** 13  
**Owner:** Macrocosmos  
**Category:** Decentralized Data Collection & Storage

#### What It Does
**Subnet 13 (Data Universe)** is **the world's largest open-source social media dataset**, storing decentralized data from:
- X (Twitter)
- Reddit
- YouTube (transcripts)

Miners scrape and store data across a distributed network. Data is queryable by validators and external applications. The network supports **up to 50 petabytes** of data across 200 miners.

**Products built on SN13:**
- **Gravity** (https://app.macrocosmos.ai/gravity) — No-code data scraping tool for X and Reddit
- **Mission Commander** — AI chatbot for query optimization

This is one of the most business-ready subnets with real enterprise data use cases.

#### Participants
- **Active miners:** ~128–200
- **Validators:** ~32–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU + 250GB–10TB storage; broadband; ~$100–400/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~10GB storage + CPU; ~$100–300/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-13/
- 💻 **GitHub:** https://github.com/macrocosm-os/data-universe
- 📖 **Docs:** https://docs.macrocosmos.ai/subnets/subnet-13-data-universe
- 🌐 **Gravity App:** https://app.macrocosmos.ai/gravity

---

### SN14 — Palaidn (Cybersecurity)

**NetUID:** 14  
**Owner:** Palaidn  
**Category:** Cybersecurity / Threat Intelligence

#### What It Does
**Subnet 14 (Palaidn)** creates a decentralized **cybersecurity intelligence network**. Miners analyze data for threats, fraud, suspicious transactions, and security vulnerabilities. The subnet incentivizes the development of security models that can identify and flag malicious on-chain and off-chain activity.

#### Participants
- **Active miners:** ~80–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU + threat intelligence APIs; ~$100–500/month |
| Validator | ~0.1–2 τ | 5,000–20,000+ τ staked; ~$100–300/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-14/
- 💻 **GitHub:** https://github.com/palaidn/palaidn_subnet
- 🌐 **Website:** https://palaidn.com

---

### SN15 — Blockchain Insights

**NetUID:** 15  
**Owner:** Blockchain Insights Team  
**Category:** On-Chain Data Analytics / Prediction

#### What It Does
**Subnet 15** incentivizes miners to provide **blockchain data analytics and predictions**. Miners analyze on-chain data from multiple blockchains and produce insights about transaction patterns, whale movements, protocol metrics, and price predictions. Validators verify the quality and accuracy of these insights.

#### Participants
- **Active miners:** ~80–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU + blockchain node or API access; ~$100–500/month |
| Validator | ~0.1–2 τ | 5,000–20,000+ τ staked; ~$100–300/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-15/
- 💻 **GitHub:** https://github.com/blockchain-insights/blockchain-data-subnet

---

### SN17 — 404-Gen (3D Asset Generation)

**NetUID:** 17  
**Owner:** 404 Labs  
**Category:** 3D Asset / Content Generation

#### What It Does
**Subnet 17 (404-Gen)** aims to **democratize 3D content creation** by incentivizing miners to generate high-quality 3D assets from text prompts. The goal is to power the next generation of AI-native games, virtual worlds, and AR/VR/XR experiences.

**Prompt generation:** LLMs automatically generate prompts for 3D objects across 30 categories (gaming assets, etc.). Validators score miners on 3D quality and prompt adherence.

**Vision:** Eventually enable entire games where all elements (3D assets, dialogue, sound) are generated at runtime.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | High-VRAM GPU (40–80GB VRAM preferred); ~$1,000–4,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$300–800/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-17/
- 💻 **GitHub:** https://github.com/404-Repo/three-gen-subnet
- 📊 **Dashboard:** https://dashboard.404.xyz/d/main/404-gen/
- 🌐 **Website:** https://404.xyz

---

### SN18 — Cortex.t / AI Scraping

**NetUID:** 18  
**Owner:** Corcel  
**Category:** Synthetic Data Generation / LLM API

#### What It Does
**Subnet 18 (Cortex.t)** was one of the first Bittensor subnets to provide **AI API access** to external developers. Miners run large language models and respond to inference requests. Validators score quality, latency, and diversity.

**Key role in the ecosystem:** SN18 generates synthetic training data consumed by Subnet 6 (Nous Fine-Tuning), making it a critical cross-subnet dependency.

This subnet also powers the **Corcel API** (https://corcel.io), a commercial LLM API service built on top of the Bittensor subnet.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU (24GB+ for competitive LLMs); ~$500–2,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$300–800/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-18/
- 🌐 **Corcel API:** https://corcel.io
- 💻 **GitHub:** https://github.com/Corcel-API (search bittensor)

---

### SN19 — Naïve Bayes / Vision (Multi-Modal)

**NetUID:** 19  
**Owner:** Various / Community evolved  
**Category:** Multi-Modal AI / Human Feedback

#### What It Does
**Subnet 19** has evolved through several incarnations. Currently associated with **Dojo** (by Tensorplex Labs), which transforms the traditional GAN (Generative Adversarial Network) concept into a competitive, decentralized GAN on Bittensor.

In Dojo V2, miners act as both generators and discriminators, competing to produce and identify the highest-quality outputs. The zero-sum incentive model means generators must continuously create more convincing outputs to beat discriminators.

**Unique:** Miners don't need to spin up code — they simply register and use a browser wallet (e.g., Talisman) to receive and complete tasks at https://dojo.network.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | Browser wallet (for Dojo); GPU for competitive generation; ~$0–1,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$300–800/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-19/
- 💻 **GitHub:** https://github.com/tensorplex-labs/dojo
- 🌐 **App:** https://dojo.network
- 📖 **Docs:** https://docs.tensorplex.ai

---

### SN21 — Any Compute (GPU Marketplace)

**NetUID:** 21  
**Owner:** Any Compute  
**Category:** Decentralized GPU Compute Marketplace

#### What It Does
**Subnet 21** creates a **decentralized GPU compute marketplace**. Miners rent out GPU compute capacity, while validators verify the availability, performance, and reliability of that compute. This directly competes with centralized cloud providers by creating a trustless, verifiable compute market.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU node (consumer or data center); ~$200–3,000/month depending on hardware |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$200–500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-21/
- 🌐 **Website:** https://anycompute.io

---

### SN22 — Desearch (AI-Powered Search)

**NetUID:** 22  
**Owner:** Desearch (formerly Datura AI Smart Scrape)  
**Category:** AI Search Engine / Web Intelligence

#### What It Does
**Subnet 22 (Desearch)** is an **AI-powered decentralized search engine** providing unbiased, verifiable search results. It aggregates data from:
- X (Twitter)
- Reddit
- Arxiv (academic papers)
- General web search

**Features:**
- AI-powered analysis for contextual, relevant search results
- Real-time access to diverse data sources
- Sentiment and metadata analysis
- No central entity controlling results

**API:** Developers can integrate Desearch via API for AI search capabilities in their products.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU + external API keys (X, Reddit, etc.); Redis; ~$200–600/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; Redis required; ~$200–500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-22/
- 💻 **GitHub:** https://github.com/Desearch-ai/subnet-22
- 🌐 **Website:** https://desearch.ai

---

### SN23 — NicheImage (Decentralized Image Gen)

**NetUID:** 23  
**Owner:** SocialTensor (NicheTensor)  
**Category:** Decentralized Image Generation

#### What It Does
**Subnet 23 (NicheImage)** runs a **decentralized image generation network** with volume-based incentives. Miners commit to specific model types and generation volumes across multiple categories:

| Category | Incentive |
|----------|-----------|
| GoJourney | 4% |
| FluxSchnell | 10% |
| OpenGeneral | 5% |
| OpenTraditionalArtSketch | 5% |
| DeepSeek_R1 LLM | 5% |
| Burn | 71% |

**Unique incentive formula:** `new_reward = (category_score - time_penalty) × (0.6 + 0.4 × volume_scale)`

Validators also earn by sharing request capacity. Supports thousands of generations per minute.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU 24GB+ (RTX 3090/4090, A100); ~$600–2,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$300–800/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-23/
- 💻 **GitHub:** https://github.com/SocialTensor/SocialTensorSubnet
- 🌐 **Studio:** https://studio.nichetensor.com/
- 📖 **API Docs:** https://docs.nichetensor.com

---

### SN25 — Distributed Training (Hivemind)

**NetUID:** 25  
**Owner:** Hivetrain  
**Category:** Distributed/Federated Model Training

#### What It Does
**Subnet 25** implements **distributed deep learning** using Bittensor's incentive network. Miners train model weight-deltas (differences between a base model and trained model), upload them to HuggingFace, and an **Averager** node (run by the subnet owner) aggregates the best weight-deltas into an improved base model.

**Components:**
- **Miners:** Train weight-deltas on random test sets, upload to HuggingFace
- **Validators:** Evaluate loss reduction by miners on random test sets
- **Averager:** Creates weighted average of top performing deltas to form the new base model

This cycle repeats continuously, progressively improving the model — a form of decentralized federated learning.

#### Participants
- **Active miners:** ~80–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU (A100 preferred); HuggingFace account; ~$500–3,000/month |
| Validator | ~0.1–2 τ | 5,000–100,000+ τ staked; GPU for evaluation; ~$500–1,500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-25/
- 💻 **GitHub:** https://github.com/bit-current/DistributedTraining

---

### SN27 — Compute Subnet (Decentralized Compute)

**NetUID:** 27  
**Owner:** Neural Internet / Community  
**Category:** Decentralized Compute / GPU-as-a-Service

#### What It Does
**Subnet 27** provides a **decentralized compute marketplace** where miners offer GPU and CPU resources. This is the "yellow pages" of Bittensor compute — validators benchmark miner machines for performance, reliability, uptime, and pricing. End-users can access decentralized compute through the subnet.

Different from SN21 — SN27 is broader, accepting various compute types and hardware configurations.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | Any GPU/CPU with Docker; ~$100–3,000/month |
| Validator | ~0.1–2 τ | 5,000–100,000+ τ staked; ~$200–500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-27/
- 💻 **GitHub:** https://github.com/neuralinternet/compute-subnet (may have migrated)

---

### SN28 — Foundry S&P 500 Oracle

**NetUID:** 28  
**Owner:** Foundry Digital Services  
**Category:** Financial Market Prediction / S&P 500 Oracle

#### What It Does
**Subnet 28** creates an **S&P 500 price oracle** incentivizing accurate short-term price forecasts during market trading hours. Miners use neural network architectures to predict S&P 500 prices and must open-source both models and input data on HuggingFace.

**Scoring metrics:**
- **Directional Accuracy:** Was the prediction in the correct direction?
- **Mean Absolute Error:** How far was the prediction from the true price?

Validators store forecasts and compare them against actual S&P 500 prices as predictions mature.

**Strategic rationale:** Financial markets provide massive user bases; external truth source (actual prices) prevents gaming; adversarial environment drives model diversity.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | CPU + market data APIs; models must be on HuggingFace; ~$100–500/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; ~$100–300/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-28/
- 💻 **GitHub:** https://github.com/foundryservices/snpOracle
- 📖 **Dashboard:** https://app.yumaai.com/
- 🌐 **Twitter:** https://x.com/FoundryServices

---

### SN30 — Wombo Dream (Creative Content)

**NetUID:** 30  
**Owner:** WOMBO (w.ai)  
**Category:** Creative Content Generation / Social Media AI

#### What It Does
**Subnet 30** powers WOMBO's decentralized content generation engine, focusing on generating **compelling AI images and creative content** for social media distribution. WOMBO has 200M+ app downloads and two #1-ranked AI apps globally.

**Incentive mechanism:**
- Scores based on **diffusion step similarity** (not final image only) — reduces validator compute
- Score multiplied by **requests per second** the miner handles
- Adjusted by **success rate** (error rate penalty)
- Miners running behind load balancers earn more (concurrency rewarded)
- 25% chance of real user data validation — failing real-user requests incurs higher penalties

**Unique:** Plans to tie emissions to social media performance in future versions.

#### Participants
- **Active miners:** ~100–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Miner | ~0.1–2 τ | GPU (24GB+ VRAM); Redis; load balancer optional but increases earnings; ~$600–2,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; GPU for scoring; ~$500–1,000/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-30/
- 💻 **GitHub:** https://github.com/womboai/wombo-bittensor-subnet
- 🌐 **Website:** https://w.ai / https://wombo.ai / https://dream.ai

---

### SN34 — BitMind GAS (Deepfake Detection)

**NetUID:** 34  
**Owner:** BitMind AI  
**Category:** AI-Generated Content Detection / Deepfake Defense

#### What It Does
**Subnet 34 (GAS — Generative Adversarial Subnet)** is inspired by **Generative Adversarial Networks**. Two types of miners compete:

**Two competition tracks:**
1. **Discriminative Mining:** Submit AI-generated content detection models (image, video, audio). Scored on accuracy + calibration (geometric mean of MCC and Brier score). **No GPU needed** — models evaluated on cloud infrastructure.
2. **Generative Mining:** Run a server generating synthetic media on demand. Rewarded for valid content × multiplier for fooling discriminators.

**Three modalities:** Image, video, and audio detection scored independently. Datasets refresh weekly. This adversarial loop continuously improves both detection and generation.

#### Participants
- **Active miners:** ~80–192
- **Validators:** ~20–64

#### Costs
| Role | Registration Fee | Stake/Hardware |
|------|-----------------|----------------|
| Discriminative Miner | ~0.1–2 τ | No GPU required! Train locally, upload model; ~$50–200/month |
| Generative Miner | ~0.1–2 τ | GPU server for real-time generation; ~$500–2,000/month |
| Validator | ~0.1–2 τ | 5,000–50,000+ τ staked; GPU for running validation; ~$500–1,500/month |

#### Key Links
- 📊 **TaoStats:** https://taostats.io/subnets/netuid-34/
- 💻 **GitHub:** https://github.com/BitMind-AI/bitmind-subnet
- 📖 **Deepwiki:** https://deepwiki.com/BitMind-AI/bitmind-subnet
- 💬 **Discord:** https://discord.gg/kKQR98CrUn

---

## Additional Context

### Key Network Parameters (as of early 2026)
- **Max UIDs per subnet:** 256 (192 miners + 64 validators by default)
- **Validator permit requirement:** Top 64 by emissions + ≥1,000 stake weight
- **Stake weight formula:** `α + 0.18 × τ` (alpha-stake + 18% of TAO stake)
- **Block time:** ~12 seconds
- **Immunity period:** ~4,096 blocks (~13.7 hours) after registration
- **Subnet creation cost:** Dynamic, starts at 100 τ, doubles each creation, decays over time

### TAO Price Context (March 2026)
With TAO trading around $300–400:
- 1,000 τ minimum stake ≈ $300k–400k
- 5,000 τ competitive stake ≈ $1.5M–2M
- Validator permit threshold is accessible for large institutions and dedicated validators

### Delegation (Staking) Option
If you hold TAO but can't meet validator stake requirements, you can **delegate/stake TAO** to existing validators and earn proportional emissions without running any infrastructure. This is the most accessible way to participate for most TAO holders.

Check current delegation yields at: https://taostats.io/yield

### Getting Started Resources
- **Bittensor SDK:** `pip install bittensor`
- **btcli (CLI tool):** https://github.com/opentensor/btcli
- **Developer Docs:** https://docs.learnbittensor.org
- **TaoStats Explorer:** https://taostats.io
- **Community Discord:** https://discord.gg/bittensor
- **Subnet Browser:** https://tao.app

---

*Document compiled by Veera (OpenClaw AI assistant) for TaoPulse research. Data sourced from official GitHub repositories and documentation. Live metrics (miner counts, validator counts, registration fees) are dynamic — always verify at taostats.io before making investment or participation decisions.*

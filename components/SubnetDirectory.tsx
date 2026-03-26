"use client";

import { useState, useMemo } from "react";

export interface SubnetEntry {
  netuid: number;
  name: string;
  owner: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  miners: string;
  validators: string;
  minerCost: string;
  hardwareNote: string;
  taostatsUrl: string;
  githubUrl?: string;
  websiteUrl?: string;
  docsUrl?: string;
}

const SUBNETS: SubnetEntry[] = [
  {
    netuid: 1,
    name: "Apex",
    owner: "Macrocosmos",
    category: "Text AI",
    shortDesc: "Competition-based algorithmic intelligence — miners submit algorithms to win structured challenges.",
    fullDesc:
      "Subnet 1 (Apex) evolved from text prompting into a competition platform where miners submit Python algorithms via the Apex CLI. Active competitions include RL Battleship (reinforcement learning strategy) and IOTA Simulator (distributed training routing). Validators continuously evaluate submissions and distribute TAO to best-performing algorithms.",
    miners: "~128–192",
    validators: "~32–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU optional (RL training helps); ~$200–500/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-1/",
    githubUrl: "https://github.com/macrocosm-os/apex",
    docsUrl: "https://docs.macrocosmos.ai/subnets/subnet-1-apex",
    websiteUrl: "https://www.macrocosmos.ai/sn1",
  },
  {
    netuid: 2,
    name: "Omron",
    owner: "Inference Labs",
    category: "Other",
    shortDesc: "Zero-knowledge ML — miners generate cryptographic proofs alongside AI predictions.",
    fullDesc:
      "Omron builds the world's largest peer-to-peer Verified Intelligence network using zero-knowledge proofs (zk-ML). Miners convert AI models into ZK circuits and generate proofs alongside predictions, creating verifiable 'Proof-of-Inference'. More CPU-intensive than GPU, making it accessible to non-GPU miners while also incentivizing GPU optimization.",
    miners: "~100–180",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU-heavy; GPU beneficial; ~$200–800/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-2/",
    githubUrl: "https://github.com/inference-labs-inc/subnet-2",
    websiteUrl: "https://omron.ai",
  },
  {
    netuid: 3,
    name: "MyShell",
    owner: "MyShell",
    category: "Other",
    shortDesc: "Text-to-speech synthesis — miners serve high-quality voice AI models for natural speech output.",
    fullDesc:
      "Subnet 3 focuses on Text-to-Speech (TTS) synthesis and voice AI. Miners run high-quality voice synthesis models and respond to validator requests for audio generation. This subnet powers voice capabilities for AI applications requiring natural-sounding speech output.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU 16GB+ VRAM; ~$500–1,500/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-3/",
    websiteUrl: "https://myshell.ai",
  },
  {
    netuid: 4,
    name: "Targon",
    owner: "Manifold Labs",
    category: "Infrastructure",
    shortDesc: "Confidential AI inference using hardware TEEs — verifiable, encrypted GPU computation.",
    fullDesc:
      "Targon is an AI infrastructure platform using Confidential Compute and Protected PCIe technology. It leverages NVIDIA Confidential Compute and AMD SEV-SNP for hardware-enforced memory encryption, GPU Trusted Execution Environments (TEE), remote attestation, and end-to-end secure AI inference. High hardware barrier but high trust guarantees.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "A100/H100 with Confidential Compute; ~$2,000–5,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-4/",
    githubUrl: "https://github.com/manifold-inc/targon",
    docsUrl: "https://github.com/manifold-inc/targon/blob/main/docs/miner/miner.md",
  },
  {
    netuid: 5,
    name: "ImageSubnet",
    owner: "Community",
    category: "Image AI",
    shortDesc: "Text-to-image generation — miners compete to produce the highest quality Stable Diffusion outputs.",
    fullDesc:
      "Originally the ImageSubnet, SN5 incentivizes miners to serve Stable Diffusion models. Validators score images on aesthetic quality, prompt adherence, and diversity. Miners can run various diffusion models (SD, SDXL). Has evolved into a broader image generation competition platform.",
    miners: "~128–192",
    validators: "~32–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU 24GB+ VRAM (RTX 3090/4090, A100); ~$600–2,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-5/",
    githubUrl: "https://github.com/unconst/ImageSubnet",
  },
  {
    netuid: 6,
    name: "Nous Fine-Tuning",
    owner: "Nous Research",
    category: "Text AI",
    shortDesc: "Continuous LLM fine-tuning benchmark — miners publish fine-tuned models to Hugging Face daily.",
    fullDesc:
      "Subnet 6 rewards miners for fine-tuning LLMs with continuously generated synthetic data from Subnet 18 (Cortex.t). Miners fine-tune models, publish to Hugging Face, and validators evaluate them against daily SN18 data. First-ever continuous fine-tuning benchmark with cross-subnet data pipeline.",
    miners: "~128–192",
    validators: "~32–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "Multi-GPU cluster (A100/H100); ~$1,000–5,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-6/",
    githubUrl: "https://github.com/NousResearch/finetuning-subnet",
    docsUrl: "https://huggingface.co/spaces/NousResearch/finetuning_subnet_leaderboard",
  },
  {
    netuid: 7,
    name: "SubVortex",
    owner: "SubVortex Community",
    category: "Infrastructure",
    shortDesc: "Decentralized Subtensor nodes — miners run Bittensor blockchain RPC endpoints.",
    fullDesc:
      "SubVortex incentivizes running Bittensor network infrastructure — specifically decentralized Subtensor (blockchain) nodes. Miners provide subtensor RPC endpoints. Validators test availability, latency, and correctness. Critical for Bittensor's decentralization — low hardware requirements make this beginner-friendly.",
    miners: "~100–180",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "VPS 16GB RAM, 500GB+ SSD; ~$50–200/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-7/",
  },
  {
    netuid: 8,
    name: "Vanta Network",
    owner: "Taoshi",
    category: "Finance",
    shortDesc: "Decentralized trading signals — miners submit Forex, crypto, and equity predictions.",
    fullDesc:
      "Vanta Network (formerly Proprietary Trading Network) is one of the most competitive Bittensor subnets. Miners submit trading signals (LONG/SHORT/FLAT) for Forex, crypto, and equity pairs. Strict scoring: positive returns with <10% max drawdown required or miners are permanently eliminated. Anti-plagiarism system blacklists copied signals.",
    miners: "~128–192",
    validators: "~32–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU sufficient; research > compute; ~$100–500/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-8/",
    githubUrl: "https://github.com/taoshidev/vanta-network",
    websiteUrl: "https://taoshi.io",
    docsUrl: "https://dashboard.taoshi.io/",
  },
  {
    netuid: 9,
    name: "IOTA Pretraining",
    owner: "Macrocosmos",
    category: "Text AI",
    shortDesc: "Foundation model pretraining — miners continuously train and improve LLMs on Falcon Web data.",
    fullDesc:
      "IOTA incentivizes miners to train and continuously improve pretrained foundation models on the Falcon Refined Web dataset. Miners publish models to Hugging Face with on-chain metadata; validators evaluate loss on random Falcon batches. Most compute-intensive subnet — competitive miners need significant GPU clusters.",
    miners: "~128–192",
    validators: "~32–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "Multi-GPU / GPU cluster (A100×8 or H100×8); ~$5,000–20,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-9/",
    githubUrl: "https://github.com/macrocosm-os/pretraining",
    docsUrl: "https://docs.macrocosmos.ai/subnets/subnet-9-iota",
    websiteUrl: "https://www.macrocosmos.ai/sn9",
  },
  {
    netuid: 10,
    name: "Sturdy Finance",
    owner: "Sturdy Finance",
    category: "Finance",
    shortDesc: "DeFi yield optimization — miners predict best yield opportunities across DeFi protocols.",
    fullDesc:
      "Subnet 10 incentivizes miners to predict and optimize DeFi yield allocations. Miners submit predictions about the best yield opportunities across protocols; validators compare against actual on-chain outcomes. Creates a decentralized financial intelligence network usable by yield aggregators to optimize capital allocation.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU + blockchain API access; ~$100–300/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-10/",
    githubUrl: "https://github.com/Sturdy-subnet/sturdy-subnet",
    websiteUrl: "https://sturdy.finance",
  },
  {
    netuid: 11,
    name: "Dippy",
    owner: "Dippy",
    category: "Text AI",
    shortDesc: "Character AI & roleplay — miners run the best LLMs for companionship and roleplay scenarios.",
    fullDesc:
      "Subnet 11 incentivizes miners to run the best roleplay and character-based language models. Validators send roleplay prompts and evaluate responses for quality, character consistency, safety, and engagement. Powers Dippy's consumer AI companion applications.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU 24GB+ for competitive LLMs; ~$500–2,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-11/",
    githubUrl: "https://github.com/impel-intelligence/dippy-bittensor-subnet",
    websiteUrl: "https://dippy.ai",
  },
  {
    netuid: 13,
    name: "Data Universe",
    owner: "Macrocosmos",
    category: "Data",
    shortDesc: "World's largest open-source social media dataset — miners scrape X, Reddit, and YouTube.",
    fullDesc:
      "Data Universe is the world's largest open-source social media dataset, storing decentralized data from X (Twitter), Reddit, and YouTube transcripts. Supports up to 50 petabytes across 200 miners. Products include Gravity (no-code scraping tool) and Mission Commander (AI query chatbot). Business-ready with real enterprise use cases.",
    miners: "~128–200",
    validators: "~32–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU + 250GB–10TB storage; ~$100–400/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-13/",
    githubUrl: "https://github.com/macrocosm-os/data-universe",
    docsUrl: "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe",
    websiteUrl: "https://app.macrocosmos.ai/gravity",
  },
  {
    netuid: 14,
    name: "Palaidn",
    owner: "Palaidn",
    category: "Other",
    shortDesc: "Decentralized cybersecurity intelligence — miners detect threats, fraud, and on-chain malicious activity.",
    fullDesc:
      "Palaidn creates a decentralized cybersecurity intelligence network. Miners analyze data for threats, fraud, suspicious transactions, and security vulnerabilities. The subnet incentivizes development of security models that identify and flag malicious on-chain and off-chain activity.",
    miners: "~80–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU + threat intelligence APIs; ~$100–500/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-14/",
    githubUrl: "https://github.com/palaidn/palaidn_subnet",
    websiteUrl: "https://palaidn.com",
  },
  {
    netuid: 15,
    name: "Blockchain Insights",
    owner: "Blockchain Insights Team",
    category: "Data",
    shortDesc: "On-chain analytics — miners analyze blockchain data for transaction patterns and whale movements.",
    fullDesc:
      "Subnet 15 incentivizes miners to provide blockchain data analytics and predictions. Miners analyze on-chain data from multiple blockchains and produce insights about transaction patterns, whale movements, protocol metrics, and price predictions. Validators verify quality and accuracy of insights.",
    miners: "~80–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU + blockchain node or API access; ~$100–500/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-15/",
    githubUrl: "https://github.com/blockchain-insights/blockchain-data-subnet",
  },
  {
    netuid: 17,
    name: "404-Gen",
    owner: "404 Labs",
    category: "Image AI",
    shortDesc: "AI-generated 3D assets — miners produce game-ready 3D objects from text prompts.",
    fullDesc:
      "404-Gen aims to democratize 3D content creation by incentivizing miners to generate high-quality 3D assets from text prompts. LLMs auto-generate prompts across 30 categories (gaming assets, etc.). Validators score on 3D quality and prompt adherence. Vision: enable entire games with AI-generated assets, dialogue, and sound at runtime.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "High-VRAM GPU (40–80GB preferred); ~$1,000–4,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-17/",
    githubUrl: "https://github.com/404-Repo/three-gen-subnet",
    websiteUrl: "https://404.xyz",
    docsUrl: "https://dashboard.404.xyz/d/main/404-gen/",
  },
  {
    netuid: 18,
    name: "Cortex.t",
    owner: "Corcel",
    category: "Text AI",
    shortDesc: "LLM API access & synthetic data — miners serve large language models and power the Corcel API.",
    fullDesc:
      "Subnet 18 provides AI API access to developers. Miners run LLMs and respond to inference requests; validators score quality, latency, and diversity. Critical cross-subnet role: SN18 generates synthetic training data consumed by Subnet 6 (Nous Fine-Tuning). Powers the Corcel API (corcel.io), a commercial LLM API service.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU 24GB+ for competitive LLMs; ~$500–2,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-18/",
    websiteUrl: "https://corcel.io",
  },
  {
    netuid: 19,
    name: "Dojo",
    owner: "Tensorplex Labs",
    category: "Other",
    shortDesc: "Decentralized GAN — miners compete as AI generators and discriminators in a zero-sum incentive model.",
    fullDesc:
      "Dojo (V2) transforms the traditional GAN concept into a competitive, decentralized Bittensor subnet. Miners act as both generators and discriminators, competing to produce and identify highest-quality outputs. Zero-sum incentive model forces continuous improvement. Unique: miners can participate with just a browser wallet at dojo.network — no code required.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "Browser wallet (Dojo); GPU for competitive generation; ~$0–1,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-19/",
    githubUrl: "https://github.com/tensorplex-labs/dojo",
    websiteUrl: "https://dojo.network",
    docsUrl: "https://docs.tensorplex.ai",
  },
  {
    netuid: 21,
    name: "Any Compute",
    owner: "Any Compute",
    category: "Infrastructure",
    shortDesc: "Decentralized GPU marketplace — miners rent out GPU compute; validators verify availability and performance.",
    fullDesc:
      "Subnet 21 creates a decentralized GPU compute marketplace. Miners rent out GPU capacity; validators verify availability, performance, and reliability. Directly competes with centralized cloud providers by creating a trustless, verifiable compute market on Bittensor.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU node (consumer or data center); ~$200–3,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-21/",
    websiteUrl: "https://anycompute.io",
  },
  {
    netuid: 22,
    name: "Desearch",
    owner: "Desearch",
    category: "Data",
    shortDesc: "AI-powered decentralized search — aggregates X, Reddit, Arxiv, and web with no central control.",
    fullDesc:
      "Desearch is an AI-powered decentralized search engine providing unbiased, verifiable results. Aggregates data from X (Twitter), Reddit, Arxiv, and general web. Features real-time access to diverse sources, sentiment and metadata analysis, and no central entity controlling results. API available for developers.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU + external API keys (X, Reddit); Redis; ~$200–600/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-22/",
    githubUrl: "https://github.com/Desearch-ai/subnet-22",
    websiteUrl: "https://desearch.ai",
  },
  {
    netuid: 23,
    name: "NicheImage",
    owner: "SocialTensor",
    category: "Image AI",
    shortDesc: "Volume-based decentralized image generation across multiple model categories.",
    fullDesc:
      "NicheImage runs a decentralized image generation network with volume-based incentives. Miners commit to specific model types and generation volumes across categories (GoJourney, FluxSchnell, OpenGeneral, etc.). Unique reward formula combines category score, time penalty, and volume scale. Supports thousands of generations per minute.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU 24GB+ (RTX 3090/4090, A100); ~$600–2,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-23/",
    githubUrl: "https://github.com/SocialTensor/SocialTensorSubnet",
    websiteUrl: "https://studio.nichetensor.com/",
    docsUrl: "https://docs.nichetensor.com",
  },
  {
    netuid: 25,
    name: "Distributed Training",
    owner: "Hivetrain",
    category: "Text AI",
    shortDesc: "Federated LLM training — miners contribute weight-deltas; an averager merges the best into new models.",
    fullDesc:
      "Subnet 25 implements distributed deep learning. Miners train weight-deltas (differences from a base model), upload to HuggingFace, and an Averager node aggregates the best into an improved base model. Validators evaluate loss reduction. This decentralized federated learning cycle continuously improves the model.",
    miners: "~80–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU (A100 preferred); HuggingFace account; ~$500–3,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-25/",
    githubUrl: "https://github.com/bit-current/DistributedTraining",
  },
  {
    netuid: 27,
    name: "Compute Subnet",
    owner: "Neural Internet",
    category: "Infrastructure",
    shortDesc: "Decentralized GPU-as-a-service — broad compute marketplace benchmarking performance and uptime.",
    fullDesc:
      "Subnet 27 provides a decentralized compute marketplace where miners offer GPU and CPU resources. Validators benchmark miner machines for performance, reliability, uptime, and pricing. Broader than SN21 — accepts various compute types and hardware. End-users access decentralized compute through the subnet.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "Any GPU/CPU with Docker; ~$100–3,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-27/",
    githubUrl: "https://github.com/neuralinternet/compute-subnet",
  },
  {
    netuid: 28,
    name: "Foundry S&P 500",
    owner: "Foundry Digital Services",
    category: "Finance",
    shortDesc: "S&P 500 price oracle — miners publish open-source neural net forecasts for stock market prices.",
    fullDesc:
      "Subnet 28 creates an S&P 500 price oracle incentivizing accurate short-term price forecasts during market hours. Miners use neural network architectures and must open-source both models and input data on HuggingFace. Scored on directional accuracy and mean absolute error vs. actual prices.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "CPU + market data APIs; models on HuggingFace; ~$100–500/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-28/",
    githubUrl: "https://github.com/foundryservices/snpOracle",
    docsUrl: "https://app.yumaai.com/",
  },
  {
    netuid: 30,
    name: "Wombo Dream",
    owner: "WOMBO (w.ai)",
    category: "Image AI",
    shortDesc: "Social media AI content — 200M+ app users; miners generate compelling images for viral distribution.",
    fullDesc:
      "Subnet 30 powers WOMBO's decentralized content generation engine. WOMBO has 200M+ downloads and two #1-ranked AI apps globally. Scoring based on diffusion step similarity, requests per second, and success rate. Miners behind load balancers earn more. Plans to tie emissions to social media performance.",
    miners: "~100–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "GPU 24GB+ VRAM; Redis; load balancer optional; ~$600–2,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-30/",
    githubUrl: "https://github.com/womboai/wombo-bittensor-subnet",
    websiteUrl: "https://w.ai",
  },
  {
    netuid: 34,
    name: "BitMind GAS",
    owner: "BitMind AI",
    category: "Other",
    shortDesc: "Deepfake detection — an adversarial GAN subnet where generators and discriminators compete continuously.",
    fullDesc:
      "BitMind GAS (Generative Adversarial Subnet) features two miner tracks: Discriminative (submit AI-content detection models — no GPU needed, evaluated on cloud) and Generative (run servers creating synthetic media to fool discriminators). Three modalities: image, video, and audio detection. Adversarial loop continuously improves both detection and generation.",
    miners: "~80–192",
    validators: "~20–64",
    minerCost: "~0.1–2 τ",
    hardwareNote: "Discriminative: no GPU required; Generative: GPU server ~$500–2,000/month",
    taostatsUrl: "https://taostats.io/subnets/netuid-34/",
    githubUrl: "https://github.com/BitMind-AI/bitmind-subnet",
    docsUrl: "https://deepwiki.com/BitMind-AI/bitmind-subnet",
  },
];

const CATEGORIES = ["All", "Text AI", "Image AI", "Data", "Finance", "Infrastructure", "Other"] as const;

type Category = (typeof CATEGORIES)[number];

type SortKey = "netuid" | "name" | "miners";

function parseMinerCount(s: string): number {
  const match = s.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Text AI": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Image AI": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Data: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Finance: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Infrastructure: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function SubnetDirectory() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [sortKey, setSortKey] = useState<SortKey>("netuid");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = [...SUBNETS];

    if (activeCategory !== "All") {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDesc.toLowerCase().includes(q) ||
          s.owner.toLowerCase().includes(q) ||
          String(s.netuid).includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortKey === "netuid") return a.netuid - b.netuid;
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "miners") return parseMinerCount(b.miners) - parseMinerCount(a.miners);
      return 0;
    });

    return list;
  }, [search, activeCategory, sortKey]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search subnets by name, description, or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f1623] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-3 py-2.5 bg-[#0f1623] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 shrink-0"
          >
            <option value="netuid">Sort by Subnet #</option>
            <option value="name">Sort by Name</option>
            <option value="miners">Sort by Miner Count</option>
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {SUBNETS.filter((s) => s.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-600 mb-4">
        {filtered.length} subnet{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        {search.trim() ? ` matching "${search}"` : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No subnets match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((subnet) => {
            const isExpanded = expandedId === subnet.netuid;
            const catColor = CATEGORY_COLORS[subnet.category] ?? CATEGORY_COLORS["Other"];

            return (
              <div
                key={subnet.netuid}
                className={`bg-[#0f1623] rounded-xl border transition-all duration-200 ${
                  isExpanded ? "border-purple-500/40" : "border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpandedId(isExpanded ? null : subnet.netuid)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-600/15 border border-purple-600/30 text-purple-400 text-xs font-bold shrink-0">
                        {subnet.netuid}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white leading-tight">{subnet.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{subnet.owner}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${catColor}`}
                    >
                      {subnet.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{subnet.shortDesc}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-lg px-2.5 py-2">
                      <p className="text-[10px] text-gray-500 mb-0.5">Miners</p>
                      <p className="text-xs font-semibold text-white">{subnet.miners}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-2.5 py-2">
                      <p className="text-[10px] text-gray-500 mb-0.5">Validators</p>
                      <p className="text-xs font-semibold text-white">{subnet.validators}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-2.5 py-2">
                      <p className="text-[10px] text-gray-500 mb-0.5">Reg. Cost</p>
                      <p className="text-xs font-semibold text-purple-400">{subnet.minerCost}</p>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="flex items-center gap-1 text-[10px] text-gray-600">
                    <svg
                      className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {isExpanded ? "Collapse" : "View Details"}
                  </div>
                </button>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{subnet.fullDesc}</p>

                    <div className="bg-white/5 rounded-lg px-3 py-2.5 mb-4">
                      <p className="text-[10px] text-gray-500 mb-0.5">Miner Hardware</p>
                      <p className="text-xs text-gray-300">{subnet.hardwareNote}</p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={subnet.taostatsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-600/15 border border-purple-600/30 text-purple-400 text-xs font-medium hover:bg-purple-600/25 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Block Explorer
                      </a>
                      {subnet.githubUrl && (
                        <a
                          href={subnet.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                          GitHub
                        </a>
                      )}
                      {subnet.websiteUrl && (
                        <a
                          href={subnet.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                            />
                          </svg>
                          Website
                        </a>
                      )}
                      {subnet.docsUrl && (
                        <a
                          href={subnet.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Docs
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

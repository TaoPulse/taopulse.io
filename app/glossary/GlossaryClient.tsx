"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Term {
  term: string;
  letter: string;
  definition: string;
  link?: { href: string; label: string };
}

const TERMS: Term[] = [
  {
    term: "Alpha Token",
    letter: "A",
    definition:
      "A subnet-specific token introduced with Dynamic TAO (dTAO). When you stake TAO directly into a subnet's liquidity pool, you receive that subnet's alpha token in return. Each subnet has its own alpha token with its own price.",
    link: { href: "/dtao", label: "Learn about dTAO" },
  },
  {
    term: "Block",
    letter: "B",
    definition:
      "The basic unit of time on the Bittensor blockchain. A new block is produced approximately every 12 seconds. Each block adds ~0.5 TAO in new emissions to the network (after the first halving).",
    link: { href: "/emissions", label: "How emissions work" },
  },
  {
    term: "btcli",
    letter: "B",
    definition:
      "The official Bittensor command-line interface (CLI). It lets you manage wallets, stake TAO, run validators or miners, and interact with the network directly from your terminal.",
    link: { href: "/staking", label: "Staking guide" },
  },
  {
    term: "Coldkey",
    letter: "C",
    definition:
      "Your main Bittensor wallet key — the one that holds your TAO and controls your funds. The coldkey is meant to be stored offline and never exposed. Think of it as your bank account number combined with your vault key. Never share your coldkey seed phrase.",
  },
  {
    term: "dTAO",
    letter: "D",
    definition:
      "Short for Dynamic TAO. A protocol upgrade launched in late 2024 that introduced subnet-specific alpha tokens and a new liquidity pool staking model. dTAO lets stakers bet directly on individual subnets, with higher potential rewards and higher risk.",
    link: { href: "/dtao", label: "What is dTAO?" },
  },
  {
    term: "Emission",
    letter: "E",
    definition:
      "The process of minting new TAO tokens and distributing them across the network. The Bittensor network emits ~0.5 TAO per block (~3,600 TAO/day after the first halving). Emissions flow through subnets to validators, miners, and ultimately stakers.",
    link: { href: "/emissions", label: "How emissions work" },
  },
  {
    term: "Halving",
    letter: "H",
    definition:
      "An event where the daily TAO emission rate is cut in half. The first halving occurred in December 2025 (from ~7,200 to ~3,600 TAO/day). The next halving is expected around December 2029. TAO has a maximum supply of 21 million, like Bitcoin.",
    link: { href: "/halving", label: "Halving countdown" },
  },
  {
    term: "Hotkey",
    letter: "H",
    definition:
      "A secondary key in the Bittensor wallet system, used for day-to-day operations like staking, running miners, or running validators. The hotkey is associated with your coldkey but has limited permissions. Validators and miners use hotkeys to operate without exposing their coldkey.",
  },
  {
    term: "Miner",
    letter: "M",
    definition:
      "A network participant who performs the actual AI work within a subnet — for example, running an inference model, generating images, or producing forecasts. Miners compete to produce the best outputs and earn 41% of their subnet's emissions.",
  },
  {
    term: "Nominator",
    letter: "N",
    definition:
      "Another word for a delegator — someone who stakes their TAO to a validator without running validator infrastructure themselves. Nominators earn a share of validator emissions proportional to their stake, minus the validator's take.",
    link: { href: "/staking", label: "How to stake" },
  },
  {
    term: "Root Subnet",
    letter: "R",
    definition:
      "Also called SN0. The root subnet was the original staking layer in classic Bittensor, where validators at the top level voted on emission allocations for all subnets. Under dTAO and Taoflow (active since Nov 2025), the root subnet's role in emission allocation has been replaced by market-driven staking flows.",
  },
  {
    term: "Subnet",
    letter: "S",
    definition:
      "An independent AI task network within Bittensor. Each subnet defines a specific AI task (e.g., image generation, text prediction, weather forecasting), has its own miners and validators, and competes for a share of TAO emissions. Bittensor has 128+ active subnets.",
    link: { href: "/subnets", label: "Explore subnets" },
  },
  {
    term: "Subnet Creator",
    letter: "S",
    definition:
      "The person or team that launched a subnet. Subnet creators earn 18% of their subnet's emissions as a royalty for building and maintaining the subnet's incentive mechanism.",
  },
  {
    term: "Subtensor",
    letter: "S",
    definition:
      "The blockchain that powers Bittensor — a Substrate-based (Polkadot ecosystem) blockchain where all TAO transactions, stake records, and validator/miner registrations are recorded on-chain.",
  },
  {
    term: "TAO (τ)",
    letter: "T",
    definition:
      "The native token of the Bittensor network. TAO is used for staking, paying subnet registration fees, and rewarding validators and miners. It has a maximum supply of 21 million, with emissions halving approximately every 4 years.",
    link: { href: "/what-is-tao", label: "What is TAO?" },
  },
  {
    term: "Taoflow",
    letter: "T",
    definition:
      "The emission allocation model active since November 2025. Under Taoflow, each subnet's share of daily TAO emissions is determined by its net staking inflows over the past ~87 days (an exponential moving average). Subnets with net outflows receive zero emissions.",
    link: { href: "/emissions", label: "How emissions work" },
  },
  {
    term: "Tempo",
    letter: "T",
    definition:
      "The distribution cycle within a subnet. One tempo equals ~360 blocks, which is approximately 72 minutes. At the end of each tempo, Yuma Consensus runs and distributes accumulated emissions to validators and miners.",
    link: { href: "/emissions", label: "How emissions work" },
  },
  {
    term: "Validator",
    letter: "V",
    definition:
      "A network participant who evaluates miner outputs and scores them using Yuma Consensus. Validators earn 41% of their subnet's emissions and distribute a cut to stakers (nominators) who delegate to them, minus their take.",
    link: { href: "/staking", label: "Choose a validator" },
  },
  {
    term: "Validator Take",
    letter: "V",
    definition:
      "The percentage of delegated emissions a validator keeps for themselves before distributing the rest to their stakers. The default take is 18%. A validator with a lower take passes more rewards on to delegators.",
    link: { href: "/staking", label: "Staking guide" },
  },
  {
    term: "Yuma Consensus",
    letter: "Y",
    definition:
      "The scoring mechanism used by validators in each subnet to evaluate miner performance. Named after Yuma, Arizona. It runs once per tempo and determines how emissions are split among miners based on the consensus of validator scores.",
    link: { href: "/emissions", label: "How emissions work" },
  },
];

const ALL_LETTERS = [...new Set(TERMS.map((t) => t.letter))].sort();

export default function GlossaryClient() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TERMS.filter((t) => {
      const matchesSearch = !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q);
      const matchesLetter = !activeLetter || t.letter === activeLetter;
      return matchesSearch && matchesLetter;
    });
  }, [search, activeLetter]);

  return (
    <div className="space-y-6">
      {/* Search + filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search terms…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveLetter(null);
          }}
          className="w-full rounded-lg border border-white/10 bg-[#0f1623] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />

        {/* Letter tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setActiveLetter(null); setSearch(""); }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              !activeLetter && !search
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            All
          </button>
          {ALL_LETTERS.map((letter) => (
            <button
              key={letter}
              onClick={() => { setActiveLetter(letter); setSearch(""); }}
              className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                activeLetter === letter
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {filtered.length} term{filtered.length !== 1 ? "s" : ""}
        {activeLetter ? ` starting with "${activeLetter}"` : search ? ` matching "${search}"` : " total"}
      </p>

      {/* Terms list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0f1623] p-8 text-center text-sm text-gray-500">
          No terms found. Try a different search.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((term) => (
            <div
              key={term.term}
              id={`term-${term.term.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
              className="rounded-xl border border-white/10 bg-[#0f1623] p-5 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-purple-600/20 text-purple-400 text-xs font-bold shrink-0">
                    {term.letter}
                  </span>
                  <h3 className="text-sm font-bold text-white">{term.term}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{term.definition}</p>
              {term.link && (
                <Link
                  href={term.link.href}
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {term.link.label}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

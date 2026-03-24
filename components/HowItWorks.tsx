"use client";

import { useState } from "react";

const steps = [
  {
    step: 1,
    title: "Anyone creates a subnet",
    body: "A specialized AI competition — e.g. \"build the best trading signals\"",
    detail: "Subnet owners stake TAO to register a new subnet and define its task — what kind of AI outputs miners must produce. Anyone can create a subnet: researchers, companies, or individuals. The subnet owner sets the evaluation criteria and earns a share of the emissions their subnet generates. Popular subnets attract more miners and validators, driving up quality.",
  },
  {
    step: 2,
    title: "Miners compete",
    body: "Running AI models to produce the best outputs for that subnet",
    detail: "Miners are the workers of the network. They run AI models on their own hardware and respond to requests from validators. To join a subnet, miners pay a registration fee in TAO. If their performance drops below the subnet's threshold, they get deregistered and lose their spot — keeping the network competitive. Anyone can be a miner, but you need capital (TAO) and compute (usually a GPU) to be effective.",
  },
  {
    step: 3,
    title: "Validators score miners",
    body: "Fairly and objectively evaluating performance across the network",
    detail: "Validators stake TAO to participate in scoring. They query miners with challenges and evaluate the quality of responses based on the subnet's rules. Their stake gives them voting power — the more TAO staked, the more weight their scores carry. Validators are incentivized to score accurately: dishonest validators lose their stake over time through the network's consensus mechanism.",
  },
  {
    step: 4,
    title: "TAO flows to winners",
    body: "Better AI = more TAO rewards. The incentive drives quality.",
    detail: "Every block, newly minted TAO is distributed across all active subnets based on how much stake they attract. Within each subnet, TAO flows to miners and validators proportionally to their scores. The best-performing miners earn the most. This creates a self-reinforcing loop: better AI → more TAO → more resources to improve AI further.",
  },
  {
    step: 5,
    title: "The market decides value",
    body: "Subnets with useful AI get more TAO allocated to them",
    detail: "TAO holders can stake their tokens toward any subnet they believe in — effectively voting with capital on which AI tasks deserve more resources. Subnets producing genuinely useful outputs attract more stake, which means more TAO emissions, which attracts better miners. It's a decentralized market for AI utility — no central committee decides what matters, the market does.",
  },
];

export default function HowItWorks() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const isOpen = open === step.step;
        return (
          <button
            key={step.step}
            onClick={() => setOpen(isOpen ? null : step.step)}
            className="w-full text-left flex items-start gap-4 bg-[#0f1623] rounded-xl border border-white/10 p-5 hover:border-purple-600/20 transition-colors group"
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-sm font-bold mt-0.5">
              {step.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <svg
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 mt-1">{step.body}</p>
              {isOpen && (
                <p className="text-sm text-gray-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
                  {step.detail}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

function getSteps(activeSubnets: number | null) {
  const subnetCount = activeSubnets ? `${activeSubnets}+` : "129+";
  return [
  {
    step: 1,
    title: "Anyone creates a subnet",
    body: "A specialized AI competition — e.g. \"build the best trading signals\"",
    detail: `A subnet is a specialized AI marketplace with one job. A creator registers it by locking TAO as collateral, then defines what miners must produce — could be financial predictions, protein folding, text generation, anything. The creator earns 18% of all TAO emissions their subnet generates, so there's strong incentive to build subnets the network finds valuable. There are currently ${subnetCount} active subnets on the network.`,
  },
  {
    step: 2,
    title: "Miners compete",
    body: "Running AI models to produce the best outputs for that subnet",
    detail: "Miners are AI providers. They register on a subnet by paying a fee (burned TAO), then run models that respond to validator queries. Each subnet can hold a limited number of miners — if you underperform, you get replaced by someone better. You need: a GPU (or cloud compute), TAO to register, and a model good enough to beat the competition. The barrier is real but the rewards scale with quality.",
  },
  {
    step: 3,
    title: "Validators score miners",
    body: "Fairly and objectively evaluating performance across the network",
    detail: "Validators are the judges. They query miners, evaluate responses against the subnet's scoring rules, and submit scores to the chain. To become a validator you stake TAO — your stake determines how much weight your votes carry. The network cross-checks validators against each other; if you game scores to favor yourself, your weight gets slashed. Honest scoring = more TAO earned.",
  },
  {
    step: 4,
    title: "TAO flows to winners",
    body: "Better AI = more TAO rewards. The incentive drives quality.",
    detail: "Every ~12 seconds a new block is produced. TAO emissions split: 41% to miners, 41% to validators, 18% to the subnet owner. Your share depends on your rank — top miners and validators earn exponentially more. Poor performers earn near zero. This creates constant pressure to improve, keeping the network at the frontier of AI quality.",
  },
  {
    step: 5,
    title: "The market decides value",
    body: "Subnets with useful AI get more TAO allocated to them",
    detail: "TAO holders can delegate their stake to any subnet — essentially betting that subnet produces useful AI. More delegated stake = more TAO emissions allocated to that subnet = more miner competition = better outputs. It's a capital market for AI utility. No committee, no governance vote — just money flowing toward what works.",
  },
];}

export default function HowItWorks({ activeSubnets }: { activeSubnets: number | null }) {
  const [open, setOpen] = useState<number | null>(null);
  const steps = getSteps(activeSubnets);

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

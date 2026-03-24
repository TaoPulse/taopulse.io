import StakingCalculator from "@/components/StakingCalculator";
import StakingMethodTabs from "@/components/StakingMethodTabs";
import TableOfContents from "@/components/TableOfContents";

export const metadata = {
  title: "How to Stake TAO | TaoPulse",
  description:
    "Complete guide to staking TAO on the Bittensor network — wallet apps, CLI, classic vs dTAO staking, emission explained, risk table, and staking calculator.",
};

interface Validator {
  name: string;
  fee: string;
  apr: string;
  stake: string;
  nominators: number;
  hotkey: string;
}

const FALLBACK_VALIDATORS: Validator[] = [
  { name: "Taostats", fee: "9.0%", apr: "17.1%", stake: "767,381", nominators: 6691, hotkey: "" },
  { name: "Foundry", fee: "0.0%", apr: "17.1%", stake: "500,000", nominators: 3000, hotkey: "" },
  { name: "Opentensor", fee: "18.0%", apr: "15.0%", stake: "312,000", nominators: 2500, hotkey: "" },
];

async function fetchValidators(): Promise<Validator[]> {
  try {
    const apiKey = process.env.TAOSTATS_API_KEY;
    if (!apiKey) return FALLBACK_VALIDATORS;
    const res = await fetch("https://api.taostats.io/api/validator/latest/v1?limit=20", {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) return FALLBACK_VALIDATORS;
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).slice(0, 10).map((v: any) => ({
      name: v.name || "Unknown",
      fee: `${(parseFloat(v.take) * 100).toFixed(1)}%`,
      apr: `${(parseFloat(v.apr) * 100).toFixed(1)}%`,
      stake: (parseFloat(v.stake) / 1e9).toLocaleString("en-US", { maximumFractionDigits: 0 }),
      nominators: v.nominators as number,
      hotkey: v.hotkey?.ss58 ?? "",
    }));
  } catch {
    return FALLBACK_VALIDATORS;
  }
}

const FAQ = [
  {
    q: "Will my TAO convert to another token when I stake?",
    a: "In classic root staking (this guide): No. Your TAO stays as TAO and rewards are paid in TAO. In dTAO subnet staking (advanced): Yes, your TAO converts to the subnet token. This guide covers classic staking.",
  },
  {
    q: "What is the APY for staking?",
    a: "Estimated 15–20% APY in TAO for classic root staking, depending on network conditions. This is not guaranteed and changes with network activity.",
  },
  {
    q: "Can I lose my staked TAO?",
    a: "In classic root staking: extremely unlikely. Bittensor has no slashing. Main risks are a validator going offline (you miss rewards temporarily) or losing your wallet seed phrase. In dTAO subnet staking: yes, if the subnet token depreciates vs TAO.",
  },
  {
    q: "How long until I earn rewards?",
    a: "Rewards accumulate every block (~12 seconds). Check btcli stake show daily.",
  },
  {
    q: "What is the minimum stake?",
    a: "0.1 TAO minimum, but more stake = more proportional rewards.",
  },
  {
    q: "Is my TAO locked?",
    a: "No. You can unstake at any time with no lock-up period.",
  },
  {
    q: "What if my validator goes offline?",
    a: "You stop earning temporarily. Switch to another validator.",
  },
  {
    q: "What taxes do I owe?",
    a: "Staking rewards may be taxable income. Consult a tax professional.",
  },
];

const TOC_SECTIONS = [
  { id: "what-is-staking", label: "What is Staking" },
  { id: "types-of-staking", label: "Types of Staking" },
  { id: "risk-table", label: "Risks" },
  { id: "how-to-stake", label: "How to Stake" },
  { id: "validators", label: "Choose a Validator" },
  { id: "unstaking", label: "Unstaking" },
  { id: "calculator", label: "Calculator" },
  { id: "faq", label: "FAQ" },
];

function DangerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 leading-relaxed">
      {children}
    </div>
  );
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 leading-relaxed">
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-2 rounded-lg bg-[#080d14] border border-white/10 px-4 py-3 text-sm font-mono text-green-300 overflow-x-auto whitespace-pre-wrap break-all">
      {children}
    </pre>
  );
}

export default async function StakingPage() {
  const validators = await fetchValidators();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-12">
        <div className="flex-1 min-w-0 max-w-3xl">
          <div className="space-y-14">

            {/* Hero */}
            <section className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Beginner Guide
              </div>
              <h1 className="text-3xl font-bold text-white">How to Stake TAO</h1>
              <p className="text-gray-400 leading-relaxed">
                This guide walks you through staking TAO on the Bittensor network from scratch.
                It covers wallet apps (no terminal needed) and the command-line method for advanced users.
              </p>
              <DangerBox>
                ⚠️ <strong>Never share your seed phrase or private key with anyone.</strong> TaoPulse will never ask for this. Anyone who asks for it is trying to steal your tokens.
              </DangerBox>
            </section>

            {/* What is Staking? */}
            <section id="what-is-staking" className="space-y-4">
              <h2 className="text-xl font-bold text-white">What is Staking?</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  Staking TAO means lending your tokens to a validator in exchange for a share of network rewards.
                  Think of it like a savings account — your TAO stays yours, earns yield, and you can withdraw at any time.
                  When you stake, you also vote for which AI subnets get funded.
                </p>
                <div>
                  <p className="font-semibold text-white mb-2">What is Emission?</p>
                  <p>
                    The Bittensor network emits approximately <strong className="text-white">7,200 TAO per day</strong> across all subnets.
                    Each subnet gets a share proportional to how much stake it has attracted. A subnet with 4.3% emission
                    receives about 310 TAO per day (roughly $86,000/day at $279/TAO). Validators and miners split those
                    rewards — stakers who delegated to those validators earn a cut.
                  </p>
                </div>
              </div>
            </section>

            {/* Two Types of Staking */}
            <section id="types-of-staking" className="space-y-5">
              <h2 className="text-xl font-bold text-white">Two Types of Staking</h2>

              {/* Classic Root Staking */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">Recommended for Beginners</span>
                </div>
                <h3 className="text-base font-semibold text-white">Classic Root Staking</h3>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Your TAO stays as TAO — it does <strong className="text-white">NOT</strong> convert to any other token</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> You earn TAO rewards (estimated 15–20% APY)</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Simplest, lowest risk</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Bittensor has <strong className="text-white">NO SLASHING</strong> — your TAO cannot be penalized if a validator misbehaves</li>
                </ul>
              </div>

              {/* dTAO Subnet Staking */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-wider">Advanced</span>
                </div>
                <h3 className="text-base font-semibold text-white">dTAO Subnet Staking</h3>
                <p className="text-sm text-gray-400">
                  This is a newer feature (Dynamic TAO). When you stake directly into a specific subnet:
                </p>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span> Your TAO is <strong className="text-white">CONVERTED</strong> to that subnet token (each subnet has its own token)</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span> You earn rewards in the subnet token, not TAO</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span> The subnet token price goes up or down vs TAO</li>
                </ul>

                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Example: How You Can LOSE TAO</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Stake 10 TAO → receive 200 SN8 tokens at 0.05 TAO/token</li>
                      <li>• Earn 20 more SN8 tokens as rewards (total: 220)</li>
                      <li>• SN8 drops from 0.05 → 0.03 TAO</li>
                      <li className="text-red-300 font-semibold">• Unstake: 220 × 0.03 = 6.6 TAO (lost 3.4 TAO)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Example: How You Can WIN</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Same start: 200 SN8 tokens</li>
                      <li>• Earn 20 more SN8 tokens (total: 220)</li>
                      <li>• SN8 rises from 0.05 → 0.10 TAO</li>
                      <li className="text-emerald-300 font-semibold">• Unstake: 220 × 0.10 = 22 TAO (doubled)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-4 py-3 text-left font-semibold text-gray-400">Feature</th>
                      <th className="px-4 py-3 text-center font-semibold text-emerald-400">Classic Root Staking</th>
                      <th className="px-4 py-3 text-center font-semibold text-amber-400">dTAO Subnet Staking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-400">Stake stays as</td>
                      <td className="px-4 py-3 text-center text-emerald-300">TAO</td>
                      <td className="px-4 py-3 text-center text-amber-300">Subnet token</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-400">Rewards paid in</td>
                      <td className="px-4 py-3 text-center text-emerald-300">TAO</td>
                      <td className="px-4 py-3 text-center text-amber-300">Subnet token</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-400">Price risk</td>
                      <td className="px-4 py-3 text-center text-emerald-300">TAO price only</td>
                      <td className="px-4 py-3 text-center text-amber-300">TAO + subnet token price</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-400">Complexity</td>
                      <td className="px-4 py-3 text-center text-emerald-300">Simple</td>
                      <td className="px-4 py-3 text-center text-amber-300">Complex</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-400">Recommended for</td>
                      <td className="px-4 py-3 text-center text-emerald-300">Beginners</td>
                      <td className="px-4 py-3 text-center text-amber-300">Advanced DeFi users</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Risk Table */}
            <section id="risk-table" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Risk Overview</h2>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-4 py-3 text-left font-semibold text-gray-400">Risk</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-400">Severity</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-400">Likelihood</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-400 hidden sm:table-cell">Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">Validator goes offline</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">Low</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400">Medium</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">Missed rewards only — TAO safe. Switch validators.</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">High validator fee</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">Low</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">Low</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">Pick validators with 0–9% fee.</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">Subnet token loses value</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400">High (dTAO)</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400">Medium</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">Use classic root staking to avoid this risk entirely.</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">Lost wallet seed phrase</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-600/20 text-red-300 font-bold">Catastrophic</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-400">Your responsibility</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">Write seed phrase on paper, store offline. No recovery possible.</td>
                    </tr>
                    <tr className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">Network-level attack</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">Very Low</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">Very Low</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">Bittensor is a decentralized network with no single point of failure.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Before You Start */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">Before You Start</h2>
              <p className="text-sm text-gray-400">Make sure you have everything in place before staking:</p>
              <ul className="space-y-2">
                {[
                  "TAO tokens in a wallet you control",
                  "A compatible wallet app (Wallet App tab — recommended) or Bittensor CLI (CLI tab — advanced)",
                  "At least 0.1 TAO for staking (minimum)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* How to Stake — Tabs */}
            <section id="how-to-stake" className="space-y-4">
              <h2 className="text-xl font-bold text-white">How to Stake</h2>
              <StakingMethodTabs />
            </section>

            {/* Choose a Validator — standalone section */}
            <section id="validators" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Choose a Validator</h2>
              <p className="text-sm text-gray-400">
                Validators are nodes that secure the Bittensor network. Pick one with a low fee and high uptime.
              </p>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <div className="flex items-center justify-between px-3 py-2 bg-[#080d14] border-b border-white/10">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Validators by Stake</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Live
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Validator</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider">APR</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stake (TAO)</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Nominators</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {validators.map((v, i) => (
                      <tr key={v.hotkey || i} className="hover:bg-purple-600/5 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-white">{v.name}</td>
                        <td className="px-3 py-2.5 text-right text-gray-300">{v.fee}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                            {v.apr}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-400 hidden sm:table-cell">{v.stake}</td>
                        <td className="px-3 py-2.5 text-right text-gray-400 hidden md:table-cell">{v.nominators.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600">
                Data from taostats.io, refreshed every 5 minutes. Copy a validator&apos;s hotkey from{" "}
                <a href="https://taostats.io/validators" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">
                  taostats.io/validators
                </a>{" "}
                — you will need it for the CLI method.
              </p>
            </section>

            {/* How to Unstake */}
            <section id="unstaking" className="space-y-4">
              <h2 className="text-xl font-bold text-white">How to Unstake</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-3">
                <p className="text-sm text-gray-400">Run this command to remove your stake:</p>
                <CodeBlock>{`btcli stake remove --wallet.name my-wallet --hotkey VALIDATOR_HOTKEY --amount 10`}</CodeBlock>
                <SuccessBox>
                  ✅ Unstaking is immediate. Your TAO returns to your wallet within a few minutes.
                  There is no lock-up period.
                </SuccessBox>
              </div>
            </section>

            {/* Common Mistakes */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">Common Mistakes to Avoid</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-3">
                <ul className="space-y-2.5 text-sm">
                  {[
                    { icon: "❌", text: "Never stake from an exchange wallet — use your own wallet that you control" },
                    { icon: "❌", text: "Never share your seed phrase with anyone, ever" },
                    { icon: "❌", text: "Double-check the validator hotkey before staking — one wrong character sends to the wrong place" },
                    { icon: "❌", text: "Don't stake everything at once — start small (1–5 TAO) to test first" },
                    { icon: "✅", text: "Bookmark the official docs: docs.bittensor.com" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="shrink-0 text-base">{item.icon}</span>
                      <span className={item.icon === "✅" ? "text-emerald-300" : "text-gray-300"}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Calculator */}
            <section id="calculator" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Staking Calculator</h2>
              <StakingCalculator />
            </section>

            {/* FAQ */}
            <section id="faq" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQ.map((item) => (
                  <div key={item.q} className="rounded-xl border border-white/10 bg-[#0f1623] p-5">
                    <p className="text-sm font-semibold text-white mb-1.5">{item.q}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Sticky TOC */}
        <div className="hidden lg:block w-48 shrink-0">
          <TableOfContents sections={TOC_SECTIONS} />
        </div>
      </div>
    </div>
  );
}

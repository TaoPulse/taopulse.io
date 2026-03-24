import StakingCalculator from "@/components/StakingCalculator";

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

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 leading-relaxed">
      {children}
    </div>
  );
}

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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 leading-relaxed">
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

function StepCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-9 h-9 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
          <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function StakingPage() {
  const validators = await fetchValidators();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

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
      <section className="space-y-4">
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
      <section className="space-y-5">
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
      <section className="space-y-4">
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

      {/* Prerequisites */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Before You Start</h2>
        <p className="text-sm text-gray-400">Make sure you have everything in place before staking:</p>
        <ul className="space-y-2">
          {[
            "TAO tokens in a wallet you control",
            "A compatible wallet app (Method 1 — recommended) or Bittensor CLI (Method 2 — advanced)",
            "At least 0.1 TAO for staking (minimum)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Method 1: Wallet App (Recommended) */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Method 1: Stake via Wallet App</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">Recommended</span>
          </div>
          <p className="text-sm text-gray-400">No terminal needed — the easiest way to get started. Both options use classic root staking (TAO stays TAO).</p>
        </div>

        {/* Option A: TAO.com */}
        <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 uppercase tracking-wider">Option A</span>
            <h3 className="text-base font-semibold text-white">TAO.com — Best for Mobile</h3>
          </div>
          <p className="text-sm text-gray-400">Available on iOS App Store and Google Play.</p>
          <ol className="space-y-2 ml-1">
            {[
              "Download the TAO.com app from the iOS App Store or Google Play",
              "Create a new wallet or import an existing one using your seed phrase",
              "Go to the Staking tab",
              "Choose a validator from the list",
              "Enter the amount of TAO to stake",
              "Confirm the transaction",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="shrink-0 text-purple-500 font-semibold">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <DangerBox>
            ⚠️ Write down your seed phrase offline during wallet setup. Anyone with your seed phrase can steal your TAO.
          </DangerBox>
        </div>

        {/* Option B: Talisman */}
        <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-wider">Option B</span>
            <h3 className="text-base font-semibold text-white">Talisman — Best for Desktop</h3>
          </div>
          <p className="text-sm text-gray-400">Browser extension wallet for Chrome-based browsers.</p>
          <ol className="space-y-2 ml-1">
            {[
              'Install Talisman from the Chrome Web Store (search "Talisman Polkadot Wallet")',
              "Create a new wallet or import an existing one using your seed phrase",
              "Open the Talisman extension and navigate to Staking",
              "Search for Bittensor validators",
              "Select a validator and enter your stake amount",
              "Confirm the transaction",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="shrink-0 text-purple-500 font-semibold">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <InfoBox>
            Talisman supports multiple Substrate-based chains. Make sure you are on the Bittensor network when staking.
          </InfoBox>
        </div>
      </section>

      {/* Method 2: CLI (Advanced) */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Method 2: Stake via Bittensor CLI</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-wider">Advanced</span>
          </div>
          <p className="text-sm text-gray-400">For developers &amp; power users. Requires a terminal and Python.</p>
        </div>

        {/* Step 1 */}
        <StepCard number={1} title="Install Bittensor CLI">
          <p>
            The official command-line tool from the Bittensor team. It lets you manage wallets,
            stake TAO, and check your balance directly from your terminal.
          </p>
          <p className="text-gray-300">Official docs:{" "}
            <a
              href="https://docs.bittensor.com/getting-started/installation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline hover:text-purple-300"
            >
              docs.bittensor.com/getting-started/installation
            </a>
          </p>
          <p className="text-gray-300">Install command:</p>
          <CodeBlock>pip install bittensor</CodeBlock>
          <p className="text-gray-300">Verify the installation:</p>
          <CodeBlock>btcli --version</CodeBlock>
          <InfoBox>
            Requires <strong>Python 3.9 or higher</strong>. Download Python from{" "}
            <a
              href="https://python.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              python.org
            </a>{" "}
            if needed.
          </InfoBox>
        </StepCard>

        {/* Step 2 */}
        <StepCard number={2} title="Create or Import Your Wallet">
          <p>
            A <strong className="text-white">coldkey</strong> is your main wallet key — like a bank account number.
            It holds your TAO and is what you use to sign transactions.
          </p>
          <p className="text-gray-300">Create a new wallet:</p>
          <CodeBlock>btcli w new_coldkey --wallet.name my-wallet</CodeBlock>
          <p>
            You will be shown a <strong className="text-white">12-word seed phrase</strong>. This is the only
            way to recover your wallet.
          </p>
          <DangerBox>
            ⚠️ <strong>Write down your 12-word seed phrase and store it offline</strong> — on paper,
            not in a text file or screenshot. If you lose it, your TAO is gone forever.
            No one can recover it for you.
          </DangerBox>
        </StepCard>

        {/* Step 3 */}
        <StepCard number={3} title="Understand Your Coldkey & Get Your Address">
          <InfoBox>
            <p className="font-semibold text-blue-200 mb-1.5">What is a Coldkey vs Hotkey?</p>
            <p>In Bittensor, your wallet has two keys:</p>
            <ul className="mt-1.5 space-y-1 ml-3">
              <li><strong className="text-blue-200">Coldkey</strong> = your main wallet address (like a bank account number). Used for receiving TAO and delegating stake. Keep this private.</li>
              <li><strong className="text-blue-200">Hotkey</strong> = a secondary key used for active operations (mining/validating). As a staker, you mostly use coldkeys.</li>
            </ul>
          </InfoBox>

          <p className="mt-1 font-medium text-gray-300">If creating a new wallet:</p>
          <CodeBlock>{`# Create a new coldkey wallet
btcli wallet new_coldkey --wallet.name my-wallet

# This will:
# 1. Ask you to set a password (remember this!)
# 2. Show you a 12-word seed phrase — WRITE THIS DOWN OFFLINE
# 3. Create your wallet files in ~/.bittensor/wallets/`}</CodeBlock>

          <DangerBox>
            <p className="font-semibold text-red-200 mb-1">⚠️ Your 12-word seed phrase IS your wallet.</p>
            <p>Anyone who has it can steal all your TAO. Never:</p>
            <ul className="mt-1 space-y-0.5 ml-3">
              <li>• Share it with anyone (including TaoPulse)</li>
              <li>• Store it in email, cloud notes, or screenshots</li>
              <li>• Type it into any website</li>
            </ul>
            <p className="mt-1.5">Write it on paper and store in a safe place.</p>
          </DangerBox>

          <p className="font-medium text-gray-300">View your coldkey address:</p>
          <CodeBlock>btcli wallet overview --wallet.name my-wallet</CodeBlock>
          <p>Output will show something like:</p>
          <CodeBlock>{`Coldkey: 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
Balance: 10.5 TAO`}</CodeBlock>
          <SuccessBox>
            ✅ The long string starting with <code className="font-mono text-xs">5...</code> is your coldkey address. This is safe to share — it is just your receive address.
          </SuccessBox>

          <p className="font-medium text-gray-300">If importing an existing wallet (restore from seed phrase):</p>
          <CodeBlock>{`btcli wallet regen_coldkey --wallet.name my-wallet --mnemonic "word1 word2 word3 ... word12"`}</CodeBlock>

          <p className="font-medium text-gray-300">Finding your coldkey on TaoStats:</p>
          <ul className="space-y-1 ml-3">
            <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">1.</span> Go to{" "}
              <a href="https://taostats.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">taostats.io</a>
            </li>
            <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">2.</span> Click <strong className="text-white">Accounts</strong> in the top menu</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">3.</span> Search for your coldkey address</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">4.</span> You can see your balance, stake, and delegation history</li>
          </ul>
        </StepCard>

        {/* Step 4 */}
        <StepCard number={4} title="Choose a Validator">
          <p>
            Validators are nodes that participate in the Bittensor network. When you stake to a
            validator, you earn a share of their rewards minus their fee.
          </p>
          <p className="text-gray-300">Browse validators on TaoStats:{" "}
            <a
              href="https://taostats.io/validators"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline hover:text-purple-300"
            >
              taostats.io/validators
            </a>
          </p>
          <p>What to look for:</p>
          <ul className="space-y-1 ml-3">
            <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> High uptime (&gt;99%)</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Reasonable fee (&lt;18%)</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Long track record</li>
          </ul>

          {/* Validator table */}
          <div className="overflow-x-auto mt-2 rounded-lg border border-white/10">
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
            Data from taostats.io, refreshed every 5 minutes. Copy a validator&apos;s hotkey from TaoStats — you will need it in the next step.
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <p className="text-sm font-semibold text-gray-300">How to Find a Validator Hotkey</p>
            <p>
              When you stake, you need the validator&apos;s <strong className="text-white">hotkey</strong> address. Here&apos;s how to find it:
            </p>
            <ol className="space-y-1.5 ml-3">
              {[
                <>Go to <a href="https://taostats.io/validators" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">taostats.io/validators</a></>,
                <>Browse validators — look for: <strong className="text-white">low take rate (0–9%)</strong>, high uptime (green indicator), long history (older = more reliable)</>,
                "Click on a validator name",
                <>Copy their <strong className="text-white">Hotkey</strong> address (starts with 5...)</>,
                "Use this hotkey in the btcli stake command",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 text-purple-500 font-semibold">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <SuccessBox>
              ✅ Example validator hotkey: <code className="font-mono text-xs">5F4tQyWrhfGVcNhoqeiNsR6KjD4wMZ2kfhLj4oLYydGoqiGn</code>
            </SuccessBox>
          </div>
        </StepCard>

        {/* Step 5 */}
        <StepCard number={5} title="Delegate (Stake) Your TAO">
          <p>Run this command to stake your TAO to a validator:</p>
          <CodeBlock>{`btcli stake add \\
  --wallet.name my-wallet \\    # The name you used when creating your wallet
  --hotkey 5F4tQyWrhfGVcNhoqeiNsR6KjD4wMZ2kfhLj4oLYydGoqiGn \\  # Copied from TaoStats
  --amount 5                    # Start with a small amount!`}</CodeBlock>
          <div className="space-y-1.5 mt-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What each flag means:</p>
            <ul className="space-y-1 text-sm">
              <li><code className="text-green-300 font-mono text-xs">--wallet.name my-wallet</code> → the name you gave your wallet in step 2</li>
              <li><code className="text-green-300 font-mono text-xs">--hotkey 5F4tQ...</code> → the validator hotkey you copied from TaoStats (step 4)</li>
              <li><code className="text-green-300 font-mono text-xs">--amount 5</code> → how many TAO to stake</li>
            </ul>
          </div>
          <SuccessBox>
            <p className="font-semibold text-emerald-200 mb-1">After running, you will be asked to enter your wallet password. Then you&apos;ll see:</p>
            <code className="font-mono text-xs">✓ Staked 5 TAO to validator 5F4tQ...</code>
          </SuccessBox>
          <WarningBox>
            ⚠️ Start with a small amount (1–5 TAO) first to verify everything works before staking more.
          </WarningBox>
        </StepCard>

        {/* Step 6 */}
        <StepCard number={6} title="Verify Your Stake">
          <p>Check that your stake was registered and see your accumulating rewards:</p>
          <CodeBlock>btcli stake show --wallet.name my-wallet</CodeBlock>
          <p>
            You should see your staked TAO balance and rewards accumulating. Rewards
            update with every network block (~12 seconds).
          </p>
          <SuccessBox>
            ✅ You are done! Your TAO is now staking and earning rewards automatically.
          </SuccessBox>
        </StepCard>
      </section>

      {/* How to Unstake */}
      <section className="space-y-4">
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
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Staking Calculator</h2>
        <StakingCalculator />
      </section>

      {/* FAQ */}
      <section className="space-y-4">
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
  );
}

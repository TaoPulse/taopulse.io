"use client";

import { useState } from "react";

function DangerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 leading-relaxed">
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

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 leading-relaxed">
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

const TABS = [
  { id: "wallet" as const, label: "📱 Wallet App (Recommended)" },
  { id: "cli" as const, label: "⌨️ CLI (Advanced)" },
  { id: "crucible" as const, label: "🧠 Crucible (Smart Staking)" },
];

export default function StakingMethodTabs() {
  const [active, setActive] = useState<"wallet" | "cli" | "crucible">("wallet");

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4">
        New to TAO? Start with the Wallet App. Want automated yield optimization? Try Crucible.
      </p>

      {/* Tab bar */}
      <div className="flex border-b border-white/10 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.id
                ? "text-white border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wallet App tab */}
      {active === "wallet" && (
        <div className="space-y-5">
          {/* Option A: TAO.com */}
          <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 uppercase tracking-wider">
                Option A
              </span>
              <h3 className="text-base font-semibold text-white">
                TAO.com — Best for Mobile
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Available on iOS App Store and Google Play.
            </p>
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
                  <span className="shrink-0 text-purple-500 font-semibold">
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <DangerBox>
              ⚠️ Write down your seed phrase offline during wallet setup. Anyone
              with your seed phrase can steal your TAO.
            </DangerBox>
          </div>

          {/* Option B: Talisman */}
          <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                Option B
              </span>
              <h3 className="text-base font-semibold text-white">
                Talisman — Best for Desktop
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Browser extension wallet for Chrome-based browsers.
            </p>
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
                  <span className="shrink-0 text-purple-500 font-semibold">
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <InfoBox>
              Talisman supports multiple Substrate-based chains. Make sure you
              are on the Bittensor network when staking.
            </InfoBox>
          </div>
        </div>
      )}

      {/* Crucible tab */}
      {active === "crucible" && (
        <div className="space-y-5">
          <StepCard number={1} title="Install Crucible Wallet">
            <p>
              Install the Crucible Wallet Chrome extension from the Chrome Web Store. It&apos;s
              built specifically for Bittensor — TAO-native, independently audited, and the only
              TAO wallet with a built-in Smart Allocator.
            </p>
            <p>
              <a
                href="https://chromewebstore.google.com/detail/crucible-wallet/capjnhbneiilplogojhmhepiocnjpgee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline hover:text-purple-300"
              >
                Install from Chrome Web Store
              </a>
            </p>
          </StepCard>

          <StepCard number={2} title="Create or Import Wallet">
            <p>
              Open the extension and click <strong className="text-white">Create Wallet</strong> to
              generate a new wallet, or{" "}
              <strong className="text-white">Import Wallet</strong> if you already have a seed
              phrase. Set a Master Password — this protects all wallets stored in the extension.
            </p>
            <DangerBox>
              ⚠️ Write down your 12-word seed phrase and store it offline. Anyone with your seed
              phrase can access your funds.
            </DangerBox>
          </StepCard>

          <StepCard number={3} title="Send TAO to Your Wallet">
            <p>
              Copy your TAO address from the extension and send TAO from your exchange (Kraken,
              Coinbase, OKX, etc.). For the Smart Allocator to work efficiently, stake 20+ TAO —
              smaller amounts work but take longer to generate visible subnet rewards.
            </p>
          </StepCard>

          <StepCard number={4} title="Stake to Root Network">
            <p>
              Click <strong className="text-white">Stake</strong> in the extension, choose a
              validator, enter your amount, and confirm. Your TAO is now staked to Root and begins
              earning rewards. Standard network transaction fee applies (~0.001 TAO).
            </p>
          </StepCard>

          <StepCard number={5} title="Enable Smart Allocator">
            <p>
              Navigate to the <strong className="text-white">Smart Allocator</strong> tab and click{" "}
              <strong className="text-white">Enable</strong>. Crucible creates a secure proxy wallet
              on-chain (one-time ~0.1 TAO deposit, refunded when you close it). Once active, your
              ROOT staking rewards are automatically deployed across the top 20 subnets daily — no
              manual management needed. Your principal stays at Root; only earned rewards are
              deployed.
            </p>
            <InfoBox>
              Smart Allocator uses a proxy key that can only stake — it cannot transfer your funds.
              Your coldkey (original balance) is never at risk.
            </InfoBox>
          </StepCard>

          <StepCard number={6} title="Monitor Your Portfolio">
            <p>
              Use the <strong className="text-white">PnL tab</strong> for real-time profit/loss
              tracking across your full portfolio. Transaction History shows every stake, reward, and
              transfer. Subnet positions appear after ~1 week as rewards accumulate and get deployed.
              Allocations rebalance automatically as subnet rankings shift.
            </p>
          </StepCard>

          <p className="text-xs text-gray-600 text-center pt-2">
            Staking powered by Crucible Wallet by Crucible Labs
          </p>
        </div>
      )}

      {/* CLI tab */}
      {active === "cli" && (
        <div className="space-y-5">
          <StepCard number={1} title="Install Bittensor CLI">
            <p>
              The official command-line tool from the Bittensor team. It lets
              you manage wallets, stake TAO, and check your balance directly
              from your terminal.
            </p>
            <p className="text-gray-300">
              Official docs:{" "}
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
              Requires <strong>Python 3.9 or higher</strong>. Download Python
              from{" "}
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

          <StepCard number={2} title="Create or Import Your Wallet">
            <p>
              A <strong className="text-white">coldkey</strong> is your main
              wallet key — like a bank account number. It holds your TAO and is
              what you use to sign transactions.
            </p>
            <p className="text-gray-300">Create a new wallet:</p>
            <CodeBlock>btcli w new_coldkey --wallet.name my-wallet</CodeBlock>
            <p>
              You will be shown a{" "}
              <strong className="text-white">12-word seed phrase</strong>. This
              is the only way to recover your wallet.
            </p>
            <DangerBox>
              ⚠️ <strong>Write down your 12-word seed phrase and store it offline</strong>{" "}
              — on paper, not in a text file or screenshot. If you lose it, your
              TAO is gone forever. No one can recover it for you.
            </DangerBox>
          </StepCard>

          <StepCard number={3} title="Understand Your Coldkey & Get Your Address">
            <InfoBox>
              <p className="font-semibold text-blue-200 mb-1.5">
                What is a Coldkey vs Hotkey?
              </p>
              <p>In Bittensor, your wallet has two keys:</p>
              <ul className="mt-1.5 space-y-1 ml-3">
                <li>
                  <strong className="text-blue-200">Coldkey</strong> = your
                  main wallet address. Used for receiving TAO and delegating
                  stake. Keep this private.
                </li>
                <li>
                  <strong className="text-blue-200">Hotkey</strong> = a
                  secondary key for active operations (mining/validating). As a
                  staker, you mostly use coldkeys.
                </li>
              </ul>
            </InfoBox>

            <p className="mt-1 font-medium text-gray-300">
              Create a new wallet:
            </p>
            <CodeBlock>{`# Create a new coldkey wallet
btcli wallet new_coldkey --wallet.name my-wallet

# This will:
# 1. Ask you to set a password (remember this!)
# 2. Show you a 12-word seed phrase — WRITE THIS DOWN OFFLINE
# 3. Create your wallet files in ~/.bittensor/wallets/`}</CodeBlock>

            <DangerBox>
              <p className="font-semibold text-red-200 mb-1">
                ⚠️ Your 12-word seed phrase IS your wallet.
              </p>
              <p>Anyone who has it can steal all your TAO. Never:</p>
              <ul className="mt-1 space-y-0.5 ml-3">
                <li>• Share it with anyone (including TaoPulse)</li>
                <li>• Store it in email, cloud notes, or screenshots</li>
                <li>• Type it into any website</li>
              </ul>
              <p className="mt-1.5">Write it on paper and store in a safe place.</p>
            </DangerBox>

            <p className="font-medium text-gray-300">
              View your coldkey address:
            </p>
            <CodeBlock>btcli wallet overview --wallet.name my-wallet</CodeBlock>
            <p>Output will show something like:</p>
            <CodeBlock>{`Coldkey: 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
Balance: 10.5 TAO`}</CodeBlock>
            <SuccessBox>
              ✅ The long string starting with{" "}
              <code className="font-mono text-xs">5...</code> is your coldkey
              address. This is safe to share — it is just your receive address.
            </SuccessBox>

            <p className="font-medium text-gray-300">
              Import an existing wallet (restore from seed phrase):
            </p>
            <CodeBlock>{`btcli wallet regen_coldkey --wallet.name my-wallet --mnemonic "word1 word2 word3 ... word12"`}</CodeBlock>
          </StepCard>

          <StepCard number={4} title="Choose a Validator">
            <p>
              Validators are nodes that participate in the Bittensor network.
              When you stake to a validator, you earn a share of their rewards
              minus their fee.
            </p>
            <p className="text-gray-300">
              Browse validators on TaoStats:{" "}
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
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span> High
                uptime (&gt;99%)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span> Reasonable
                fee (&lt;18%)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span> Long track
                record
              </li>
            </ul>

            <div className="mt-2 pt-4 border-t border-white/10 space-y-3">
              <p className="text-sm font-semibold text-gray-300">
                How to Find a Validator Hotkey
              </p>
              <ol className="space-y-1.5 ml-3">
                {[
                  <>
                    Go to{" "}
                    <a
                      href="https://taostats.io/validators"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 underline hover:text-purple-300"
                    >
                      taostats.io/validators
                    </a>
                  </>,
                  <>
                    Look for:{" "}
                    <strong className="text-white">low take rate (0–9%)</strong>
                    , high uptime, long history
                  </>,
                  "Click on a validator name",
                  <>
                    Copy their{" "}
                    <strong className="text-white">Hotkey</strong> address
                    (starts with 5...)
                  </>,
                  "Use this hotkey in the btcli stake command below",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="shrink-0 text-purple-500 font-semibold">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <SuccessBox>
                ✅ Example validator hotkey:{" "}
                <code className="font-mono text-xs">
                  5F4tQyWrhfGVcNhoqeiNsR6KjD4wMZ2kfhLj4oLYydGoqiGn
                </code>
              </SuccessBox>
            </div>
          </StepCard>

          <StepCard number={5} title="Delegate (Stake) Your TAO">
            <p>Run this command to stake your TAO to a validator:</p>
            <CodeBlock>{`btcli stake add \\
  --wallet.name my-wallet \\    # The name you used when creating your wallet
  --hotkey 5F4tQyWrhfGVcNhoqeiNsR6KjD4wMZ2kfhLj4oLYydGoqiGn \\  # Copied from TaoStats
  --amount 5                    # Start with a small amount!`}</CodeBlock>
            <div className="space-y-1.5 mt-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                What each flag means:
              </p>
              <ul className="space-y-1 text-sm">
                <li>
                  <code className="text-green-300 font-mono text-xs">
                    --wallet.name my-wallet
                  </code>{" "}
                  → the name you gave your wallet in step 2
                </li>
                <li>
                  <code className="text-green-300 font-mono text-xs">
                    --hotkey 5F4tQ...
                  </code>{" "}
                  → the validator hotkey you copied from TaoStats (step 4)
                </li>
                <li>
                  <code className="text-green-300 font-mono text-xs">
                    --amount 5
                  </code>{" "}
                  → how many TAO to stake
                </li>
              </ul>
            </div>
            <SuccessBox>
              <p className="font-semibold text-emerald-200 mb-1">
                After running, you will be asked to enter your wallet password.
                Then you&apos;ll see:
              </p>
              <code className="font-mono text-xs">
                ✓ Staked 5 TAO to validator 5F4tQ...
              </code>
            </SuccessBox>
            <WarningBox>
              ⚠️ Start with a small amount (1–5 TAO) first to verify everything
              works before staking more.
            </WarningBox>
          </StepCard>

          <StepCard number={6} title="Verify Your Stake">
            <p>
              Check that your stake was registered and see your accumulating
              rewards:
            </p>
            <CodeBlock>btcli stake show --wallet.name my-wallet</CodeBlock>
            <p>
              You should see your staked TAO balance and rewards accumulating.
              Rewards update with every network block (~12 seconds).
            </p>
            <SuccessBox>
              ✅ You are done! Your TAO is now staking and earning rewards
              automatically.
            </SuccessBox>
          </StepCard>

          <StepCard number={7} title="How to Unstake">
            <p>
              To remove your stake and return TAO to your wallet, run:
            </p>
            <CodeBlock>{`btcli stake remove --wallet.name my-wallet --hotkey VALIDATOR_HOTKEY --amount 10`}</CodeBlock>
            <p>
              Replace <code className="text-purple-300 bg-white/5 px-1 rounded">VALIDATOR_HOTKEY</code> with the hotkey of the validator you staked to, and <code className="text-purple-300 bg-white/5 px-1 rounded">10</code> with the amount of TAO you want to unstake.
            </p>
            <SuccessBox>
              ✅ Unstaking is immediate — no lock-up period. Your TAO returns to
              your wallet within a few minutes.
            </SuccessBox>
          </StepCard>
        </div>
      )}
    </div>
  );
}

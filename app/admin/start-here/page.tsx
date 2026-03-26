"use client";

import { useState } from "react";
import Link from "next/link";

type AmountOption = "$50" | "$500" | "$5,000" | "$50k+";
type WalletOption = "yes" | "no";
type StorageOption = "mobile" | "browser" | "hardware";
type StakeOption = "yes" | "no" | "explain";

interface Answers {
  amount?: AmountOption;
  hasWallet?: WalletOption;
  storage?: StorageOption;
  stake?: StakeOption;
}

const TOTAL_STEPS = 5;

export default function StartHerePage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});

  function pick<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      {/* Admin badge */}
      <div className="fixed top-4 right-4 z-50">
        <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full font-medium">
          Admin Preview
        </span>
      </div>

      <div className="max-w-xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            Guided Journey
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Start Here</h1>
          <p className="text-gray-400 text-sm">
            I have money and I want to invest in TAO — walk me through it.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <div className="bg-[#0f1623] rounded-2xl border border-white/8 p-8">
          {step === 1 && <Step1 onChoose={(v) => pick("amount", v)} />}
          {step === 2 && <Step2 onChoose={(v) => pick("hasWallet", v)} />}
          {step === 3 && <Step3 onChoose={(v) => pick("storage", v)} />}
          {step === 4 && <Step4 onChoose={(v) => pick("stake", v)} />}
          {step === 5 && <Summary answers={answers} />}
        </div>

        {/* Navigation */}
        {step > 1 && step < 5 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
        )}
        {step === 5 && (
          <button
            onClick={() => { setStep(1); setAnswers({}); }}
            className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            ↺ Start over
          </button>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
    >
      <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
        {label}
      </span>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </button>
  );
}

function Step1({ onChoose }: { onChoose: (v: AmountOption) => void }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">
        How much do you want to invest?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        This helps us recommend the right path for you.
      </p>
      <div className="space-y-3">
        <ChoiceButton
          label="$50"
          sub="Just dipping my toes in"
          onClick={() => onChoose("$50")}
        />
        <ChoiceButton
          label="$500"
          sub="Taking a real position"
          onClick={() => onChoose("$500")}
        />
        <ChoiceButton
          label="$5,000"
          sub="Investing meaningfully"
          onClick={() => onChoose("$5,000")}
        />
        <ChoiceButton
          label="$50,000+"
          sub="Serious commitment"
          onClick={() => onChoose("$50k+")}
        />
      </div>
    </div>
  );
}

function Step2({ onChoose }: { onChoose: (v: WalletOption) => void }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">
        Do you have a TAO wallet yet?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        A TAO wallet is where you&apos;ll store your tokens after buying.
      </p>
      <div className="space-y-3">
        <ChoiceButton
          label="Yes, I have a wallet"
          sub="Ready to receive TAO"
          onClick={() => onChoose("yes")}
        />
        <ChoiceButton
          label="No, I need to set one up"
          sub="We'll help you pick the right one"
          onClick={() => onChoose("no")}
        />
      </div>
    </div>
  );
}

function Step3({ onChoose }: { onChoose: (v: StorageOption) => void }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">
        Where do you want to store it?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Pick the storage style that fits you.
      </p>
      <div className="space-y-3">
        <ChoiceButton
          label="Mobile App"
          sub="TAO.com or Nova Wallet — easiest for beginners"
          onClick={() => onChoose("mobile")}
        />
        <ChoiceButton
          label="Browser Extension"
          sub="Talisman or Crucible — best for desktop users"
          onClick={() => onChoose("browser")}
        />
        <ChoiceButton
          label="Hardware Wallet"
          sub="Ledger — maximum security, ideal for large amounts"
          onClick={() => onChoose("hardware")}
        />
      </div>
    </div>
  );
}

function Step4({ onChoose }: { onChoose: (v: StakeOption) => void }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">
        Do you want to stake your TAO?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Staking lets your TAO earn rewards (~15–20% APY est.) by supporting network validators.
      </p>
      <div className="space-y-3">
        <ChoiceButton
          label="Yes, I want to earn yield"
          sub="Let your TAO work for you"
          onClick={() => onChoose("yes")}
        />
        <ChoiceButton
          label="No, just hold for now"
          sub="You can always stake later — no rush"
          onClick={() => onChoose("no")}
        />
        <ChoiceButton
          label="What is staking?"
          sub="I'd like to understand it before deciding"
          onClick={() => onChoose("explain")}
        />
      </div>
    </div>
  );
}

interface SummaryStep {
  num: number;
  title: string;
  href: string;
  desc: string;
  color: "cyan" | "green" | "purple";
}

function Summary({ answers }: { answers: Answers }) {
  const steps: SummaryStep[] = [];

  // Step 1: Buy TAO
  if (answers.amount === "$50") {
    steps.push({
      num: 1,
      title: "Buy TAO via TAO.com",
      href: "/buy-tao",
      desc: "TAO.com supports fiat purchase directly — it's the easiest on-ramp for small amounts. You can buy with a credit card or bank transfer.",
      color: "cyan",
    });
  } else {
    steps.push({
      num: 1,
      title: "Compare exchanges to buy TAO",
      href: "/buy-tao",
      desc: `For ${answers.amount ?? "your amount"}, compare Kraken, MEXC, and Gate.io for the best rates and lowest fees. Our exchange comparison guide shows current spreads.`,
      color: "cyan",
    });
  }

  // Step 2: Wallet
  let walletTitle = "Set up your TAO wallet";
  let walletDesc = "Browse our verified wallet list and pick the one that fits your needs.";

  if (answers.hasWallet === "yes") {
    walletTitle = "Your wallet is ready";
    walletDesc = "You're set. Make sure your wallet address is correct before withdrawing from an exchange.";
  } else if (answers.storage === "mobile") {
    walletDesc =
      "TAO.com (iOS/Android) is our top pick for beginners — built-in staking, fiat on-ramp, and FaceID security.";
  } else if (answers.storage === "browser") {
    walletDesc =
      "Talisman is the gold standard browser wallet for TAO — staking built-in, Ledger support, and polished UX.";
  } else if (answers.storage === "hardware") {
    walletDesc =
      "Ledger + Talisman is the safest combo for large TAO holdings. Our wallet guide covers the full setup.";
  }

  steps.push({
    num: 2,
    title: walletTitle,
    href: "/wallets",
    desc: walletDesc,
    color: "green",
  });

  // Step 3: Staking (conditional)
  if (answers.stake === "yes") {
    steps.push({
      num: 3,
      title: "Stake your TAO for ~15–20% APY (est.)",
      href: "/staking",
      desc: "Classic root staking: your TAO stays TAO, no impermanent loss, no slashing risk. Beginner-safe and simple to start.",
      color: "purple",
    });
  } else if (answers.stake === "explain") {
    steps.push({
      num: 3,
      title: "Learn what staking is first",
      href: "/staking",
      desc: "Staking means locking your TAO with a network validator to earn rewards (~15–20% APY est.). Low risk, fully reversible. Our staking guide explains everything.",
      color: "purple",
    });
  }

  const borderColor = {
    cyan: "border-cyan-500/25 bg-cyan-500/5",
    green: "border-green-500/25 bg-green-500/5",
    purple: "border-purple-500/25 bg-purple-500/5",
  };
  const dotColor = {
    cyan: "bg-cyan-500 text-white",
    green: "bg-green-500 text-white",
    purple: "bg-purple-500 text-white",
  };
  const linkColor = {
    cyan: "text-cyan-400 hover:text-cyan-300",
    green: "text-green-400 hover:text-green-300",
    purple: "text-purple-400 hover:text-purple-300",
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">
        Your personalized path
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Here&apos;s exactly what to do next, in order:
      </p>
      <ol className="space-y-4">
        {steps.map((s) => (
          <li
            key={s.num}
            className={`rounded-xl border p-4 ${borderColor[s.color]}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dotColor[s.color]}`}
              >
                {s.num}
              </span>
              <div>
                <Link
                  href={s.href}
                  className={`font-semibold transition-colors ${linkColor[s.color]}`}
                >
                  {s.title} →
                </Link>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-gray-600 mt-6 text-center">
        Admin preview — this flow will live at /start-here for users
      </p>
    </div>
  );
}

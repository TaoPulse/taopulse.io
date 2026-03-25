"use client";

import { useState } from "react";
import Link from "next/link";

type Vote = "stake" | "mine" | "either";

interface Question {
  text: string;
  options: { label: string; vote: Vote }[];
}

const questions: Question[] = [
  {
    text: "Do you have a GPU?",
    options: [
      { label: "No GPU", vote: "stake" },
      { label: "Yes — consumer (RTX 3080 or similar)", vote: "either" },
      { label: "Yes — high-end (A100 / H100)", vote: "mine" },
    ],
  },
  {
    text: "How technical are you?",
    options: [
      { label: "I prefer simple, hands-off tools", vote: "stake" },
      { label: "I can follow setup guides", vote: "either" },
      { label: "I am a developer / ML engineer", vote: "mine" },
    ],
  },
  {
    text: "How much TAO do you have?",
    options: [
      { label: "Less than 10 TAO", vote: "stake" },
      { label: "10 – 100 TAO", vote: "either" },
      { label: "More than 100 TAO", vote: "mine" },
    ],
  },
  {
    text: "What is your main goal?",
    options: [
      { label: "Earn passive income", vote: "stake" },
      { label: "Contribute to AI research", vote: "mine" },
      { label: "Both — income and contribution", vote: "either" },
    ],
  },
  {
    text: "How much time can you dedicate?",
    options: [
      { label: "Set it and forget it", vote: "stake" },
      { label: "A few hours per week", vote: "either" },
      { label: "Full time", vote: "mine" },
    ],
  },
];

type Recommendation = "stake" | "mine" | "both";

function getRecommendation(votes: Vote[]): Recommendation {
  let stakeCount = 0;
  let mineCount = 0;
  for (const v of votes) {
    if (v === "stake") stakeCount++;
    else if (v === "mine") mineCount++;
  }
  if (stakeCount > mineCount) return "stake";
  if (mineCount > stakeCount) return "mine";
  return "both";
}

export default function StakeOrMineQuiz() {
  const [step, setStep] = useState<number>(0); // 0 = intro, 1-5 = questions, 6 = result
  const [answers, setAnswers] = useState<Vote[]>([]);
  const [animating, setAnimating] = useState(false);

  const totalQuestions = questions.length;

  function handleAnswer(vote: Vote) {
    if (animating) return;
    const newAnswers = [...answers, vote];
    setAnimating(true);
    setTimeout(() => {
      setAnswers(newAnswers);
      setStep(step + 1);
      setAnimating(false);
    }, 220);
  }

  function restart() {
    setAnswers([]);
    setStep(0);
  }

  const recommendation = step > totalQuestions ? getRecommendation(answers) : null;
  const stakeCount = answers.filter((v) => v === "stake").length;
  const mineCount = answers.filter((v) => v === "mine").length;
  const eitherCount = answers.filter((v) => v === "either").length;

  return (
    <main className="min-h-screen bg-[#080d14] text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-600/30 text-purple-400 text-xs font-semibold mb-4">
            Interactive Quiz
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Should I{" "}
            <span className="text-emerald-400">Stake</span>{" "}
            or{" "}
            <span className="text-purple-400">Mine</span>{" "}
            TAO?
          </h1>
          <p className="text-gray-400 text-base">
            Answer 5 quick questions and get a personalized recommendation.
          </p>
        </div>

        {/* Intro */}
        {step === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-5xl mb-5">🤔</div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Not sure whether staking TAO or mining on a subnet is right for you? This quiz
              looks at your hardware, technical level, holdings, goals, and time to give
              you a personalized recommendation.
            </p>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
            >
              Start Quiz →
            </button>
          </div>
        )}

        {/* Questions */}
        {step >= 1 && step <= totalQuestions && (
          <div
            className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">
                Question {step} of {totalQuestions}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(((step - 1) / totalQuestions) * 100)}% complete
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / totalQuestions) * 100}%` }}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">{questions[step - 1].text}</h2>
              <div className="space-y-3">
                {questions[step - 1].options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(opt.vote)}
                    className="w-full text-left px-5 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 text-sm font-medium text-gray-300 hover:text-white transition-all duration-150"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {step > totalQuestions && recommendation && (
          <div className="space-y-6">
            {/* Score breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3">
                Score Breakdown
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{stakeCount}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Stake signals</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-purple-400">{mineCount}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Mine signals</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-blue-400">{eitherCount}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Flexible</div>
                </div>
              </div>
            </div>

            {/* Recommendation card */}
            {recommendation === "stake" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                    🌱
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                      Our Recommendation
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-300">Stake TAO</h2>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Based on your answers, staking is the best fit for you. You can delegate
                  your TAO to a trusted validator and earn emissions passively — no GPU, no
                  server, no complex setup. It&apos;s the safest way to earn yield while
                  supporting the Bittensor network.
                </p>
                <Link
                  href="/staking"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                >
                  Learn How to Stake →
                </Link>
              </div>
            )}

            {recommendation === "mine" && (
              <div className="rounded-2xl border border-purple-500/30 bg-purple-900/20 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                    ⛏️
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
                      Our Recommendation
                    </div>
                    <h2 className="text-2xl font-bold text-purple-300">Mine on a Subnet</h2>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  You have the hardware, skills, and drive to run a miner on the Bittensor
                  network. Mining lets you contribute compute or intelligence to an AI subnet
                  and earn TAO emissions directly — a more active and potentially higher-yield
                  path than staking.
                </p>
                <Link
                  href="/subnets"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
                >
                  Explore Subnets →
                </Link>
              </div>
            )}

            {recommendation === "both" && (
              <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-emerald-900/20 to-purple-900/20 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      Our Recommendation
                    </div>
                    <h2 className="text-2xl font-bold">
                      <span className="text-emerald-300">Stake</span>{" "}
                      <span className="text-gray-500">&</span>{" "}
                      <span className="text-purple-300">Mine</span>
                    </h2>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  You&apos;re well-positioned to do both. Stake a portion of your TAO for
                  steady passive income while running a miner on a subnet that aligns with
                  your skills. This hybrid approach maximises your yield and deepens your
                  involvement in the Bittensor ecosystem.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/staking"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                  >
                    Start Staking →
                  </Link>
                  <Link
                    href="/subnets"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
                  >
                    Explore Subnets →
                  </Link>
                </div>
              </div>
            )}

            <button
              onClick={restart}
              className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
            >
              ↩ Start Over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

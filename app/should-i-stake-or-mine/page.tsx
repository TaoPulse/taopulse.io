import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Should I Stake or Mine TAO? | TaoPulse",
  description:
    "Take our 5-question quiz to find out whether you should stake TAO, mine on a subnet, or do both — based on your hardware, skills, and goals.",
  keywords: ["bittensor", "stake TAO", "mine TAO", "subnet mining", "TAO staking quiz"],
  openGraph: {
    title: "Should I Stake or Mine TAO?",
    description:
      "Answer 5 quick questions and get a personalized recommendation: stake, mine, or both.",
    url: "https://taopulse.io/should-i-stake-or-mine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Should I Stake or Mine TAO?",
    description: "Take the quiz and find out if staking or mining is right for you.",
  },
  alternates: { canonical: "https://taopulse.io/should-i-stake-or-mine" },
};

export default function ShouldIStakeOrMinePage() {
  return <QuizClient />;
}

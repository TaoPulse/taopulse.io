import type { Metadata } from "next";
import ValidatorCalculatorClient from "./ValidatorCalculatorClient";

export const metadata: Metadata = {
  title: "TAO Validator Calculator — Estimate Your Staking Yield",
  description:
    "Calculate your TAO staking yield after validator take. Input your stake, validator share, and emission rate to see daily, monthly, and annual TAO rewards and APY.",
  keywords: [
    "TAO staking calculator",
    "validator take",
    "Bittensor yield calculator",
    "TAO APY",
    "staking rewards",
  ],
  openGraph: {
    title: "TAO Validator Calculator — Estimate Your Staking Yield",
    description:
      "Calculate your TAO staking yield after validator take. Input your stake, validator share, and emission rate to see daily, monthly, and annual TAO rewards and APY.",
    url: "https://taopulse.io/validator-calculator",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Validator Calculator — Estimate Your Staking Yield",
    description:
      "Calculate your TAO staking yield after validator take. Input your stake, validator share, and emission rate to see daily, monthly, and annual TAO rewards and APY.",
  },
  alternates: { canonical: "https://taopulse.io/validator-calculator" },
};

export default async function ValidatorCalculatorPage() {
  let initialPrice = 300;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://taopulse.io"}/api/price`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
    ).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (data?.price) initialPrice = data.price;
    }
  } catch {}

  return <ValidatorCalculatorClient initialPrice={initialPrice} />;
}

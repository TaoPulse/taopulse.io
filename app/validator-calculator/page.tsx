import type { Metadata } from "next";
import ValidatorCalculatorClient from "./ValidatorCalculatorClient";

export const metadata: Metadata = {
  title: "Validator Take Calculator — TAO Staking Yield Estimator",
  description:
    "Calculate your exact TAO staking yield after validator take. Adjust stake, validator take %, and subnet emissions — results update live.",
  keywords: [
    "TAO staking calculator",
    "validator take calculator",
    "Bittensor staking yield",
    "TAO APY",
    "Bittensor validator",
  ],
  openGraph: {
    title: "Validator Take Calculator — TAO Staking Yield Estimator",
    description:
      "Calculate your exact TAO staking yield after validator take. Adjust stake, validator take %, and subnet emissions — results update live.",
    url: "https://taopulse.io/validator-calculator",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Validator Take Calculator — TAO Staking Yield",
    description:
      "Calculate your TAO staking yield after validator take. Live interactive calculator.",
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

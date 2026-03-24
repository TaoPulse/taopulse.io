import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";

export const metadata: Metadata = {
  title: "TAO Portfolio Tracker — Track Your Bittensor Holdings",
  description:
    "Track your TAO holdings, see live P&L, and estimate staking rewards. No signup required.",
  keywords: [
    "TAO portfolio",
    "Bittensor portfolio tracker",
    "TAO P&L",
    "TAO staking rewards",
    "Bittensor holdings",
  ],
  openGraph: {
    title: "TAO Portfolio Tracker — Track Your Bittensor Holdings",
    description:
      "Track your TAO holdings, see live P&L, and estimate staking rewards. No signup required.",
    url: "https://taopulse.io/portfolio",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Portfolio Tracker",
    description:
      "Track your TAO holdings with live P&L and staking estimates. No signup required.",
  },
  alternates: { canonical: "https://taopulse.io/portfolio" },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}

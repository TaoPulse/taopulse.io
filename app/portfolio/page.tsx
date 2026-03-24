import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";

export const metadata: Metadata = {
  title: "TAO Portfolio Tracker — Track Your Bittensor Holdings",
  description:
    "Track the current value of your TAO holdings with live price data. Add multiple positions, see total value in USD, and estimate annual yield.",
  keywords: [
    "TAO portfolio tracker",
    "Bittensor portfolio",
    "TAO price",
    "track TAO holdings",
  ],
  openGraph: {
    title: "TAO Portfolio Tracker — Track Your Bittensor Holdings",
    description:
      "Track the current value of your TAO holdings with live price data. Add multiple positions, see total value in USD, and estimate annual yield.",
    url: "https://taopulse.io/portfolio",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Portfolio Tracker — Track Your Bittensor Holdings",
    description:
      "Track the current value of your TAO holdings with live price data. Add multiple positions, see total value in USD, and estimate annual yield.",
  },
  alternates: { canonical: "https://taopulse.io/portfolio" },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}

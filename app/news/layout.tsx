export const metadata = {
  title: "Bittensor & TAO News — Latest Updates",
  description: "Stay up to date with the latest Bittensor and TAO news. Live feeds from Reddit r/bittensor_, crypto news sources, and the official Bittensor blog.",
  keywords: ["Bittensor news", "TAO news", "Bittensor updates", "TAO Reddit", "decentralized AI news"],
  openGraph: {
    title: "Bittensor & TAO News — Latest Updates",
    description: "Stay up to date with the latest Bittensor and TAO news. Live feeds from Reddit r/bittensor_, crypto news sources, and the official Bittensor blog.",
    url: "https://taopulse.io/news",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittensor & TAO News — Latest Updates",
    description: "Stay up to date with the latest Bittensor and TAO news. Live feeds from Reddit r/bittensor_, crypto news sources, and the official Bittensor blog.",
  },
  alternates: { canonical: "https://taopulse.io/news" },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

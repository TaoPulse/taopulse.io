export const metadata = {
  title: "Bittensor & TAO News — Latest Updates",
  description: "Stay up to date with the latest Bittensor and TAO news. Live feed from Google News and Reddit r/bittensor_.",
  keywords: "Bittensor news, TAO news, Bittensor updates, TAO price news, Bittensor Reddit",
  openGraph: {
    title: "Bittensor & TAO News — Latest Updates",
    description: "Stay up to date with the latest Bittensor and TAO news. Live feed from Google News and Reddit r/bittensor_.",
    url: "https://taopulse.io/news",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bittensor & TAO News — Latest Updates",
    description: "Stay up to date with the latest Bittensor and TAO news. Live feed from Google News and Reddit r/bittensor_.",
  },
  alternates: { canonical: "https://taopulse.io/news" },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

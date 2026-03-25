import { Metadata } from "next";
import EmailSignupForm from "@/components/EmailSignupForm";

export const metadata: Metadata = {
  title: "Subscribe to TAO Alpha — Weekly TAO Newsletter | TaoPulse",
  description: "Get weekly TAO intel — price, top subnet emissions, validator rankings, and one subnet deep dive. Free, every Monday.",
  keywords: ["TAO newsletter", "TAO Alpha", "Bittensor newsletter", "TAO analytics", "TAO weekly"],
  openGraph: {
    title: "Subscribe to TAO Alpha — Weekly TAO Newsletter",
    description: "Get weekly TAO intel — price, top subnet emissions, validator rankings, and one subnet deep dive. Free, every Monday.",
    url: "https://taopulse.io/join",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscribe to TAO Alpha — Weekly TAO Newsletter",
    description: "Get weekly TAO intel — price, top subnet emissions, validator rankings, and one subnet deep dive. Free, every Monday.",
  },
  alternates: { canonical: "https://taopulse.io/join" },
};

const PERKS = [
  {
    icon: "📊",
    title: "Weekly Emission Report",
    body: "Top 5 subnets by emission, biggest movers, and where TAO is flowing — every Monday morning.",
  },
  {
    icon: "🔍",
    title: "Subnet Spotlight",
    body: "One underrated or fast-moving subnet deep dive per issue — emission trend, team activity, and a stake thesis.",
  },
  {
    icon: "📈",
    title: "TAO Market Snapshot",
    body: "Price, market cap, 24h change, and one-liner macro context. Signal without the noise.",
  },
  {
    icon: "💰",
    title: "Staking Snapshot",
    body: "Best validator APR right now, classic vs dTAO comparison, and one actionable recommendation.",
  },
];

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#080d14]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Free — No spam, ever
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            ⚡ TAO Alpha<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              Weekly TAO Intel
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Join TAO investors and Bittensor watchers who want to stay ahead — without digging through Discord threads and Twitter noise.
          </p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="bg-[#0f1623] rounded-xl border border-white/5 p-5"
            >
              <div className="text-2xl mb-3">{perk.icon}</div>
              <h3 className="text-white font-semibold mb-1 text-sm">{perk.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{perk.body}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <EmailSignupForm
          source="join-page"
          heading="Subscribe — it's free"
          subheading="Every Monday morning. TAO price, top subnet emissions, one subnet deep dive, and what to watch this week."
        />

        <p className="text-center text-xs text-gray-600 mt-6">
          No spam. Unsubscribe any time. We only write when there&apos;s something worth saying.
        </p>
      </div>
    </div>
  );
}

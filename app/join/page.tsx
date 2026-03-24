import { Metadata } from "next";
import EmailSignupForm from "@/components/EmailSignupForm";

export const metadata: Metadata = {
  title: "Join the TaoPulse Waitlist — TAO & Bittensor Insights",
  description: "Sign up for early access to live TAO staking data, validator rankings, subnet alerts, and TAO market insights from TaoPulse.",
  alternates: { canonical: "https://taopulse.io/join" },
};

const PERKS = [
  {
    icon: "📊",
    title: "Live Staking Data",
    body: "Be first to access real-time validator rankings, APY tracking, and staking performance metrics when they launch.",
  },
  {
    icon: "🔔",
    title: "Subnet Alerts",
    body: "Get notified when top subnets shift — emission spikes, new entrants, and key changes in the TAO network.",
  },
  {
    icon: "📈",
    title: "TAO Market Insights",
    body: "Curated analysis of TAO price movements, on-chain activity, and what it means for stakers and holders.",
  },
  {
    icon: "🚀",
    title: "Early Feature Access",
    body: "Waitlist members get first access to new TaoPulse tools — portfolio tracker upgrades, validator comparisons, and more.",
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
            The TAO newsletter<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              worth reading
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
          heading="Get early access"
          subheading="Drop your name and email — we'll reach out when new features go live."
          ctaText="Join the Waitlist"
        />

        <p className="text-center text-xs text-gray-600 mt-6">
          No spam. Unsubscribe any time. We only write when there&apos;s something worth saying.
        </p>
      </div>
    </div>
  );
}

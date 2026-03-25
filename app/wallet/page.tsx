import type { Metadata } from "next";
import WalletSearchForm from "./WalletSearchForm";

export const metadata: Metadata = {
  title: "TAO Wallet Lookup — Check Any Bittensor Wallet",
  description:
    "Enter a TAO coldkey ss58 address to view balance, staked TAO, validator delegations, and recent transfers.",
  keywords: [
    "TAO wallet lookup",
    "Bittensor wallet",
    "TAO balance",
    "TAO address lookup",
    "coldkey lookup",
  ],
  openGraph: {
    title: "TAO Wallet Lookup — Check Any Bittensor Wallet",
    description:
      "Enter a TAO coldkey ss58 address to view balance, staked TAO, validator delegations, and recent transfers.",
    url: "https://taopulse.io/wallet",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAO Wallet Lookup — Check Any Bittensor Wallet",
    description:
      "Enter a TAO coldkey ss58 address to view balance, staked TAO, validator delegations, and recent transfers.",
  },
  alternates: { canonical: "https://taopulse.io/wallet" },
};

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">TAO Wallet Lookup</h1>
        <p className="text-gray-400 text-base leading-relaxed">
          Enter a Bittensor coldkey address (ss58) to view its balance,
          staked TAO, validator delegations, and recent transfers.
        </p>

        <WalletSearchForm />

        <p className="mt-4 text-xs text-gray-600">
          Your coldkey looks like:{" "}
          <span className="font-mono text-gray-500">5GrwvaEF5...utQY</span>
          . Find it in Talisman, TAO.com, or any Bittensor wallet.
        </p>

        {/* What you can see */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          {[
            { icon: "💰", label: "Free Balance", desc: "TAO available in wallet" },
            { icon: "🔒", label: "Total Staked", desc: "TAO delegated to validators" },
            { icon: "📊", label: "Stakes", desc: "Per-validator breakdown" },
            { icon: "🔄", label: "Transfers", desc: "Last 10 transactions" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#0f1623] border border-white/10 rounded-xl p-4"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs font-semibold text-white mb-1">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

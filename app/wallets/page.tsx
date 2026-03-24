import TableOfContents from "@/components/TableOfContents";
import WalletCategoryTabs from "@/components/WalletCategoryTabs";
import { AFFILIATE_LINKS } from "@/lib/affiliate";

export const metadata = {
  title: "Best TAO Wallets 2025 — Browser, Mobile & Hardware",
  description: "Compare the best wallets for storing and staking TAO. Talisman, Crucible, TAO.com, Nova Wallet, Zengo, Ledger — verified reviews with direct download links.",
  keywords: "TAO wallet, Bittensor wallet, Talisman TAO, best TAO wallet, TAO staking wallet, Ledger Bittensor",
  openGraph: {
    title: "Best TAO Wallets 2025 — Browser, Mobile & Hardware",
    description: "Compare the best wallets for storing and staking TAO. Verified reviews with direct download links.",
    url: "https://taopulse.io/wallets",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best TAO Wallets 2025 — Browser, Mobile & Hardware",
    description: "Compare the best wallets for storing and staking TAO. Verified reviews with direct download links.",
  },
  alternates: { canonical: "https://taopulse.io/wallets" },
};

const BEST_FOR_YOU = [
  {
    question: "New to crypto, want simplest option?",
    answer: "TAO.com",
    color: "border-emerald-600/30 bg-emerald-600/5",
    labelColor: "text-emerald-400",
  },
  {
    question: "Want browser wallet with full features?",
    answer: "Talisman",
    color: "border-purple-600/30 bg-purple-600/5",
    labelColor: "text-purple-400",
  },
  {
    question: "Want automated staking optimization?",
    answer: "Crucible",
    color: "border-emerald-600/30 bg-emerald-600/5",
    labelColor: "text-emerald-400",
  },
  {
    question: "Storing $1,000+ long-term?",
    answer: "Ledger + Talisman",
    color: "border-blue-600/30 bg-blue-600/5",
    labelColor: "text-blue-400",
  },
  {
    question: "Want no seed phrase risk?",
    answer: "Zengo",
    color: "border-amber-600/30 bg-amber-600/5",
    labelColor: "text-amber-400",
  },
];

const COMPARISON_TABLE = [
  { wallet: "TAO.com", type: "Mobile", tao: true, staking: true, ledger: false, beginnerStars: 5, cost: "Free" },
  { wallet: "Talisman", type: "Browser", tao: true, staking: true, ledger: true, beginnerStars: 4, cost: "Free" },
  { wallet: "Crucible", type: "Web", tao: true, staking: true, stakingNote: "Smart", ledger: true, beginnerStars: 3, cost: "Free" },
  { wallet: "Bittensor Ext", type: "Browser", tao: true, staking: true, ledger: false, beginnerStars: 3, cost: "Free" },
  { wallet: "Nova Wallet", type: "Mobile", tao: true, staking: true, ledger: true, ledgerNote: "BT", beginnerStars: 3, cost: "Free" },
  { wallet: "Zengo", type: "Mobile", tao: true, staking: false, stakingNote: "Partial", ledger: false, beginnerStars: 4, cost: "Free" },
  { wallet: "Ledger", type: "Hardware", tao: true, taoNote: "*", staking: true, stakingNote: "*", ledger: false, ledgerLabel: "N/A", beginnerStars: 2, cost: "$79+" },
  { wallet: "Polkadot Vault", type: "Hardware", tao: true, staking: true, ledger: false, ledgerLabel: "N/A", beginnerStars: 1, cost: "Free" },
];

function CheckIcon({ yes }: { yes: boolean }) {
  return yes ? (
    <span className="text-emerald-400 text-sm font-semibold">✅</span>
  ) : (
    <span className="text-gray-600 text-sm">❌</span>
  );
}

function BeginnerStars({ count }: { count: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-tight">
      {"⭐".repeat(count)}
    </span>
  );
}

const TOC_SECTIONS = [
  { id: "best-for-you", label: "Best For You" },
  { id: "comparison", label: "Comparison" },
  { id: "browser-wallets", label: "Browser Wallets" },
  { id: "mobile-wallets", label: "Mobile Wallets" },
  { id: "hardware-wallets", label: "Hardware Wallets" },
];

export default function WalletsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-12">
        <div className="flex-1 min-w-0 max-w-3xl">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              TAO Wallets
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Best Wallets for TAO
            </h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
              Choosing the right wallet is your first step in the Bittensor ecosystem.
              All 8 wallets listed here are verified — with confirmed TAO support and real download links.
            </p>
          </div>

          {/* Best for You */}
          <section id="best-for-you" className="mb-10">
            <h2 className="text-sm font-semibold text-white mb-4">Best for You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BEST_FOR_YOU.map((item) => (
                <div
                  key={item.question}
                  className={`rounded-xl border p-4 ${item.color}`}
                >
                  <p className="text-sm text-gray-300 mb-2">{item.question}</p>
                  <p className={`text-sm font-semibold ${item.labelColor}`}>
                    → {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison Table */}
          <section id="comparison" className="bg-[#0f1623] rounded-xl border border-white/10 overflow-hidden mb-10">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">Quick Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a0f1a] border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Wallet</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">TAO</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Staking</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Ledger</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Beginner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {COMPARISON_TABLE.map((row, idx) => (
                    <tr
                      key={row.wallet}
                      className={idx % 2 === 0 ? "bg-[#0f1623]" : "bg-[#0b1019]"}
                    >
                      <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.wallet}</td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{row.type}</td>
                      <td className="px-4 py-3 text-center">
                        {row.taoNote ? (
                          <span className="text-emerald-400 text-xs font-semibold">✅{row.taoNote}</span>
                        ) : (
                          <CheckIcon yes={row.tao} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.stakingNote ? (
                          <span className="text-xs text-emerald-400 font-medium">{row.stakingNote}</span>
                        ) : (
                          <CheckIcon yes={row.staking} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {row.ledgerLabel ? (
                          <span className="text-xs text-gray-500">{row.ledgerLabel}</span>
                        ) : row.ledgerNote ? (
                          <span className="text-xs text-emerald-400 font-medium">✅ {row.ledgerNote}</span>
                        ) : (
                          <CheckIcon yes={row.ledger} />
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <BeginnerStars count={row.beginnerStars} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-2 text-xs text-gray-600 border-t border-white/5">* Via Talisman companion wallet</p>
            </div>
          </section>

          {/* Wallet Category Tabs */}
          <section className="mb-10">
            <h2 className="text-base font-semibold text-white mb-6">Wallet Details</h2>
            <WalletCategoryTabs />
          </section>

          {/* Disclaimer */}
          <div className="mt-10 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-400">
              {(AFFILIATE_LINKS.ledger.hasAffiliate || AFFILIATE_LINKS.talisman.hasAffiliate || AFFILIATE_LINKS.crucible.hasAffiliate)
                ? "Some links on this page are affiliate links — TaoPulse may earn a commission if you make a purchase at no extra cost to you. Our rankings are not influenced by affiliate relationships."
                : "TaoPulse is not affiliated with any wallet provider and does not earn commissions."
              }{" "}
              Information was verified at time of writing but may change — always check official sources. Never share your seed phrase with anyone.
            </p>
          </div>

        </div>

        {/* Sticky TOC */}
        <div className="hidden lg:block w-48 shrink-0">
          <TableOfContents sections={TOC_SECTIONS} />
        </div>
      </div>
    </div>
  );
}

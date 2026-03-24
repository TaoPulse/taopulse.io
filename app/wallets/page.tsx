export const metadata = {
  title: "TAO Wallets | TaoPulse",
  description:
    "Compare the best wallets for storing and staking TAO. Find the right wallet for your needs — beginner, holder, staker, or security-focused user.",
};

interface Wallet {
  name: string;
  subtitle?: string;
  type: string;
  platforms: string[];
  pros: string[];
  cons: string[];
  rating: number;
  securityRating?: number;
  badge?: string;
  badgeColor?: string;
  description: string;
  bestFor: string;
  url: string;
  urlLabel: string;
  setupNote?: string;
}

const CATEGORIES: { emoji: string; label: string; wallets: Wallet[] }[] = [
  {
    emoji: "🌐",
    label: "Browser Extensions (Best for Staking & dApps)",
    wallets: [
      {
        name: "Talisman",
        type: "Browser Extension",
        platforms: ["Chrome", "Firefox", "Brave"],
        pros: [
          "Open source + audited",
          "TAO staking built-in",
          "Ledger hardware wallet support",
          "Modern, polished UI",
          "900+ chains supported",
        ],
        cons: ["Browser extension only — no standalone mobile app"],
        rating: 5,
        badge: "Top Pick",
        badgeColor: "bg-purple-600/15 text-purple-400 border-purple-600/30",
        description:
          'The "gold standard" for the Bittensor ecosystem. Talisman is open-source, multi-chain (Polkadot, Ethereum, Solana), with dedicated TAO support, built-in staking, and Ledger hardware wallet integration. The go-to choice for desktop users who want the full TAO feature set.',
        bestFor: "Best for: Desktop users wanting full TAO features",
        url: "https://talisman.xyz",
        urlLabel: "talisman.xyz",
      },
      {
        name: "Crucible",
        subtitle: "Smart Allocator",
        type: "Web Wallet (no download needed)",
        platforms: ["Any browser"],
        pros: [
          "Smart Allocator auto-optimizes staking yield across subnets",
          "Ledger hardware wallet support",
          "TAO-native — purpose-built for Bittensor",
        ],
        cons: [
          "Web-based is less secure than a browser extension",
          "Minor sync delays reported",
        ],
        rating: 4,
        badge: "Smart Allocator",
        badgeColor: "bg-emerald-600/15 text-emerald-400 border-emerald-600/30",
        description:
          "Specialized Bittensor wallet with a standout feature: the Smart Allocator automatically rebalances your stake across the most productive subnets to optimize yield. Supports Ledger integration. No install required — just open in your browser.",
        bestFor: "Best for: Investors who want automated staking optimization",
        url: "https://crucible.wtf",
        urlLabel: "crucible.wtf",
      },
      {
        name: "Bittensor Wallet",
        subtitle: "by Tensora Group",
        type: "Chrome Extension",
        platforms: ["Chrome"],
        pros: [
          "Official Bittensor ecosystem wallet",
          "Subnet performance charts built-in",
          "Non-custodial",
          "Dynamic staking support",
        ],
        cons: ["Chrome only"],
        rating: 4,
        badge: "Official",
        badgeColor: "bg-blue-600/15 text-blue-400 border-blue-600/30",
        description:
          'Native non-custodial Chrome extension from the Tensora Group. Supports transfers, dynamic staking, and viewing subnet performance charts directly in-wallet. Find it on the Chrome Web Store by searching "Bittensor Wallet by Tensora".',
        bestFor: "Best for: Active users who want to monitor subnet performance",
        url: "https://chromewebstore.google.com",
        urlLabel: "Chrome Web Store",
      },
    ],
  },
  {
    emoji: "📱",
    label: "Mobile Wallets (Best for Portability)",
    wallets: [
      {
        name: "TAO.com",
        type: "Mobile App",
        platforms: ["iOS", "Android"],
        pros: [
          "iOS + Android",
          "Buy TAO directly in-app (fiat on-ramp)",
          "Face ID / biometric security",
          "Beginner-friendly interface",
          "Official lineage from Opentensor Foundation",
        ],
        cons: ["Newer app — less battle-tested than some alternatives"],
        rating: 5,
        badge: "Best for Beginners",
        badgeColor: "bg-emerald-600/15 text-emerald-400 border-emerald-600/30",
        description:
          "Evolved from the original Opentensor Foundation wallet. Highly beginner-friendly with biometric security (Face ID), a built-in fiat on-ramp to buy TAO directly in-app, and a clean modern interface. The easiest way to get started with TAO on mobile.",
        bestFor: "Best for: Complete beginners and mobile-first users",
        url: "https://tao.com",
        urlLabel: "tao.com",
      },
      {
        name: "Nova Wallet",
        type: "Mobile App",
        platforms: ["iOS", "Android"],
        pros: [
          "Ledger Bluetooth support (hardware security on mobile)",
          "Powerful multi-chain features",
          "Stake TAO via built-in browser (Taostats.io)",
        ],
        cons: ["Steeper learning curve than TAO.com"],
        rating: 4,
        description:
          "Powerful mobile option for users who want more control. Nova Wallet supports Ledger over Bluetooth — hardware-level security without a desktop. Stake TAO via the built-in browser connecting to Taostats.io.",
        bestFor: "Best for: Mobile users who want Ledger security without a desktop",
        url: "https://novawallet.io",
        urlLabel: "novawallet.io",
      },
      {
        name: "Zengo",
        subtitle: "No Seed Phrase Required",
        type: "Mobile App",
        platforms: ["iOS", "Android"],
        pros: [
          "No seed phrase — MPC (Multi-Party Computation) security",
          "Biometric recovery if you lose your device",
          "No risk of losing a 12-word recovery phrase",
        ],
        cons: [
          "Custodial elements — Zengo holds part of the key",
          "Newer TAO support",
        ],
        rating: 4,
        badge: "No Seed Phrase",
        badgeColor: "bg-amber-600/15 text-amber-400 border-amber-600/30",
        description:
          "Uses MPC (Multi-Party Computation) instead of a traditional 12-word seed phrase. Your private key is split between you and Zengo — no single point of failure. A strong choice if you are worried about losing your recovery phrase.",
        bestFor: "Best for: Users who are nervous about managing a seed phrase",
        url: "https://zengo.com",
        urlLabel: "zengo.com",
      },
    ],
  },
  {
    emoji: "🔐",
    label: "Hardware Wallets (Best for Maximum Security)",
    wallets: [
      {
        name: "Ledger",
        type: "Hardware Wallet",
        platforms: ["Nano S Plus (~$79)", "Nano X (~$149)", "Flex", "Stax"],
        pros: [
          "Most widely supported hardware wallet",
          "TAO works via Talisman or Crucible",
          "Physical confirmation required for every transaction",
          "Battle-tested — 10M+ users",
        ],
        cons: [
          "TAO not visible in Ledger Live — requires Talisman or Crucible",
          "Costs money (hardware purchase required)",
        ],
        rating: 5,
        badge: "Top Pick for Security",
        badgeColor: "bg-blue-600/15 text-blue-400 border-blue-600/30",
        description:
          "The gold standard for securing large crypto holdings. Your private keys never leave the device. Note: you cannot see your TAO balance in Ledger Live directly — connect your Ledger to Talisman or Crucible to manage TAO with full hardware security.",
        bestFor: "Best for: Anyone holding significant TAO ($1,000+) long-term",
        url: "https://ledger.com",
        urlLabel: "ledger.com",
        setupNote:
          "Setup: Buy Ledger → Install Talisman browser extension → Connect Ledger to Talisman → Manage TAO securely",
      },
      {
        name: "Polkadot Vault",
        subtitle: "formerly Parity Signer",
        type: "Air-Gapped Cold Storage",
        platforms: ["Old iOS phone", "Old Android phone"],
        pros: [
          "Free — turns an old offline smartphone into a hardware wallet",
          "Maximum security — device never connects to internet",
          "Transactions signed via QR code (air-gapped)",
          "Open source",
        ],
        cons: [
          "Complex setup — requires a spare phone",
          "Less convenient for regular use",
        ],
        rating: 4,
        securityRating: 4,
        badge: "Air-Gapped",
        badgeColor: "bg-gray-600/15 text-gray-400 border-gray-600/30",
        description:
          "Turn an old offline smartphone into a cold-storage hardware wallet. Signs transactions via QR codes — the device never connects to the internet. Maximum security with zero hardware cost, but requires technical setup and a spare phone.",
        bestFor:
          "Best for: Security experts who want maximum protection without spending money",
        url: "https://paritytech.github.io/parity-signer/",
        urlLabel: "paritytech.github.io",
      },
    ],
  },
];

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

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-gray-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-xs text-gray-500">{rating}/{max}</span>
    </div>
  );
}

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

export default function WalletsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <div className="mb-10">
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
      </div>

      {/* Comparison Table */}
      <div className="bg-[#0f1623] rounded-xl border border-white/10 overflow-hidden mb-10">
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
      </div>

      {/* Categorized detailed cards */}
      <div className="space-y-10">
        {CATEGORIES.map((category) => (
          <div key={category.label}>
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span>{category.emoji}</span>
              <span>{category.label}</span>
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {category.wallets.map((wallet) => (
                <div
                  key={wallet.name}
                  className="bg-[#0f1623] rounded-xl border border-white/10 p-6 hover:border-purple-600/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{wallet.name}</h3>
                        {wallet.subtitle && (
                          <span className="text-xs text-gray-500">— {wallet.subtitle}</span>
                        )}
                        {wallet.badge && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${wallet.badgeColor}`}
                          >
                            {wallet.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500">{wallet.type}</span>
                        <span className="text-gray-700">·</span>
                        <StarRating rating={wallet.rating} />
                        <span className="text-gray-700">·</span>
                        <a
                          href={wallet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {wallet.urlLabel} →
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {wallet.platforms.map((p) => (
                        <span
                          key={p}
                          className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-3">
                    {wallet.description}
                  </p>

                  {wallet.setupNote && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-blue-600/5 border border-blue-600/20">
                      <p className="text-xs text-blue-300">
                        <span className="font-semibold">Setup guide: </span>
                        {wallet.setupNote}
                      </p>
                    </div>
                  )}

                  <p className="text-xs font-medium text-gray-500 mb-5">
                    {wallet.bestFor}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2.5">
                        Pros
                      </h4>
                      <ul className="space-y-1.5">
                        {wallet.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-2 text-sm text-gray-300">
                            <svg
                              className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2.5">
                        Cons
                      </h4>
                      <ul className="space-y-1.5">
                        {wallet.cons.map((con) => (
                          <li key={con} className="flex items-start gap-2 text-sm text-gray-300">
                            <svg
                              className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-400">
          TaoPulse is not affiliated with any wallet provider and does not earn commissions. Information was verified at time of writing but may change — always check official sources. Never share your seed phrase with anyone.
        </p>
      </div>
    </div>
  );
}

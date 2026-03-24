"use client";

import { useEffect, useState } from "react";

interface Wallet {
  name: string;
  subtitle?: string;
  type: string;
  platforms: string[];
  pros: string[];
  cons: string[];
  rating: number;
  badge?: string;
  badgeColor?: string;
  description: string;
  bestFor: string;
  url: string;
  urlLabel: string;
  url2?: string;
  url2Label?: string;
  setupNote?: string;
}

const CATEGORIES: { id: string; emoji: string; label: string; wallets: Wallet[] }[] = [
  {
    id: "browser-wallets",
    emoji: "🌐",
    label: "Browser Extensions",
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
        url: "https://talisman.xyz/download",
        urlLabel: "Install Extension",
      },
      {
        name: "Crucible",
        subtitle: "by Crucible Labs",
        type: "Chrome Extension",
        platforms: ["Chrome"],
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
          "TAO-native Chrome extension by Crucible Labs. Standout feature: Smart Allocator automatically stakes your rewards across top-performing subnets via a secure proxy key — your coldkey never leaves your control. Independently audited. 4.3★ on Chrome Web Store, updated March 2026.",
        bestFor: "Best for: Investors who want automated staking optimization",
        url: "https://chromewebstore.google.com/detail/crucible-wallet/capjnhbneiilplogojhmhepiocnjpgee",
        urlLabel: "Install Extension",
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
        url: "https://chromewebstore.google.com/search/bittensor%20wallet",
        urlLabel: "Install Extension",
      },
    ],
  },
  {
    id: "mobile-wallets",
    emoji: "📱",
    label: "Mobile Wallets",
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
        url: "https://apps.apple.com/app/tao-bittensor-wallet/id6479912342",
        urlLabel: "iOS App Store",
        url2: "https://play.google.com/store/search?q=tao+bittensor+wallet",
        url2Label: "Google Play",
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
        url: "https://apps.apple.com/app/nova-polkadot-kusama-wallet/id1597119769",
        urlLabel: "iOS App Store",
        url2: "https://play.google.com/store/search?q=nova+polkadot+kusama+wallet",
        url2Label: "Google Play",
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
        url: "https://zengo.com/get-zengo/",
        urlLabel: "Download App",
      },
    ],
  },
  {
    id: "hardware-wallets",
    emoji: "🔐",
    label: "Hardware Wallets",
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
        url: "https://shop.ledger.com/products/ledger-nano-s-plus", // swap with affiliate URL once you have it: https://shop.ledger.com/products/ledger-nano-s-plus?r=YOUR_CODE
        urlLabel: "Buy Ledger Nano S Plus ($79)",
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
        badge: "Air-Gapped",
        badgeColor: "bg-gray-600/15 text-gray-400 border-gray-600/30",
        description:
          "Turn an old offline smartphone into a cold-storage hardware wallet. Signs transactions via QR codes — the device never connects to the internet. Maximum security with zero hardware cost, but requires technical setup and a spare phone.",
        bestFor:
          "Best for: Security experts who want maximum protection without spending money",
        url: "https://github.com/paritytech/parity-signer/releases",
        urlLabel: "Download on GitHub",
      },
    ],
  },
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
      <span className="ml-1.5 text-xs text-gray-500">
        {rating}/{max}
      </span>
    </div>
  );
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6 hover:border-purple-600/30 transition-colors">
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
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <a
              href={wallet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/15 border border-purple-600/30 text-purple-400 text-xs font-medium hover:bg-purple-600/25 transition-colors"
            >
              {wallet.urlLabel} →
            </a>
            {wallet.url2 && wallet.url2Label && (
              <a
                href={wallet.url2}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/15 border border-purple-600/30 text-purple-400 text-xs font-medium hover:bg-purple-600/25 transition-colors"
              >
                {wallet.url2Label} →
              </a>
            )}
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

      <p className="text-xs font-medium text-gray-500 mb-5">{wallet.bestFor}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2.5">
            Pros
          </h4>
          <ul className="space-y-1.5">
            {wallet.pros.map((pro) => (
              <li
                key={pro}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <svg
                  className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
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
              <li
                key={con}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <svg
                  className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const TAB_IDS = ["browser-wallets", "mobile-wallets", "hardware-wallets"] as const;
type TabId = (typeof TAB_IDS)[number];

const TAB_LABELS: Record<TabId, string> = {
  "browser-wallets": "🌐 Browser Extensions",
  "mobile-wallets": "📱 Mobile Wallets",
  "hardware-wallets": "🔐 Hardware Wallets",
};

export default function WalletCategoryTabs() {
  const [active, setActive] = useState<TabId>("browser-wallets");

  useEffect(() => {
    const hash = window.location.hash.slice(1) as TabId;
    if (TAB_IDS.includes(hash)) setActive(hash);
  }, []);

  const activeCategory = CATEGORIES.find((c) => c.id === active)!;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap border-b border-white/10 mb-6 gap-0">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            id={id}
            onClick={() => setActive(id)}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              active === id
                ? "text-white border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 gap-6">
        {activeCategory.wallets.map((wallet) => (
          <WalletCard key={wallet.name} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}

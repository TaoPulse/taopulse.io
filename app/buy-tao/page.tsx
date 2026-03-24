import Link from "next/link";
import { AFFILIATE_LINKS } from "@/lib/affiliate";

export const metadata = {
  title: "How to Buy TAO (Bittensor) — Best Exchanges & Step-by-Step Guide",
  description: "Where and how to buy TAO (Bittensor). Compare exchanges like Kraken, Coinbase and OKX. Step-by-step guide for US and international buyers.",
  keywords: "buy TAO, buy Bittensor, TAO exchange, how to buy TAO, TAO Kraken, TAO Coinbase",
  openGraph: {
    title: "How to Buy TAO (Bittensor) — Best Exchanges & Step-by-Step Guide",
    description: "Where and how to buy TAO (Bittensor). Compare exchanges like Kraken, Coinbase and OKX.",
    url: "https://taopulse.io/buy-tao",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Buy TAO (Bittensor) — Best Exchanges & Step-by-Step Guide",
    description: "Where and how to buy TAO (Bittensor). Compare exchanges like Kraken, Coinbase and OKX.",
  },
  alternates: { canonical: "https://taopulse.io/buy-tao" },
};

type Exchange = {
  name: string;
  badge?: string;
  badgeColor?: string;
  pros: string[];
  cons: string[];
  href: string;
  available: string;
  pairs: string[];
  highlight?: boolean;
  affiliate?: boolean;
};

const exchanges: Exchange[] = [
  {
    name: "Kraken",
    badge: "⭐ Recommended for US",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    pros: [
      "Regulated US exchange",
      "High security, strong reputation",
      "TAO/USD pair available",
      "Best choice for US residents",
    ],
    cons: ["Higher fees than some alternatives"],
    href: AFFILIATE_LINKS.kraken.url,
    available: "US, Europe, globally (except some countries)",
    pairs: ["TAO/USD", "TAO/EUR"],
    highlight: true,
    affiliate: AFFILIATE_LINKS.kraken.hasAffiliate,
  },
  {
    name: "Binance",
    badge: "Largest by volume",
    badgeColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    pros: [
      "Highest liquidity globally",
      "Lowest fees",
      "Many TAO trading pairs",
    ],
    cons: ["Not available in USA", "Complex for beginners"],
    href: AFFILIATE_LINKS.binance.url,
    available: "Most countries (NOT USA)",
    pairs: ["TAO/USDT"],
    affiliate: AFFILIATE_LINKS.binance.hasAffiliate,
  },
  {
    name: "Gate.io",
    pros: [
      "Available in more countries",
      "Good TAO liquidity",
    ],
    cons: ["Less well-known", "Higher risk than Kraken/Binance"],
    href: AFFILIATE_LINKS.gateio.url,
    available: "Most countries",
    pairs: ["TAO/USDT"],
    affiliate: AFFILIATE_LINKS.gateio.hasAffiliate,
  },
  {
    name: "MEXC",
    pros: ["Available widely", "TAO support"],
    cons: ["Less regulated"],
    href: AFFILIATE_LINKS.mexc.url,
    available: "Most countries",
    pairs: ["TAO/USDT"],
    affiliate: AFFILIATE_LINKS.mexc.hasAffiliate,
  },
];

const krakensteps = [
  {
    step: 1,
    title: "Create your account at kraken.com",
    body: 'Click "Create Account", verify your email, then complete KYC identity verification — required by law. Typically takes 1–2 business days.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Fund your account",
    body: 'Go to "Funding" → "Deposit". Bank transfer: free, takes 1–3 days. Debit card: instant, ~1.5% fee.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Buy TAO",
    body: 'Go to "Buy Crypto" or search TAO. Enter amount (start small — even $50), review the current price and fees, then click "Buy TAO".',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Secure your TAO",
    body: "Move your TAO to a personal wallet after buying — don't leave it on the exchange long-term.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    warning: true,
  },
];

export default function BuyTaoPage() {
  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/15 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Buying Guide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            How to Buy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              TAO
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Step-by-step guide to purchasing TAO on major exchanges
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Warning banner */}
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-300 leading-relaxed">
            <strong className="font-semibold">Security warning:</strong> Only buy TAO from the official exchanges listed below. Beware of scams, fake tokens, and phishing sites.
          </p>
        </div>

        {/* Where to Buy */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Where to Buy TAO</h2>
          <p className="text-gray-400 mb-6">Verified exchanges with TAO listings</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exchanges.map((ex) => (
              <div
                key={ex.name}
                className={`rounded-xl border p-6 hover:border-purple-600/40 transition-colors ${
                  ex.highlight
                    ? "border-purple-600/30 bg-purple-600/5"
                    : "border-white/10 bg-[#0f1623]"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{ex.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {ex.badge && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ex.badgeColor}`}>
                          {ex.badge}
                        </span>
                      )}
                      {ex.pairs.map((p) => (
                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-white/5 border-white/10 text-gray-400">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <a
                      href={ex.href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Visit
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {ex.affiliate && (
                      <span className="text-[10px] text-gray-600">affiliate link</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">Available: {ex.available}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pros</h4>
                    <ul className="space-y-1.5">
                      {ex.pros.map((p) => (
                        <li key={p} className="flex items-start gap-1.5 text-xs text-gray-300">
                          <svg className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Cons</h4>
                    <ul className="space-y-1.5">
                      {ex.cons.map((c) => (
                        <li key={c} className="flex items-start gap-1.5 text-xs text-gray-400">
                          <svg className="w-3 h-3 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-step Kraken guide */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Step-by-Step: Buy TAO on Kraken</h2>
          <p className="text-gray-400 mb-6">The most beginner-friendly option for US buyers</p>
          <div className="space-y-3">
            {krakensteps.map((step) => (
              <div
                key={step.step}
                className={`rounded-xl border p-5 ${
                  step.warning
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-white/10 bg-[#0f1623]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.warning
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-purple-600/20 text-purple-400"
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Step {step.step}</span>
                      {step.warning && (
                        <span className="text-xs font-medium text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Important
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1.5">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.body}</p>
                    {step.warning && (
                      <Link
                        href="/wallets"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      >
                        See wallet guide →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Warning box */}
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-300 leading-relaxed">
              <strong className="font-semibold">Don&apos;t leave TAO on an exchange.</strong> Exchanges can be hacked or freeze withdrawals. Move your TAO to a personal wallet after buying.
            </p>
          </div>
        </section>

        {/* After You Buy */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">After You Buy — Next Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0f1623] rounded-xl border border-emerald-500/20 p-5">
              <div className="text-emerald-400 text-xl mb-3">✅</div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Move to a personal wallet</h3>
              <p className="text-xs text-gray-400 leading-relaxed">The safest way to hold TAO long-term. You control your keys.</p>
              <Link href="/wallets" className="inline-flex items-center gap-1 mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                See wallets →
              </Link>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-blue-500/20 p-5">
              <div className="text-blue-400 text-xl mb-3">✅</div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Consider staking for yield</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Delegate your TAO to validators and earn passive rewards.</p>
              <Link href="/staking" className="inline-flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Learn staking →
              </Link>
            </div>
            <div className="bg-[#0f1623] rounded-xl border border-purple-500/20 p-5">
              <div className="text-purple-400 text-xl mb-3">✅</div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Learn about subnets</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Explore the 128+ specialized AI competitions on the network.</p>
              <Link href="/subnets" className="inline-flex items-center gap-1 mt-3 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Browse subnets →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-purple-600/20 bg-purple-600/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Now that you have TAO, store it safely</h2>
          <p className="text-gray-400 mb-6 text-sm">A personal wallet gives you full custody — no exchange risk.</p>
          <Link
            href="/wallets"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
          >
            Store TAO Safely →
          </Link>
        </section>

        {/* Affiliate Disclosure */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-5 py-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-500">Disclosure:</strong> Some links on this page may be affiliate links. If you sign up through them, TaoPulse may earn a commission at no extra cost to you. We only list exchanges we&apos;d genuinely recommend. Our editorial rankings are not influenced by affiliate relationships.
          </p>
        </div>
      </div>
    </div>
  );
}

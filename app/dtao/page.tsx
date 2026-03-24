import Link from "next/link";
import TableOfContents from "@/components/TableOfContents";

export const metadata = {
  title: "What is Dynamic TAO (dTAO)? — Bittensor Alpha Token Staking Explained",
  description:
    "Learn what Dynamic TAO (dTAO) is, how alpha tokens work, the difference between classic root staking and dTAO subnet staking, and the risks involved.",
  keywords:
    "dynamic TAO, dTAO, alpha token, Bittensor dTAO, subnet staking, TAO alpha, dTAO vs classic staking, impermanent loss TAO",
  openGraph: {
    title: "What is Dynamic TAO (dTAO)? — Bittensor Alpha Token Staking Explained",
    description:
      "Learn what Dynamic TAO (dTAO) is, how alpha tokens work, the difference between classic root staking and dTAO subnet staking, and the risks involved.",
    url: "https://taopulse.io/dtao",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is Dynamic TAO (dTAO)? — Bittensor Alpha Token Staking Explained",
    description:
      "Learn what Dynamic TAO (dTAO) is, how alpha tokens work, the difference vs classic staking, and the risks.",
  },
  alternates: { canonical: "https://taopulse.io/dtao" },
};

const TOC_SECTIONS = [
  { id: "what-is-dtao", label: "What is dTAO?" },
  { id: "classic-vs-dtao", label: "Classic vs dTAO" },
  { id: "how-alpha-works", label: "How Alpha Tokens Work" },
  { id: "alpha-halving", label: "Alpha Halving" },
  { id: "who-should-use", label: "Who Should Use dTAO?" },
  { id: "key-risks", label: "Key Risks" },
  { id: "faq", label: "FAQ" },
];

const FAQ = [
  {
    q: "Will my TAO convert to another token when I use dTAO staking?",
    a: "Yes. When you stake directly into a subnet using dTAO, your TAO is deposited into a liquidity pool and you receive the subnet's alpha token in return. Your TAO is no longer in your wallet as TAO.",
  },
  {
    q: "Can I lose money with dTAO staking?",
    a: "Yes. If the alpha token price drops relative to TAO after you stake, you'll get back less TAO when you unstake than you originally put in — even if you earned staking rewards. This is called impermanent loss, and it's a real risk with dTAO.",
  },
  {
    q: "How is dTAO different from classic root staking?",
    a: "With classic root staking, your TAO stays as TAO and earns TAO rewards — simpler, lower risk. With dTAO, your TAO converts to a subnet alpha token with its own price, giving you higher upside potential but also higher downside risk.",
  },
  {
    q: "What is impermanent loss in the context of dTAO?",
    a: "Impermanent loss happens when the price ratio between TAO and the alpha token changes after you deposit. If the alpha token price moves significantly (up or down), you end up with a different mix of assets than you started with. The loss is 'impermanent' only if prices return to the original ratio.",
  },
  {
    q: "Does each subnet have its own halving schedule?",
    a: "Yes. Each subnet's alpha token has its own emission schedule with its own halving. This is independent of the main TAO halving schedule. Alpha token halvings affect how many alpha tokens are emitted to that subnet's validators and miners.",
  },
  {
    q: "How do I get started with dTAO staking?",
    a: "You can use the btcli command-line tool with the stake command targeting a specific subnet, or use a wallet that supports dTAO like Talisman or Crucible. Start with a small amount to understand the mechanics before committing significant capital.",
  },
];

function DangerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 leading-relaxed">
      {children}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-500/30 bg-blue-500/8 px-4 py-3 text-sm text-blue-200 leading-relaxed">
      {children}
    </div>
  );
}

export default function DTaoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-12">
        <div className="flex-1 min-w-0 max-w-3xl">
          <div className="space-y-14">

            {/* Hero */}
            <section className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Advanced Feature
              </div>
              <h1 className="text-3xl font-bold text-white">What is Dynamic TAO (dTAO)?</h1>
              <p className="text-gray-400 leading-relaxed">
                Dynamic TAO — often called <strong className="text-white">dTAO</strong> — is a major upgrade to the
                Bittensor staking system launched in late 2024. It introduced subnet-specific tokens called{" "}
                <strong className="text-white">alpha tokens</strong>, giving stakers the ability to directly invest
                in individual subnets — with higher potential rewards and higher risk.
              </p>
              <DangerBox>
                ⚠️ <strong>dTAO is for advanced users.</strong> If you&apos;re new to Bittensor, start with classic root
                staking first.{" "}
                <Link href="/staking" className="underline hover:text-red-200">See the beginner staking guide →</Link>
              </DangerBox>
            </section>

            {/* What is dTAO */}
            <section id="what-is-dtao" className="space-y-4">
              <h2 className="text-xl font-bold text-white">What is dTAO?</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  Before dTAO, there was only one token: TAO (τ). All staking happened at the root subnet level,
                  and all rewards were paid in TAO. Simple, but it meant stakers couldn&apos;t directly back
                  individual subnets they believed in.
                </p>
                <p>
                  With dTAO, each of Bittensor&apos;s 128+ subnets now has its own <strong className="text-white">alpha token</strong>.
                  When you stake into a subnet using dTAO, your TAO goes into that subnet&apos;s liquidity pool and
                  you receive alpha tokens. The alpha token has its own market price — it can go up if the subnet
                  grows, or down if it loses momentum.
                </p>
                <InfoBox>
                  ℹ️ <strong>Alpha token naming:</strong> Each subnet&apos;s alpha token is named after that subnet.
                  For example, Subnet 8 (Proprioception) has its own alpha token. The price of each alpha token
                  is determined by supply and demand in its liquidity pool.
                </InfoBox>
              </div>
            </section>

            {/* Classic vs dTAO */}
            <section id="classic-vs-dtao" className="space-y-5">
              <h2 className="text-xl font-bold text-white">Classic Root Staking vs dTAO Subnet Staking</h2>
              <p className="text-sm text-gray-400">
                These are two fundamentally different ways to stake TAO. Understanding the differences is essential
                before you decide which to use.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Classic */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">Recommended for Beginners</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">Classic Root Staking</h3>
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Stake TAO → stay in TAO</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Earn TAO yield (est. 15–20% APY)</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Lower risk — no alpha token exposure</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> No impermanent loss</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Easy to start and unstake</li>
                  </ul>
                </div>

                {/* dTAO */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-wider">Advanced</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">dTAO Subnet Staking</h3>
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span> Stake TAO → receive alpha tokens</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span> Earn rewards in alpha tokens</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span> Higher upside if subnet succeeds</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> Impermanent loss risk</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> Can end up with less TAO than you staked</li>
                  </ul>
                </div>
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-4 py-3 text-left font-semibold text-gray-400">Feature</th>
                      <th className="px-4 py-3 text-center font-semibold text-emerald-400">Classic Root</th>
                      <th className="px-4 py-3 text-center font-semibold text-amber-400">dTAO Subnet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {[
                      { feature: "Your stake stays as", classic: "TAO", dtao: "Alpha token" },
                      { feature: "Rewards paid in", classic: "TAO", dtao: "Alpha tokens" },
                      { feature: "Impermanent loss risk", classic: "None", dtao: "Yes" },
                      { feature: "Subnet failure risk", classic: "Low", dtao: "High" },
                      { feature: "Price exposure", classic: "TAO only", dtao: "TAO + alpha price" },
                      { feature: "Upside potential", classic: "Moderate", dtao: "High" },
                      { feature: "Complexity", classic: "Simple", dtao: "Complex" },
                      { feature: "Recommended for", classic: "All levels", dtao: "Advanced DeFi users" },
                    ].map((row) => (
                      <tr key={row.feature} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-400">{row.feature}</td>
                        <td className="px-4 py-3 text-center text-emerald-300">{row.classic}</td>
                        <td className="px-4 py-3 text-center text-amber-300">{row.dtao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* How Alpha Tokens Work */}
            <section id="how-alpha-works" className="space-y-4">
              <h2 className="text-xl font-bold text-white">How Alpha Tokens Work</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-5 text-sm text-gray-400 leading-relaxed">
                <p>
                  Each subnet maintains a <strong className="text-white">liquidity pool</strong> containing both TAO
                  and the subnet&apos;s alpha token. When you stake into a subnet:
                </p>

                <ol className="space-y-3">
                  {[
                    "Your TAO is deposited into the subnet's liquidity pool.",
                    "You receive alpha tokens based on the current pool ratio (price).",
                    "As the subnet attracts more stake, alpha token price typically rises.",
                    "You earn additional alpha tokens as staking rewards every tempo (~72 min).",
                    "When you unstake, your alpha tokens are converted back to TAO at the current price.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Example: How You Can Lose</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Stake 10 TAO → receive 200 alpha at 0.05 TAO/alpha</li>
                      <li>• Earn 20 more alpha as rewards (total: 220)</li>
                      <li>• Alpha price drops: 0.05 → 0.03 TAO</li>
                      <li className="text-red-300 font-semibold">• Unstake: 220 × 0.03 = 6.6 TAO (lost 3.4 TAO)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Example: How You Can Win</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Stake 10 TAO → receive 200 alpha at 0.05 TAO/alpha</li>
                      <li>• Earn 20 more alpha as rewards (total: 220)</li>
                      <li>• Alpha price rises: 0.05 → 0.10 TAO</li>
                      <li className="text-emerald-300 font-semibold">• Unstake: 220 × 0.10 = 22 TAO (doubled)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Alpha Halving */}
            <section id="alpha-halving" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Alpha Halving</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  Just like TAO has a halving schedule, each subnet&apos;s alpha token has its own{" "}
                  <strong className="text-white">independent halving schedule</strong>. This affects how many alpha
                  tokens are emitted to that subnet&apos;s validators and miners over time.
                </p>
                <div className="rounded-lg border border-white/10 bg-white/3 p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Points</p>
                  <ul className="space-y-2 text-gray-300">
                    {[
                      "Each subnet's alpha token emission rate follows its own schedule, set when the subnet was created.",
                      "Alpha halvings reduce the rate at which new alpha tokens are minted for that subnet.",
                      "This is separate from the main TAO halving — the two schedules are independent.",
                      "Alpha halvings can affect the alpha token price, as reduced supply may increase scarcity.",
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-600">
                  The main TAO halving schedule is separate.{" "}
                  <Link href="/halving" className="text-purple-400 hover:text-purple-300 underline">
                    See the TAO halving page →
                  </Link>
                </p>
              </div>
            </section>

            {/* Who Should Use */}
            <section id="who-should-use" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Who Should Use dTAO?</h2>

              <div className="space-y-3">
                {/* Should use */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">dTAO is a good fit if you…</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {[
                      "Have experience with DeFi and understand liquidity pools / impermanent loss",
                      "Have researched specific subnets and have conviction about their long-term value",
                      "Can afford to lose some of your staked amount if the subnet underperforms",
                      "Are comfortable monitoring your position and unstaking when needed",
                      "Already have classic staking as your base and want exposure to higher-risk/reward positions",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Should not use */}
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Stick to classic staking if you…</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {[
                      "Are new to Bittensor or crypto in general",
                      "Want predictable, stable TAO-denominated yield",
                      "Don't want to track alpha token prices or manage a more complex position",
                      "Are not familiar with DeFi mechanics like liquidity pools",
                      "Can't afford to receive less TAO back than you originally staked",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 shrink-0">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Risks */}
            <section id="key-risks" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Key Risks</h2>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-4 py-3 text-left font-semibold text-gray-400">Risk</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-400">Severity</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-400 hidden sm:table-cell">What it means</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {[
                      {
                        risk: "Impermanent loss",
                        severity: "High",
                        color: "text-red-400 bg-red-500/15",
                        desc: "Alpha token price changes relative to TAO after you stake, resulting in less TAO on unstake.",
                      },
                      {
                        risk: "Subnet failure",
                        severity: "High",
                        color: "text-red-400 bg-red-500/15",
                        desc: "If the subnet shuts down or loses emissions, the alpha token may become worthless.",
                      },
                      {
                        risk: "Alpha token volatility",
                        severity: "Medium",
                        color: "text-amber-400 bg-amber-500/15",
                        desc: "Alpha tokens are thinly traded and can move sharply on small buy/sell orders.",
                      },
                      {
                        risk: "Smart contract risk",
                        severity: "Low",
                        color: "text-emerald-400 bg-emerald-500/15",
                        desc: "Bittensor is blockchain-based, but protocol bugs could theoretically affect funds.",
                      },
                      {
                        risk: "Lost seed phrase",
                        severity: "Catastrophic",
                        color: "text-red-300 bg-red-600/20 font-bold",
                        desc: "Same as any crypto — lose your seed phrase, lose everything. No recovery possible.",
                      },
                    ].map((row) => (
                      <tr key={row.risk} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{row.risk}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${row.color}`}>{row.severity}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQ.map((item) => (
                  <div key={item.q} className="rounded-xl border border-white/10 bg-[#0f1623] p-5">
                    <p className="text-sm font-semibold text-white mb-1.5">{item.q}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Pages */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">Related Pages</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  href="/staking"
                  className="rounded-xl border border-white/10 bg-[#0f1623] p-4 hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors group"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300">How to Stake TAO →</p>
                  <p className="text-xs text-gray-500 mt-1">Start with classic staking — step-by-step guide</p>
                </Link>
                <Link
                  href="/subnets"
                  className="rounded-xl border border-white/10 bg-[#0f1623] p-4 hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors group"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300">Explore Subnets →</p>
                  <p className="text-xs text-gray-500 mt-1">Browse 128+ subnets to find dTAO opportunities</p>
                </Link>
              </div>
            </section>

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

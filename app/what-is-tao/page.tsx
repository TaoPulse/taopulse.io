import Link from "next/link";

export const metadata = {
  title: "What is TAO? Bittensor Explained for Beginners",
  description: "Learn what TAO and Bittensor are: a decentralized AI network rewarding machine learning with cryptocurrency. Why TAO is unique, how it works, and why investors are paying attention.",
  keywords: "what is TAO, what is Bittensor, TAO explained, Bittensor beginner guide, decentralized AI",
  openGraph: {
    title: "What is TAO? Bittensor Explained for Beginners",
    description: "Learn what TAO and Bittensor are: a decentralized AI network rewarding machine learning with cryptocurrency.",
    url: "https://taopulse.io/what-is-tao",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is TAO? Bittensor Explained for Beginners",
    description: "Learn what TAO and Bittensor are: a decentralized AI network rewarding machine learning with cryptocurrency.",
  },
  alternates: { canonical: "https://taopulse.io/what-is-tao" },
};

const stats = [
  { value: "$2.8B", label: "Market Cap" },
  { value: "21M", label: "Max Supply" },
  { value: "9.6M", label: "Circulating" },
  { value: "65+", label: "Active Subnets" },
  { value: "76%", label: "Supply Staked" },
];

const problems = [
  {
    title: "AI is controlled by a few giants",
    body: "OpenAI, Google, Anthropic control everything. No transparency, no competition, you pay what they charge.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "No way to value AI services",
    body: "How much is a good AI response worth? Centralized companies decide. Bittensor lets the market decide.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Talent is locked in silos",
    body: "Brilliant AI researchers work for one company. Bittensor lets anyone compete and earn.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Anyone creates a subnet",
    body: "A specialized AI competition — e.g. \"build the best trading signals\"",
  },
  {
    step: 2,
    title: "Miners compete",
    body: "Running AI models to produce the best outputs for that subnet",
  },
  {
    step: 3,
    title: "Validators score miners",
    body: "Fairly and objectively evaluating performance across the network",
  },
  {
    step: 4,
    title: "TAO flows to winners",
    body: "Better AI = more TAO rewards. The incentive drives quality.",
  },
  {
    step: 5,
    title: "The market decides value",
    body: "Subnets with useful AI get more TAO allocated to them",
  },
];

const whySpecial = [
  {
    title: "Fixed supply like Bitcoin",
    body: "Only 21 million TAO will ever exist",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    title: "Bitcoin-style halvings",
    body: "Emissions cut in half every ~4 years, making TAO more scarce over time",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    title: "No VC investors",
    body: "Founders self-funded. No institutional dump pressure.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    title: "Real utility",
    body: "TAO is used to run subnets, pay miners, and secure the network. Not just speculation.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "Decentralized AI",
    body: "The only major network where AI development happens in the open, rewarded by the market",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "Featured on All-In Podcast",
    body: "Chamath Palihapitiya and Jensen Huang (Nvidia CEO) discussed Bittensor in 2026. First major mainstream tech validation.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

const comparison = [
  {
    feature: "Decentralized",
    tao: { value: "Fully", check: true },
    openai: { value: "No", check: false },
    google: { value: "No", check: false },
    eth: { value: "Partial", partial: true },
  },
  {
    feature: "Fixed supply",
    tao: { value: "21M max", check: true },
    openai: { value: "No token", check: false },
    google: { value: "No token", check: false },
    eth: { value: "Inflationary", check: false },
  },
  {
    feature: "Open source AI",
    tao: { value: "Yes", check: true },
    openai: { value: "Closed", check: false },
    google: { value: "Closed", check: false },
    eth: { value: "Partial", partial: true },
  },
  {
    feature: "VC-free",
    tao: { value: "Yes", check: true },
    openai: { value: "$11B raised", check: false },
    google: { value: "Google", check: false },
    eth: { value: "VC-backed", check: false },
  },
  {
    feature: "Earning potential",
    tao: { value: "Mine/Stake", check: true },
    openai: { value: "No", check: false },
    google: { value: "No", check: false },
    eth: { value: "Limited", partial: true },
  },
];

function CellValue({ value, check, partial }: { value: string; check?: boolean; partial?: boolean }) {
  if (check) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
        <span className="text-emerald-400">✅</span> {value}
      </span>
    );
  }
  if (partial) {
    return <span className="text-amber-400 font-medium">{value}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-500">
      <span>❌</span> {value}
    </span>
  );
}

export default function WhatIsTaoPage() {
  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/20 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-400 text-xs font-medium mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bittensor Explained
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            What is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              TAO (Bittensor)?
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            The decentralized AI marketplace — and why it matters
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0f1623] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* Simple Explanation */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-5">The Simple Explanation</h2>
          <div className="bg-[#0f1623] rounded-xl border border-purple-600/20 p-6 sm:p-8">
            <p className="text-lg text-gray-200 leading-relaxed">
              Bittensor is a decentralized network where AI models compete to produce the best outputs. The best performers earn TAO — the network&apos;s native token.{" "}
              <span className="text-purple-400 font-semibold">
                Think of it as a stock market for artificial intelligence.
              </span>
            </p>
          </div>
        </section>

        {/* Problem It Solves */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">The Problem It Solves</h2>
          <p className="text-gray-400 mb-6">Why the AI industry needs a decentralized alternative</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problems.map((p) => (
              <div key={p.title} className="bg-[#0f1623] rounded-xl border border-white/10 p-6 hover:border-purple-600/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">How It Works</h2>
          <p className="text-gray-400 mb-6">The Bittensor incentive mechanism, step by step</p>
          <div className="space-y-3">
            {howItWorks.map((step) => (
              <div key={step.step} className="flex items-start gap-4 bg-[#0f1623] rounded-xl border border-white/10 p-5 hover:border-purple-600/20 transition-colors">
                <div className="shrink-0 w-9 h-9 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {step.title.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-purple-400">{part}</strong> : part
                    )}
                  </h3>
                  <p className="text-sm text-gray-400">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why TAO is Special */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Why TAO is Special</h2>
          <p className="text-gray-400 mb-6">Six key properties that differentiate TAO from other crypto and AI projects</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whySpecial.map((item, i) => (
              <div key={item.title} className={`rounded-xl border p-5 ${item.bg} ${item.border} hover:scale-[1.01] transition-transform`}>
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-bold ${item.color} opacity-60`}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className={`text-sm font-semibold ${item.color} mb-1.5`}>{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">TAO vs Competitors</h2>
          <p className="text-gray-400 mb-6">How Bittensor stacks up against centralized AI alternatives</p>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0a0f1a] border-b border-white/10">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Feature</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-purple-400">TAO</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">OpenAI</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Google AI</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Ethereum AI</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, idx) => (
                    <tr key={row.feature} className={idx % 2 === 0 ? "bg-[#0f1623]" : "bg-[#0b1019]"}>
                      <td className="px-5 py-3.5 text-sm font-medium text-white">{row.feature}</td>
                      <td className="px-5 py-3.5 text-sm">
                        <CellValue {...row.tao} />
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <CellValue {...row.openai} />
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <CellValue {...row.google} />
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <CellValue {...row.eth} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-purple-600/20 bg-purple-600/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-gray-400 mb-6 text-sm">Buy TAO on a regulated exchange, then store it safely in a personal wallet.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/buy-tao"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
            >
              Buy TAO →
            </Link>
            <Link
              href="/wallets"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
            >
              Store TAO Safely →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

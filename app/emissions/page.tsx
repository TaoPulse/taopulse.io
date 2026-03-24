import Link from "next/link";
import TableOfContents from "@/components/TableOfContents";

export const metadata = {
  title: "How TAO Emissions Work — Bittensor Emission Model Explained",
  description:
    "Learn how TAO emissions work on the Bittensor network. Covers the ~3,600 TAO/day emission schedule, the Taoflow model, subnet distribution via Yuma Consensus, and what stakers actually earn.",
  keywords:
    "TAO emissions, Bittensor emissions, Taoflow, Yuma Consensus, TAO staking rewards, subnet emissions, TAO per block",
  openGraph: {
    title: "How TAO Emissions Work — Bittensor Emission Model Explained",
    description:
      "Learn how TAO emissions work on Bittensor. ~3,600 TAO/day, Taoflow model, Yuma Consensus distribution, and staker earnings explained.",
    url: "https://taopulse.io/emissions",
    siteName: "TaoPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How TAO Emissions Work — Bittensor Emission Model Explained",
    description:
      "Learn how TAO emissions work on Bittensor. ~3,600 TAO/day, Taoflow model, Yuma Consensus distribution, and staker earnings explained.",
  },
  alternates: { canonical: "https://taopulse.io/emissions" },
};

const TOC_SECTIONS = [
  { id: "what-are-emissions", label: "What Are Emissions?" },
  { id: "two-stages", label: "Two Stages" },
  { id: "taoflow", label: "Taoflow Model" },
  { id: "subnet-split", label: "Within-Subnet Split" },
  { id: "staker-earnings", label: "What Stakers Earn" },
  { id: "flow-diagram", label: "Emission Flow" },
  { id: "faq", label: "FAQ" },
];

const FAQ = [
  {
    q: "How many TAO are emitted per block?",
    a: "~0.5 TAO per block after the first halving in December 2025. A new block is produced approximately every 12 seconds, adding up to ~3,600 TAO per day across the entire network.",
  },
  {
    q: "What is a 'tempo'?",
    a: "A tempo is the distribution cycle used by Yuma Consensus. One tempo is ~360 blocks, which is roughly 72 minutes. Rewards are distributed to validators and miners once per tempo.",
  },
  {
    q: "What is Taoflow?",
    a: "Taoflow (active since November 2025) is the emission model where each subnet's share of emissions is determined by its net TAO staking inflows over the past ~87 days (an exponential moving average). Subnets that see net outflows receive zero emissions.",
  },
  {
    q: "Can a subnet receive zero emissions?",
    a: "Yes. Under the Taoflow model, a subnet with net TAO outflows (more unstaking than staking) receives zero emissions. Only subnets attracting new stake earn a share of the daily emission.",
  },
  {
    q: "What does the validator take mean for stakers?",
    a: "When you delegate your TAO to a validator, the validator keeps a percentage of the emissions they receive on your behalf — this is the 'take'. The default take is 18%. If a validator earns 100 TAO for the pool, they keep 18 TAO and distribute 82 TAO proportionally among all delegators.",
  },
  {
    q: "Is there a maximum TAO supply?",
    a: "Yes. TAO has a hard cap of 21 million — the same as Bitcoin. The emission rate halves approximately every 4 years, meaning the total supply approaches but never exceeds 21 million.",
  },
];

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-500/30 bg-blue-500/8 px-4 py-3 text-sm text-blue-200 leading-relaxed">
      {children}
    </div>
  );
}

function SplitBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className={`font-bold ${color}`}>{pct}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full ${color.replace("text-", "bg-")} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function EmissionsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-12">
        <div className="flex-1 min-w-0 max-w-3xl">
          <div className="space-y-14">

            {/* Hero */}
            <section className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Learn
              </div>
              <h1 className="text-3xl font-bold text-white">How TAO Emissions Work</h1>
              <p className="text-gray-400 leading-relaxed">
                Every ~12 seconds, the Bittensor network creates new TAO tokens and distributes them across subnets,
                validators, and miners. This process — called <strong className="text-white">emission</strong> — is how
                the network pays its participants and how your staking rewards are generated.
              </p>
              <InfoBox>
                ℹ️ <strong>Quick numbers:</strong> ~0.5 TAO per block · ~3,600 TAO per day · distributed across all active subnets
              </InfoBox>
            </section>

            {/* What Are Emissions */}
            <section id="what-are-emissions" className="space-y-4">
              <h2 className="text-xl font-bold text-white">What Are Emissions?</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  Emissions are newly created TAO tokens released on a fixed schedule, similar to how Bitcoin miners
                  earn block rewards. The Bittensor network mints approximately <strong className="text-white">0.5 TAO every block</strong> (roughly every 12 seconds).
                  That works out to about <strong className="text-white">~3,600 TAO per day</strong>.
                </p>
                <p>
                  Unlike Bitcoin, where rewards go to a single miner, TAO emissions flow to an entire ecosystem:
                  subnet validators, miners, and subnet creators — and ultimately to stakers who delegate to validators.
                </p>
                <div className="rounded-lg border border-white/10 bg-white/3 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">At a Glance</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "Per block", value: "~0.5 TAO", sub: "every ~12 sec" },
                      { label: "Per day", value: "~3,600 TAO", sub: "after halving 1" },
                      { label: "Max supply", value: "21M TAO", sub: "same as Bitcoin" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Note: The daily emission rate was ~7,200 TAO/day before the first halving in December 2025, and
                  will drop to ~1,800 TAO/day at the next halving (~Dec 2029).{" "}
                  <Link href="/halving" className="text-purple-400 hover:text-purple-300 underline">See the halving schedule →</Link>
                </p>
              </div>
            </section>

            {/* Two Stages */}
            <section id="two-stages" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Two Stages: Injection → Distribution</h2>
              <p className="text-sm text-gray-400">
                Emissions happen in two distinct phases. Understanding both helps you see why rewards don&apos;t land in
                your wallet instantly.
              </p>

              <div className="space-y-4">
                {/* Stage 1 */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">1</span>
                    <h3 className="text-base font-semibold text-white">Injection — every block (~12 sec)</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Each new block injects ~0.5 TAO into the network&apos;s subnet pools. Think of it as filling
                    buckets — each subnet has its own bucket, and the amount going into each bucket is determined
                    by the Taoflow model (explained below). The TAO sits in these pools, not yet distributed.
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Stage 2 */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">2</span>
                    <h3 className="text-base font-semibold text-white">Distribution — every tempo (~72 min)</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Once per <strong className="text-white">tempo</strong> (~360 blocks ≈ 72 minutes), Yuma Consensus
                    runs within each subnet. It evaluates how well each miner is performing, scores validators, and
                    distributes the accumulated TAO in the subnet&apos;s pool to validators and miners based on their
                    contribution. Stakers receive their cut from the validators they delegated to.
                  </p>
                </div>
              </div>
            </section>

            {/* Taoflow */}
            <section id="taoflow" className="space-y-4">
              <h2 className="text-xl font-bold text-white">The Taoflow Model</h2>
              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  Before November 2025, subnet emissions were allocated based on validator votes at the root subnet.
                  Since November 2025, Bittensor switched to <strong className="text-white">Taoflow</strong> — an
                  emission model based on <em>actual capital flows</em>, not votes.
                </p>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">How Taoflow Works</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                      <span>The network tracks net TAO staking inflows for each subnet over the past ~87 days, using an exponential moving average (EMA).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                      <span>Subnets with <strong className="text-white">positive net inflows</strong> (more TAO staked in than withdrawn) receive a proportional share of daily emissions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                      <span>Subnets with <strong className="text-white">net outflows</strong> receive <strong className="text-white">zero emissions</strong> until capital flows reverse.</span>
                    </li>
                  </ul>
                </div>

                <p>
                  In plain English: <em>subnets earn emissions by attracting new stake, not by lobbying voters.</em>{" "}
                  This makes emissions a direct signal of market confidence in each subnet.
                </p>
              </div>
            </section>

            {/* Within-Subnet Split */}
            <section id="subnet-split" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Within-Subnet Split</h2>
              <p className="text-sm text-gray-400">
                Once a subnet has earned its share of daily emissions, those TAO are split three ways on every
                distribution cycle (tempo):
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-5">
                <SplitBar label="Miners (do the AI work)" pct={41} color="text-blue-400" />
                <SplitBar label="Validators (score the miners)" pct={41} color="text-purple-400" />
                <SplitBar label="Subnet Creator (owner)" pct={18} color="text-amber-400" />
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0f1623] p-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  <strong className="text-white">Miners</strong> run the actual AI compute workloads that the subnet is designed for.{" "}
                  <strong className="text-white">Validators</strong> evaluate miner output and decide who gets paid how much (via Yuma Consensus).{" "}
                  The <strong className="text-white">Subnet Creator</strong> owns the subnet and earns 18% as a royalty for launching and maintaining it.
                </p>
              </div>
            </section>

            {/* What Stakers Earn */}
            <section id="staker-earnings" className="space-y-4">
              <h2 className="text-xl font-bold text-white">What Stakers Actually Earn</h2>
              <p className="text-sm text-gray-400">
                As a TAO staker (delegator), you don&apos;t earn from the miner or creator cut — you earn a slice
                of the validator&apos;s 41%.
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6 space-y-4 text-sm">
                <div className="space-y-3">
                  {[
                    {
                      step: "1",
                      title: "Subnet earns emissions",
                      desc: "Your staked subnet earns its share of the ~3,600 TAO/day based on Taoflow.",
                      color: "bg-purple-600",
                    },
                    {
                      step: "2",
                      title: "41% goes to validators",
                      desc: "Out of the subnet's earned TAO, 41% is allocated to the validator pool.",
                      color: "bg-purple-600",
                    },
                    {
                      step: "3",
                      title: "Validator takes their cut",
                      desc: 'Your validator keeps their "take" (default ~18%). The rest is shared among all delegators.',
                      color: "bg-purple-600",
                    },
                    {
                      step: "4",
                      title: "You earn proportionally",
                      desc: "Your share = (your stake ÷ total delegated stake to that validator) × (validator's delegated emissions after take).",
                      color: "bg-emerald-600",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5`}>
                        {item.step}
                      </span>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.title}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Example</p>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    A subnet earns 100 TAO in a day. Validators get 41 TAO. Your validator has an 18% take →
                    keeps 7.4 TAO, distributes 33.6 TAO to delegators. You own 10% of the delegated stake →
                    you earn <strong className="text-emerald-300">3.36 TAO</strong> that day.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Want to calculate your expected earnings?{" "}
                <Link href="/staking" className="text-purple-400 hover:text-purple-300 underline">
                  See the Staking Calculator →
                </Link>
              </p>
            </section>

            {/* Emission Flow Diagram */}
            <section id="flow-diagram" className="space-y-4">
              <h2 className="text-xl font-bold text-white">Emission Flow Diagram</h2>
              <p className="text-sm text-gray-400">How newly minted TAO travels from the network to your wallet:</p>

              <div className="rounded-xl border border-white/10 bg-[#0f1623] p-6">
                {/* Network Layer */}
                <div className="flex flex-col items-center gap-0">
                  <div className="w-full max-w-xs rounded-lg border border-purple-500/40 bg-purple-500/10 p-3 text-center">
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">Bittensor Network</p>
                    <p className="text-sm font-semibold text-white mt-0.5">~0.5 TAO per block</p>
                    <p className="text-xs text-gray-500">every ~12 seconds</p>
                  </div>

                  <div className="flex items-center gap-1 py-1 text-xs text-gray-600">
                    <span>Taoflow allocates to subnets</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>

                  {/* Subnet Pool */}
                  <div className="w-full max-w-xs rounded-lg border border-blue-500/30 bg-blue-500/8 p-3 text-center">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">Subnet Pool</p>
                    <p className="text-xs text-gray-400 mt-0.5">TAO accumulates each block</p>
                    <p className="text-xs text-gray-500">distributed every tempo (~72 min)</p>
                  </div>

                  <div className="flex items-center gap-1 py-1 text-xs text-gray-600">
                    <span>Yuma Consensus distributes</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>

                  {/* Three-way split */}
                  <div className="w-full grid grid-cols-3 gap-2 max-w-sm">
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-center">
                      <p className="text-xs font-bold text-amber-400">18%</p>
                      <p className="text-xs text-gray-400 mt-0.5">Subnet Creator</p>
                    </div>
                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/8 p-2 text-center">
                      <p className="text-xs font-bold text-purple-400">41%</p>
                      <p className="text-xs text-gray-400 mt-0.5">Validators</p>
                    </div>
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/8 p-2 text-center">
                      <p className="text-xs font-bold text-blue-400">41%</p>
                      <p className="text-xs text-gray-400 mt-0.5">Miners</p>
                    </div>
                  </div>

                  {/* Validator take */}
                  <div className="flex items-center gap-1 py-1 text-xs text-gray-600">
                    <span>validator keep take (~18%), rest to delegators</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>

                  <div className="w-full max-w-xs rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-center">
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Your Wallet</p>
                    <p className="text-xs text-gray-400 mt-0.5">proportional to your stake</p>
                    <p className="text-xs text-gray-500">paid in TAO (classic staking)</p>
                  </div>
                </div>
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
                  href="/halving"
                  className="rounded-xl border border-white/10 bg-[#0f1623] p-4 hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors group"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300">TAO Halving Countdown →</p>
                  <p className="text-xs text-gray-500 mt-1">When emissions drop next, and by how much</p>
                </Link>
                <Link
                  href="/staking"
                  className="rounded-xl border border-white/10 bg-[#0f1623] p-4 hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors group"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300">How to Stake TAO →</p>
                  <p className="text-xs text-gray-500 mt-1">Put your TAO to work and start earning</p>
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

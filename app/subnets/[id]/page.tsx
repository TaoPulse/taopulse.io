import Link from "next/link";
import { notFound } from "next/navigation";
import subnets from "@/data/subnets.json";

const CATEGORY_COLORS: Record<string, string> = {
  "LLM/Text": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Inference": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Training": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Finance/Quant": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Data": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Storage": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Compute/GPU": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Vision": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "Audio": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Agents": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Other": "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const STATUS_STYLES = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "low-activity": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export async function generateStaticParams() {
  return subnets.map((subnet) => ({
    id: String(subnet.id),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subnet = subnets.find((s) => String(s.id) === id);
  if (!subnet) return { title: "Subnet Not Found | TaoPulse" };
  return {
    title: `${subnet.name} (SN${subnet.id}) | TaoPulse`,
    description: subnet.description,
  };
}

export default async function SubnetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subnet = subnets.find((s) => String(s.id) === id);

  if (!subnet) {
    notFound();
  }

  const categoryColor =
    CATEGORY_COLORS[subnet.category] ??
    "bg-gray-500/15 text-gray-400 border-gray-500/30";

  const statusStyle = STATUS_STYLES[subnet.status as keyof typeof STATUS_STYLES];
  const statusLabel =
    subnet.status === "active" ? "Active" : subnet.status === "low-activity" ? "Low Activity" : "Inactive";

  const emissionPct = (subnet.emission * 100).toFixed(
    subnet.emission >= 0.01 ? 2 : subnet.emission > 0 ? 3 : 1
  );

  const dailyTAO = Math.round(subnet.emission * 3600);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link
        href="/subnets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Subnet Explorer
      </Link>

      {/* Header */}
      <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                SN{String(subnet.id).padStart(3, "0")}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColor}`}
              >
                {subnet.category}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle}`}
              >
                {statusLabel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {subnet.name}
            </h1>
          </div>
          {subnet.website ? (
            <a
              href={subnet.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-400 text-sm font-medium transition-colors shrink-0"
            >
              Website
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm shrink-0">
              No website
            </span>
          )}
        </div>

        <p className="text-gray-300 leading-relaxed">{subnet.description}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Emission Rate",
            value: `${emissionPct}%`,
            sub: "of total daily",
            accent: subnet.emission >= 0.01 ? "text-emerald-400" : "text-gray-400",
          },
          {
            label: "Daily TAO",
            value: `~${dailyTAO.toLocaleString()}`,
            sub: "TAO per day",
            accent: "text-purple-400",
          },
          {
            label: "Active Miners",
            value: subnet.activeMiners.toLocaleString(),
            sub: "competing nodes",
            accent: "text-blue-400",
          },
          {
            label: "Validators",
            value: subnet.activeValidators.toLocaleString(),
            sub: "scoring miners",
            accent: "text-white",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0f1623] rounded-xl border border-white/10 p-4 text-center"
          >
            <p className={`text-2xl font-bold mb-1 ${stat.accent}`}>
              {stat.value}
            </p>
            <p className="text-xs font-medium text-white">{stat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Emission bar */}
      <div className="bg-[#0f1623] rounded-xl border border-white/10 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Emission Share</span>
          <span className="text-xs font-medium text-white">{emissionPct}% of network</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
            style={{ width: `${Math.min((subnet.emission / 0.05) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Based on ~3,600 TAO emitted daily across all subnets
        </p>
      </div>

      {/* How to Mine */}
      <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">How to Mine SN{subnet.id}</h2>
        </div>
        <p className="text-gray-300 leading-relaxed">{subnet.howToMine}</p>

        <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs text-amber-400">
            Mining requires registering a hotkey on the Bittensor network and paying a
            registration fee in TAO. Always read the subnet-specific documentation before
            committing resources. Registration costs vary by subnet demand.
          </p>
        </div>
      </div>

      {/* External links */}
      <div className="bg-[#0f1623] rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Resources</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://taostats.io/subnets/${subnet.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Live Stats on Taostats
          </a>
          <a
            href="https://github.com/opentensor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub (Opentensor)
          </a>
          {subnet.website && (
            <a
              href={subnet.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-400 text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Official Website
            </a>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/subnets"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Subnets
        </Link>
        <Link
          href="/staking"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
        >
          Learn About Staking
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import staticSubnets from "@/data/subnets.json";

export const metadata: Metadata = {
  title: "Subnet Emissions — TaoPulse Widget",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

interface SubnetItem {
  id: number;
  name: string;
  emission: number;
}

async function getTopSubnets(): Promise<SubnetItem[]> {
  const apiKey = process.env.TAOSTATS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        "https://api.taostats.io/api/subnet/latest/v1?limit=500",
        {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const staticMap = new Map(
          (staticSubnets as SubnetItem[]).map((s) => [s.id, s.name])
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const live: SubnetItem[] = (json.data ?? [])
          .filter((s: { netuid: number }) => s.netuid !== 0)
          .map((s: { netuid: number; projected_emission: string }) => ({
            id: s.netuid,
            name: staticMap.get(s.netuid) ?? `SN${s.netuid}`,
            emission: parseFloat(s.projected_emission) || 0,
          }))
          .filter((s: SubnetItem) => s.emission > 0)
          .sort((a: SubnetItem, b: SubnetItem) => b.emission - a.emission)
          .slice(0, 5);

        if (live.length > 0) return live;
      }
    } catch {
      // fall through to static
    }
  }

  // Static fallback
  return [...(staticSubnets as SubnetItem[])]
    .filter((s) => s.emission > 0)
    .sort((a, b) => b.emission - a.emission)
    .slice(0, 5);
}

export default async function SubnetsEmbed() {
  const subnets = await getTopSubnets();
  const maxEmission = subnets[0]?.emission ?? 1;

  return (
    <div className="bg-[#080d14] min-h-screen flex items-start justify-center p-3">
      <div className="w-full bg-[#0f1623] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Top Subnets by Emission
          </h3>
          <a
            href="https://www.taopulse.io/subnets"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            TaoPulse.io
          </a>
        </div>
        <div className="space-y-3">
          {subnets.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-8 shrink-0 font-mono">
                #{s.id}
              </span>
              <span className="text-xs text-white w-20 truncate shrink-0">
                {s.name}
              </span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full"
                  style={{ width: `${(s.emission / maxEmission) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-cyan-400 w-14 text-right shrink-0">
                {(s.emission * 100).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

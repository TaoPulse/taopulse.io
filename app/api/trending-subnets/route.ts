import { NextResponse } from "next/server";
import staticSubnets from "@/data/subnets.json";

export const revalidate = 300;

interface TrendingSubnet {
  id: number;
  name: string;
  category: string;
  emission: number;
  activeMiners: number;
  activeValidators: number;
  change?: string;
}

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  let subnets: TrendingSubnet[] = [];
  let isLive = false;

  try {
    if (apiKey) {
      const res = await fetch("https://api.taostats.io/api/subnet/latest/v1?limit=200", {
        headers: { Authorization: apiKey },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveMap = new Map<number, any>();
        for (const s of json.data ?? []) {
          liveMap.set(s.netuid, s);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subnets = (staticSubnets as any[]).map((s) => {
          const live = liveMap.get(s.id);
          if (!live) {
            return {
              id: s.id,
              name: s.name,
              category: s.category,
              emission: s.emission,
              activeMiners: s.activeMiners,
              activeValidators: s.activeValidators,
            };
          }

          const projectedEmission = parseFloat(live.projected_emission) || 0;
          const currentEmission = parseFloat(live.emission) || 0;
          const emissionValue = projectedEmission || currentEmission || s.emission;

          // Detect if emission is trending higher than historical
          let change: string | undefined;
          if (projectedEmission > 0 && currentEmission > 0) {
            const diff = ((projectedEmission - currentEmission) / currentEmission) * 100;
            if (diff > 5) change = `+${diff.toFixed(1)}%`;
            else if (diff < -5) change = `${diff.toFixed(1)}%`;
          }

          return {
            id: s.id,
            name: s.name,
            category: s.category,
            emission: emissionValue,
            activeMiners: live.active_miners ?? s.activeMiners,
            activeValidators: live.active_validators ?? s.activeValidators,
            ...(change ? { change } : {}),
          };
        });

        isLive = true;
      }
    }

    if (!isLive) {
      // Static fallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subnets = (staticSubnets as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        emission: s.emission,
        activeMiners: s.activeMiners,
        activeValidators: s.activeValidators,
      }));
    }

    const top8 = subnets
      .filter((s) => s.emission > 0)
      .sort((a, b) => b.emission - a.emission)
      .slice(0, 8);

    return NextResponse.json(
      {
        subnets: top8,
        isLive,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
      }
    );
  } catch {
    // Always return something
    const fallback = (staticSubnets as typeof staticSubnets)
      .slice()
      .sort((a, b) => b.emission - a.emission)
      .slice(0, 8)
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        emission: s.emission,
        activeMiners: s.activeMiners,
        activeValidators: s.activeValidators,
      }));

    return NextResponse.json({
      subnets: fallback,
      isLive: false,
      lastUpdated: new Date().toISOString(),
    });
  }
}

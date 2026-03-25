import { NextResponse } from "next/server";
import staticSubnets from "@/data/subnets.json";

const TAOSTATS_BASE = "https://api.taostats.io";

interface StaticSubnet {
  id: number;
  name: string;
  category: string;
  description: string;
  emission: number;
  activeMiners: number;
  activeValidators: number;
  website: string | null;
  status: string;
  howToMine: string;
}

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const res = await fetch(`${TAOSTATS_BASE}/api/subnet/latest/v1?limit=500`, {
    headers: { Authorization: apiKey },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch subnets" }, { status: 502 });
  }

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveMap = new Map<number, any>();
  for (const s of json.data ?? []) {
    if (s.netuid === 0) continue; // skip root network
    liveMap.set(s.netuid, s);
  }

  const merged = (staticSubnets as StaticSubnet[]).map((s) => {
    const live = liveMap.get(s.id);
    if (!live) return s;

    const emissionPct = parseFloat(live.projected_emission) || s.emission;
    const priceInTao = parseFloat(live.ema_tao_flow) / 1e9;
    const netFlow1d = parseFloat(live.net_flow_1_day) / 1e9;

    return {
      ...s,
      emission: emissionPct,
      activeMiners: live.active_miners ?? s.activeMiners,
      activeValidators: live.active_validators ?? s.activeValidators,
      price: priceInTao > 0 ? priceInTao : null,
      volume24h: netFlow1d > 0 ? netFlow1d : null,
    };
  });

  return NextResponse.json(merged, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}

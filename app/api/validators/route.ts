import { NextResponse } from "next/server";

const TAOSTATS_BASE = "https://api.taostats.io";

function formatStake(raoStr: string): string {
  const tao = parseFloat(raoStr) / 1e9;
  return tao.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapValidator(v: any) {
  const takePct = parseFloat(v.take) * 100;
  const aprPct = parseFloat(v.apr) * 100;
  // uptime: TaoStats may expose v.active (bool) or v.uptime (0-1 float)
  let uptime: string | null = null;
  if (typeof v.uptime === "number") {
    uptime = `${(v.uptime * 100).toFixed(1)}%`;
  } else if (typeof v.active === "boolean") {
    uptime = v.active ? "Active" : "Inactive";
  }
  // subnet count: TaoStats may expose v.subnets as array or count
  let subnets: number | null = null;
  if (typeof v.subnet_count === "number") {
    subnets = v.subnet_count;
  } else if (Array.isArray(v.subnets)) {
    subnets = v.subnets.length;
  } else if (typeof v.subnets === "number") {
    subnets = v.subnets;
  }
  return {
    name: v.name || "Unknown",
    hotkey: v.hotkey?.ss58 ?? "",
    fee: `${takePct.toFixed(1)}%`,
    apr: `${aprPct.toFixed(1)}%`,
    aprRaw: aprPct,
    stake: formatStake(v.stake),
    stakeRaw: parseFloat(v.stake) / 1e9,
    nominators: v.nominators as number,
    uptime,
    subnets,
  };
}

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?limit=50`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch validators" }, { status: 502 });
    }

    const json = await res.json();
    const validators = (json.data ?? []).slice(0, 25).map(mapValidator);

    return NextResponse.json(validators, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch validators" }, { status: 502 });
  }
}

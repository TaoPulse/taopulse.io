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
  return {
    name: v.name || "Unknown",
    fee: `${takePct.toFixed(1)}%`,
    apr: `${aprPct.toFixed(1)}%`,
    stake: formatStake(v.stake),
    nominators: v.nominators as number,
    hotkey: v.hotkey?.ss58 ?? "",
  };
}

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const res = await fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?limit=20`, {
    headers: { Authorization: apiKey },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch validators" }, { status: 502 });
  }

  const json = await res.json();
  const validators = (json.data ?? []).slice(0, 10).map(mapValidator);

  return NextResponse.json(validators, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}

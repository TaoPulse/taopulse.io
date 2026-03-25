import { NextResponse } from "next/server";

const TAOSTATS_BASE = "https://api.taostats.io";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapValidator(v: any) {
  const takePct = parseFloat(v.take) * 100;
  const aprPct = parseFloat(v.apr) * 100;
  return {
    name: v.name || null,
    hotkey: v.hotkey?.ss58 ?? "",
    fee: `${takePct.toFixed(1)}%`,
    apr: aprPct > 0 ? `${aprPct.toFixed(1)}%` : null,
    aprRaw: aprPct,
    stake: (parseFloat(v.stake) / 1e9).toLocaleString("en-US", { maximumFractionDigits: 0 }),
    stakeRaw: parseFloat(v.stake) / 1e9,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const netuid = parseInt(id, 10);

  if (isNaN(netuid)) {
    return NextResponse.json({ error: "Invalid subnet id" }, { status: 400 });
  }

  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const [subnetRes, validatorsRes] = await Promise.all([
      fetch(`${TAOSTATS_BASE}/api/subnet/latest/v1?netuid=${netuid}`, {
        headers: { Authorization: apiKey },
        next: { revalidate: 60 },
      }),
      fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?netuid=${netuid}&limit=5`, {
        headers: { Authorization: apiKey },
        next: { revalidate: 60 },
      }),
    ]);

    const subnetJson = subnetRes.ok ? await subnetRes.json() : null;
    const validatorsJson = validatorsRes.ok ? await validatorsRes.json() : null;

    const subnetData = subnetJson?.data?.[0] ?? null;
    const validators = (validatorsJson?.data ?? []).map(mapValidator);

    let liveSubnet = null;
    if (subnetData) {
      // projected_emission is a fraction (e.g. 0.0247 = 2.47%); emission is raw rao — use projected only
      const emission = parseFloat(subnetData.projected_emission) || null;
      const regCostRao = subnetData.burn ?? subnetData.registration_cost ?? null;
      liveSubnet = {
        emission,
        activeMiners: subnetData.active_miners ?? null,
        activeValidators: subnetData.active_validators ?? null,
        registrationCost: regCostRao != null ? parseFloat(regCostRao) / 1e9 : null,
      };
    }

    return NextResponse.json(
      { subnet: liveSubnet, validators },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch subnet data" }, { status: 502 });
  }
}

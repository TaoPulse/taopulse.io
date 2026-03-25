import { NextResponse } from "next/server";

const TAOSTATS_BASE = "https://api.taostats.io";

export const revalidate = 300; // 5 minutes

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;

  const results = await Promise.allSettled([
    // Subnet count from taostats (fetch all, we'll exclude netuid 0)
    apiKey
      ? fetch(`${TAOSTATS_BASE}/api/subnet/latest/v1?limit=500`, {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
        }).then((r) => r.ok ? r.json() : null)
      : Promise.resolve(null),

    // Validator stake totals from taostats
    apiKey
      ? fetch(`${TAOSTATS_BASE}/api/validator/latest/v1?limit=100`, {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
        }).then((r) => r.ok ? r.json() : null)
      : Promise.resolve(null),

    // Circulating supply + market cap from CoinGecko (free)
    fetch(
      "https://api.coingecko.com/api/v3/coins/bittensor?localization=false&tickers=false&community_data=false&developer_data=false",
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) }
    ).then((r) => r.ok ? r.json() : null).catch(() => null),
  ]);

  const subnetData = results[0].status === "fulfilled" ? results[0].value : null;
  const validatorData = results[1].status === "fulfilled" ? results[1].value : null;
  const geckoData = results[2].status === "fulfilled" ? results[2].value : null;

  // Active subnets count — exclude netuid 0 (root network), not a real subnet
  const activeSubnets = subnetData?.data
    ? subnetData.data.filter((s: { netuid: number }) => s.netuid !== 0).length
    : null;

  // Total staked TAO (sum all validators)
  let stakedTao: number | null = null;
  let stakedPct: number | null = null;
  if (validatorData?.data) {
    const totalRao = validatorData.data.reduce(
      (sum: number, v: { stake: string }) => sum + parseFloat(v.stake),
      0
    );
    stakedTao = totalRao / 1e9;
  }

  // Circulating supply from CoinGecko
  const circulatingSupply: number | null = geckoData?.market_data?.circulating_supply ?? null;
  const marketCap: number | null = geckoData?.market_data?.market_cap?.usd ?? null;

  if (stakedTao !== null && circulatingSupply !== null) {
    stakedPct = (stakedTao / circulatingSupply) * 100;
  }

  const currentBlock =
    10_500_000 + Math.floor((Date.now() - new Date("2025-12-14T00:00:00Z").getTime()) / 12000);
  const blocksToNextHalving = Math.max(0, 21_000_000 - currentBlock);

  return NextResponse.json(
    {
      activeSubnets,
      stakedTao: stakedTao ? Math.round(stakedTao) : null,
      stakedPct: stakedPct ? parseFloat(stakedPct.toFixed(1)) : null,
      circulatingSupply: circulatingSupply ? Math.round(circulatingSupply) : null,
      marketCap,
      currentBlock,
      blocksToNextHalving,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}

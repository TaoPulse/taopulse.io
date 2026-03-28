/**
 * scripts/subnet-scan.ts
 *
 * Fetches per-subnet metrics from chain and writes to subnet_snapshots table.
 * Can be run standalone OR called from nightly-chain-scan.ts (reusing connection).
 *
 * Writes to Supabase:
 *   - subnet_snapshots  (one row per netuid per day)
 *
 * Usage (standalone):
 *   npx ts-node --project tsconfig.scripts.json scripts/subnet-scan.ts [YYYY-MM-DD]
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createClient } from '@supabase/supabase-js';

const RPC_ENDPOINT = 'wss://entrypoint-finney.opentensor.ai:443';

function toTao(raw: bigint | number | string): number {
  return Number(BigInt(raw.toString())) / 1e9;
}

/**
 * Core subnet scan logic — accepts existing api + supabase instances.
 * Called from nightly-chain-scan.ts to reuse the chain connection.
 */
export async function runSubnetScan(
  api: ApiPromise,
  supabase: ReturnType<typeof createClient>,
  today: string
): Promise<{ written: number; validationPassed: boolean }> {
  const t0 = Date.now();
  console.log(`\n[SUBNET] Fetching subnet data from chain...`);

  // subnetTAO — pool TAO (TVL)
  const subnetTaoMap = new Map<number, bigint>();
  const taoEntries = await (api.query as any).subtensorModule.subnetTAO.entries();
  for (const [k, v] of taoEntries) {
    subnetTaoMap.set(k.args[0].toNumber(), BigInt(v.toString()));
  }
  console.log(`  ✅ subnetTAO: ${subnetTaoMap.size} subnets`);

  // subnetAlphaIn — alpha in pool
  const alphaInMap = new Map<number, bigint>();
  const alphaInEntries = await (api.query as any).subtensorModule.subnetAlphaIn.entries();
  for (const [k, v] of alphaInEntries) {
    alphaInMap.set(k.args[0].toNumber(), BigInt(v.toString()));
  }
  console.log(`  ✅ subnetAlphaIn: ${alphaInMap.size} subnets`);

  // subnetAlphaOut — alpha in circulation (outside pool)
  const alphaOutMap = new Map<number, bigint>();
  const alphaOutEntries = await (api.query as any).subtensorModule.subnetAlphaOut.entries();
  for (const [k, v] of alphaOutEntries) {
    alphaOutMap.set(k.args[0].toNumber(), BigInt(v.toString()));
  }
  console.log(`  ✅ subnetAlphaOut: ${alphaOutMap.size} subnets`);

  // emission — per-netuid array of per-neuron emissions (RAO/block), summed
  const emissionMap = new Map<number, number>();
  const emissionEntries = await (api.query as any).subtensorModule.emission.entries();
  for (const [k, v] of emissionEntries) {
    const netuid = k.args[0].toNumber();
    const arr: number[] = v.toJSON() as number[];
    const total = arr.reduce((sum, x) => sum + (x ?? 0), 0);
    emissionMap.set(netuid, total / 1e9); // TAO/block
  }
  console.log(`  ✅ emission: ${emissionMap.size} subnets`);

  // networkRegisteredAt — block number when subnet was registered
  const regBlockMap = new Map<number, number>();
  const regEntries = await (api.query as any).subtensorModule.networkRegisteredAt.entries();
  for (const [k, v] of regEntries) {
    regBlockMap.set(k.args[0].toNumber(), Number(v.toString()));
  }
  console.log(`  ✅ networkRegisteredAt: ${regBlockMap.size} subnets`);

  // ── Build rows ────────────────────────────────────────────────────────────────
  console.log(`\n[SUBNET] Writing subnet_snapshots to Supabase...`);

  const allNetuids = new Set([
    ...subnetTaoMap.keys(),
    ...alphaInMap.keys(),
    ...alphaOutMap.keys(),
  ]);

  const rows: any[] = [];
  for (const netuid of allNetuids) {
    const subnetTaoRaw = subnetTaoMap.get(netuid) ?? 0n;
    const alphaInRaw = alphaInMap.get(netuid) ?? 0n;
    const alphaOutRaw = alphaOutMap.get(netuid) ?? 0n;

    const subnet_tao = toTao(subnetTaoRaw);
    const subnet_alpha_in = toTao(alphaInRaw);
    const subnet_alpha_out = toTao(alphaOutRaw);

    // price_ratio: TAO per 1 alpha token. Root subnet (0) always 1:1
    const price_ratio = netuid === 0
      ? 1.0
      : (alphaInRaw > 0n ? subnet_tao / subnet_alpha_in : null);

    // market_cap_tao = circulating alpha × price
    const market_cap_tao = price_ratio != null ? subnet_alpha_out * price_ratio : null;

    rows.push({
      netuid,
      date: today,
      subnet_tao,
      subnet_alpha_in,
      subnet_alpha_out,
      price_ratio,
      market_cap_tao,
      emission_rate: emissionMap.get(netuid) ?? null,
      registration_block: regBlockMap.get(netuid) ?? null,
    });
  }

  // Write in batches
  const BATCH = 50;
  let written = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('subnet_snapshots')
      .upsert(batch, { onConflict: 'netuid,date' });
    if (error) {
      console.error(`  ✗ subnet_snapshots batch ${i}: ${error.message}`);
    } else {
      written += batch.length;
    }
  }
  console.log(`  ✅ subnet_snapshots: ${written}/${rows.length} rows written for ${today}`);

  // ── Validation ───────────────────────────────────────────────────────────────
  console.log('\n[SUBNET VALIDATION]');
  const validationErrors: string[] = [];

  const { count: totalCount, error: countErr } = await supabase
    .from('subnet_snapshots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);

  if (countErr) {
    validationErrors.push(`Count query failed: ${countErr.message}`);
  } else if ((totalCount ?? 0) < 100) {
    validationErrors.push(`Expected ~129 rows for ${today}, got ${totalCount}`);
  } else {
    console.log(`  ✅ Row count: ${totalCount} rows (expected ~129)`);
  }

  const { count: nullPriceCount } = await supabase
    .from('subnet_snapshots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .gt('netuid', 0)
    .is('price_ratio', null);
  if ((nullPriceCount ?? 0) > 10) {
    validationErrors.push(`${nullPriceCount} non-root subnets have null price_ratio`);
  } else {
    console.log(`  ✅ Null price_ratio: ${nullPriceCount ?? 0} (acceptable)`);
  }

  const { count: emissionCount } = await supabase
    .from('subnet_snapshots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .not('emission_rate', 'is', null);
  console.log(`  ✅ emission_rate populated: ${emissionCount ?? 0}/${totalCount ?? 0} rows`);

  const { data: topSubnet } = await supabase
    .from('subnet_snapshots')
    .select('netuid, subnet_tao, price_ratio, market_cap_tao')
    .eq('date', today)
    .gt('netuid', 0)
    .order('subnet_tao', { ascending: false })
    .limit(1);
  if (topSubnet?.[0]) {
    const t = topSubnet[0];
    if (t.price_ratio > 0 && t.market_cap_tao > 0) {
      console.log(`  ✅ Top subnet SN${t.netuid}: TVL=${t.subnet_tao.toFixed(0)} TAO, price=${t.price_ratio.toFixed(6)}, MC=${t.market_cap_tao.toFixed(0)} TAO`);
    } else {
      validationErrors.push(`Top subnet SN${t.netuid} has invalid price_ratio or market_cap_tao`);
    }
  }

  const passed = validationErrors.length === 0;
  if (!passed) {
    console.error(`\n  ⚠️  SUBNET VALIDATION FAILED (${validationErrors.length}):`);
    for (const e of validationErrors) console.error(`    ✗ ${e}`);
  } else {
    console.log(`\n  ✅ All subnet validation checks passed`);
  }

  // Print top 10 by TVL
  const sorted = rows
    .filter(r => r.netuid > 0 && r.subnet_tao > 0)
    .sort((a, b) => b.subnet_tao - a.subnet_tao)
    .slice(0, 10);
  console.log('\n  Top 10 subnets by TVL:');
  sorted.forEach((r, i) => {
    console.log(`  ${String(i+1).padStart(3)}. SN${r.netuid.toString().padStart(3)}  TVL=${r.subnet_tao.toFixed(0)} TAO  price=${(r.price_ratio ?? 0).toFixed(6)}  MC=${(r.market_cap_tao ?? 0).toFixed(0)} TAO  emit=${(r.emission_rate ?? 0).toFixed(4)} TAO/blk`);
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n  Subnet scan: ${elapsed}s — ${passed ? '✅ PASSED' : '⚠️ VALIDATION WARNINGS'}`);

  return { written, validationPassed: passed };
}

// ── Standalone entrypoint ─────────────────────────────────────────────────────
async function main() {
  const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const today = dateArg ?? new Date().toISOString().split('T')[0];

  console.log(`\n🔗 Subnet scan (standalone) — ${today}${dateArg ? ' (custom date)' : ''}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`[1/2] Connecting to chain...`);
  const provider = new WsProvider(RPC_ENDPOINT);
  const api = await ApiPromise.create({ provider });
  console.log('  ✅ Connected');

  await runSubnetScan(api, supabase, today);

  await api.disconnect();
  console.log('\n✅ Done');
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

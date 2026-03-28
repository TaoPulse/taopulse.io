/**
 * scripts/validator-scan.ts
 *
 * Aggregates alpha staking data by (hotkey, netuid) to produce per-validator
 * stake snapshots. Uses data already fetched by the nightly scan — no extra
 * chain calls needed.
 *
 * Can be run standalone OR called from nightly-chain-scan.ts.
 *
 * Writes to Supabase:
 *   - validator_snapshots  (one row per hotkey+netuid per day)
 *
 * Usage (standalone):
 *   npx ts-node --project tsconfig.scripts.json scripts/validator-scan.ts [YYYY-MM-DD]
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createClient } from '@supabase/supabase-js';

const RPC_ENDPOINT = 'wss://entrypoint-finney.opentensor.ai:443';

function alphaToTao(bits: string | number): number {
  if (!bits || bits === '0' || bits === 0) return 0;
  const hex = bits.toString();
  if (!hex.startsWith('0x')) return 0;
  const full = BigInt(hex);
  const integerPartRao = full >> 64n;
  return Number(integerPartRao) / 1e9;
}

interface ValidatorAgg {
  totalAlpha: number;
  totalTao: number;
  delegatorCount: number;
}

/**
 * Core validator aggregation logic.
 * Accepts pre-fetched alphaDetail map from nightly scan to avoid re-fetching.
 * If alphaDetail is not provided, fetches it from chain directly.
 */
export async function runValidatorScan(
  api: ApiPromise,
  supabase: any,
  today: string,
  // Pre-fetched from nightly scan: coldkey → [{hotkey, netuid, balanceAlpha, balanceAsTao}]
  alphaDetailMap?: Map<string, Array<{ hotkey: string; netuid: number; balanceAlpha: number; balanceAsTao: number }>>,
  subnetRatioMap?: Map<number, number>
): Promise<{ written: number; validatorCount: number; validationPassed: boolean }> {
  const t0 = Date.now();
  console.log(`\n[VALIDATOR] Aggregating validator stake data...`);

  let alphaDetail = alphaDetailMap;
  let subnetRatio = subnetRatioMap;

  // If not provided (standalone mode), fetch from chain
  if (!alphaDetail || !subnetRatio) {
    console.log('  Fetching subnet ratios...');
    subnetRatio = new Map<number, number>();

    const taoEntries = await (api.query as any).subtensorModule.subnetTAO.entries();
    const subnetTaoMap = new Map<number, bigint>();
    for (const [k, v] of taoEntries) {
      subnetTaoMap.set(k.args[0].toNumber(), BigInt(v.toString()));
    }

    const alphaInEntries = await (api.query as any).subtensorModule.subnetAlphaIn.entries();
    for (const [k, v] of alphaInEntries) {
      const netuid = k.args[0].toNumber();
      const alphaIn = BigInt(v.toString());
      const taoIn = subnetTaoMap.get(netuid) ?? 0n;
      subnetRatio.set(netuid, alphaIn > 0n ? Number(taoIn) / Number(alphaIn) : 1.0);
    }
    subnetRatio.set(0, 1.0);
    console.log(`  ✅ ${subnetRatio.size} subnet ratios`);

    console.log('  Fetching all alpha stakes (this takes a few minutes)...');
    alphaDetail = new Map();
    let alphaStart: string | undefined;
    let alphaCount = 0;

    while (true) {
      const page = await (api.query as any).subtensorModule.alpha.entriesPaged({
        args: [],
        pageSize: 500,
        startKey: alphaStart,
      }) as any[];

      if (page.length === 0) break;

      for (const [key, val] of page) {
        const [hotkey, coldkey, netuIdStr] = key.args.map((a: any) => a.toString());
        const netuid = parseInt(netuIdStr);
        const bitsVal = (val as any).toJSON()?.bits;
        const alphaTaoShares = alphaToTao(bitsVal);
        alphaStart = key.toString();
        if (!alphaTaoShares) continue;

        const ratio = subnetRatio!.get(netuid) ?? 1.0;
        const asTao = alphaTaoShares * ratio;

        if (!alphaDetail!.has(coldkey)) alphaDetail!.set(coldkey, []);
        alphaDetail!.get(coldkey)!.push({ hotkey, netuid, balanceAlpha: alphaTaoShares, balanceAsTao: asTao });
        alphaCount++;
      }
      if (alphaCount % 50000 === 0 && alphaCount > 0) console.log(`    ... ${alphaCount.toLocaleString()} alpha entries`);
    }
    console.log(`  ✅ ${alphaCount.toLocaleString()} alpha entries fetched`);
  }

  // ── Aggregate by (hotkey, netuid) ────────────────────────────────────────────
  // validatorMap: `${hotkey}::${netuid}` → { totalAlpha, totalTao, delegatorCount }
  const validatorMap = new Map<string, ValidatorAgg>();

  for (const [_coldkey, entries] of alphaDetail) {
    for (const e of entries) {
      const key = `${e.hotkey}::${e.netuid}`;
      const existing = validatorMap.get(key);
      if (existing) {
        existing.totalAlpha += e.balanceAlpha;
        existing.totalTao += e.balanceAsTao;
        existing.delegatorCount += 1;
      } else {
        validatorMap.set(key, {
          totalAlpha: e.balanceAlpha,
          totalTao: e.balanceAsTao,
          delegatorCount: 1,
        });
      }
    }
  }

  console.log(`  ✅ ${validatorMap.size} (hotkey, netuid) pairs aggregated`);

  // ── Build rows ────────────────────────────────────────────────────────────────
  const rows: any[] = [];
  for (const [key, agg] of validatorMap) {
    const [hotkey, netuIdStr] = key.split('::');
    rows.push({
      hotkey,
      netuid: parseInt(netuIdStr),
      date: today,
      total_staked_alpha: agg.totalAlpha,
      total_staked_tao: agg.totalTao,
      delegator_count: agg.delegatorCount,
    });
  }

  // Sort by total_staked_tao desc for logging
  rows.sort((a, b) => b.total_staked_tao - a.total_staked_tao);

  // ── Write to Supabase ─────────────────────────────────────────────────────────
  console.log(`\n[VALIDATOR] Writing ${rows.length} rows to validator_snapshots...`);
  const BATCH = 100;
  let written = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('validator_snapshots')
      .upsert(batch, { onConflict: 'hotkey,netuid,date' });
    if (error) {
      console.error(`  ✗ validator_snapshots batch ${i}: ${error.message}`);
    } else {
      written += batch.length;
    }
  }
  console.log(`  ✅ validator_snapshots: ${written}/${rows.length} rows written for ${today}`);

  // ── Validation ───────────────────────────────────────────────────────────────
  console.log('\n[VALIDATOR VALIDATION]');
  const validationErrors: string[] = [];

  const { count: totalCount, error: countErr } = await supabase
    .from('validator_snapshots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);

  if (countErr) {
    validationErrors.push(`Count query failed: ${countErr.message}`);
  } else if ((totalCount ?? 0) < 100) {
    validationErrors.push(`Expected many rows for ${today}, got ${totalCount}`);
  } else {
    console.log(`  ✅ Row count: ${totalCount} rows for ${today}`);
  }

  // Distinct validators
  const { data: distinctHotkeys } = await supabase
    .from('validator_snapshots')
    .select('hotkey')
    .eq('date', today);
  const uniqueValidators = new Set(distinctHotkeys?.map((r: any) => r.hotkey) ?? []).size;
  console.log(`  ✅ Distinct validators: ${uniqueValidators}`);

  // Distinct subnets
  const { data: distinctSubnets } = await supabase
    .from('validator_snapshots')
    .select('netuid')
    .eq('date', today);
  const uniqueSubnets = new Set(distinctSubnets?.map((r: any) => r.netuid) ?? []).size;
  console.log(`  ✅ Distinct subnets: ${uniqueSubnets}`);

  // Spot check: top validator should have meaningful stake
  const { data: topValidator } = await supabase
    .from('validator_snapshots')
    .select('hotkey, netuid, total_staked_tao, delegator_count')
    .eq('date', today)
    .order('total_staked_tao', { ascending: false })
    .limit(1);
  if (topValidator?.[0]) {
    const v = topValidator[0];
    if (v.total_staked_tao > 0) {
      console.log(`  ✅ Top validator: ${v.hotkey.slice(0, 12)}... SN${v.netuid} stake=${v.total_staked_tao.toFixed(0)} TAO delegators=${v.delegator_count}`);
    } else {
      validationErrors.push('Top validator has 0 stake');
    }
  }

  const passed = validationErrors.length === 0;
  if (!passed) {
    console.error(`\n  ⚠️  VALIDATOR VALIDATION FAILED (${validationErrors.length}):`);
    for (const e of validationErrors) console.error(`    ✗ ${e}`);
  } else {
    console.log(`\n  ✅ All validator validation checks passed`);
  }

  // Print top 10 validators by stake
  console.log('\n  Top 10 validators by stake:');
  rows.slice(0, 10).forEach((r, i) => {
    console.log(`  ${String(i+1).padStart(3)}. ${r.hotkey.slice(0,12)}...  SN${r.netuid}  stake=${r.total_staked_tao.toFixed(0)} TAO  delegators=${r.delegator_count}`);
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n  Validator scan: ${elapsed}s — ${passed ? '✅ PASSED' : '⚠️ VALIDATION WARNINGS'}`);

  return { written, validatorCount: uniqueValidators, validationPassed: passed };
}

// ── Standalone entrypoint ─────────────────────────────────────────────────────
async function main() {
  const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const today = dateArg ?? new Date().toISOString().split('T')[0];

  console.log(`\n🔗 Validator scan (standalone) — ${today}${dateArg ? ' (custom date)' : ''}`);

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

  // Standalone: no pre-fetched data, will fetch from chain
  await runValidatorScan(api, supabase, today);

  await api.disconnect();
  console.log('\n✅ Done');
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

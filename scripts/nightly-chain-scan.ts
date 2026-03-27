/**
 * scripts/nightly-chain-scan.ts
 *
 * Nightly GitHub Actions job: fetch all Bittensor accounts + alpha stakes
 * directly from chain, compute top 500 by total TAO, write daily snapshot
 * to Supabase whale_snapshots table.
 *
 * No TaoStats dependency — fully chain-direct.
 *
 * Usage:
 *   npx tsx scripts/nightly-chain-scan.ts
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Expected runtime: ~8-12 min on GitHub Actions
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createClient } from '@supabase/supabase-js';

const RPC_ENDPOINT = 'wss://entrypoint-finney.opentensor.ai:443';
const TOP_N = 500;

function toTao(rao: bigint | number | string): number {
  return Number(BigInt(rao.toString())) / 1e9;
}

/**
 * Parse I64F64 fixed-point alpha bits → TAO.
 * 128-bit value: upper 64 bits = integer part (RAO), lower 64 = fraction.
 */
function alphaToTao(bits: string | number): number {
  if (!bits || bits === '0' || bits === 0) return 0;
  const hex = bits.toString();
  if (!hex.startsWith('0x')) return 0;
  const full = BigInt(hex);
  const integerPartRao = full >> 64n;
  return Number(integerPartRao) / 1e9;
}

async function fetchAllAccounts(api: ApiPromise): Promise<Map<string, bigint>> {
  console.log('  Fetching all accounts...');
  const freeBalances = new Map<string, bigint>();
  let startKey: string | undefined;
  let count = 0;

  while (true) {
    const page = await (api.query as any).system.account.entriesPaged({
      args: [],
      pageSize: 1000,
      startKey,
    });
    if (page.length === 0) break;
    for (const [key, val] of page) {
      freeBalances.set(key.args[0].toString(), BigInt((val as any).data.free.toString()));
      startKey = key.toString();
      count++;
    }
    if (count % 50000 === 0) console.log(`    ... ${count.toLocaleString()} accounts`);
  }
  console.log(`  ✅ ${count.toLocaleString()} accounts`);
  return freeBalances;
}

async function fetchSubnetRatios(api: ApiPromise): Promise<Map<number, number>> {
  const subnetTaoMap = new Map<number, bigint>();
  const ratios = new Map<number, number>();

  const taoEntries = await (api.query as any).subtensorModule.subnetTAO.entries();
  for (const [k, v] of taoEntries) {
    subnetTaoMap.set(k.args[0].toNumber(), BigInt(v.toString()));
  }

  const alphaEntries = await (api.query as any).subtensorModule.subnetAlphaIn.entries();
  for (const [k, v] of alphaEntries) {
    const netuid = k.args[0].toNumber();
    const alphaIn = BigInt(v.toString());
    const taoIn = subnetTaoMap.get(netuid) ?? 0n;
    ratios.set(netuid, alphaIn > 0n ? Number(taoIn) / Number(alphaIn) : 1.0);
  }
  ratios.set(0, 1.0); // root subnet always 1:1
  return ratios;
}

async function fetchAlphaStakes(
  api: ApiPromise,
  subnetRatio: Map<number, number>
): Promise<Map<string, number>> {
  console.log('  Fetching alpha stakes...');
  const stakedTao = new Map<string, number>();
  let alphaStart: string | undefined;
  let alphaCount = 0;
  let retries = 0;
  const MAX_RETRIES = 5;

  while (true) {
    try {
      const page = await Promise.race([
        (api.query as any).subtensorModule.alpha.entriesPaged({
          args: [],
          pageSize: 500,
          startKey: alphaStart,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Page timeout')), 60000)
        ),
      ]) as any[];

      if (page.length === 0) break;
      retries = 0;

      for (const [key, val] of page) {
        const [_hotkey, coldkey, netuid] = key.args.map((a: any) => a.toString());
        const bitsVal = (val as any).toJSON()?.bits;
        const alphaTaoShares = alphaToTao(bitsVal);
        alphaStart = key.toString();
        if (!alphaTaoShares) continue;

        const ratio = subnetRatio.get(parseInt(netuid)) ?? 1.0;
        stakedTao.set(coldkey, (stakedTao.get(coldkey) ?? 0) + alphaTaoShares * ratio);
        alphaCount++;
      }

      if (alphaCount % 10000 === 0 && alphaCount > 0) {
        console.log(`    ... ${alphaCount.toLocaleString()} alpha entries`);
      }
    } catch (err: any) {
      retries++;
      console.error(`  ⚠ Alpha page error (retry ${retries}/${MAX_RETRIES}): ${err.message}`);
      if (retries >= MAX_RETRIES) {
        console.error('  ✗ Max retries hit — continuing with partial data');
        break;
      }
      await new Promise(r => setTimeout(r, 5000 * retries));
      if (!api.isConnected) {
        console.log('  Reconnecting...');
        await api.connect();
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  console.log(`  ✅ ${alphaCount.toLocaleString()} alpha entries, ${stakedTao.size.toLocaleString()} staking coldkeys`);
  return stakedTao;
}

async function main() {
  const t0 = Date.now();
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n🔗 Nightly chain scan — ${today}`);

  // ── Supabase client ──────────────────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── Connect to chain ─────────────────────────────────────────────────────────
  console.log(`\n[1/4] Connecting to ${RPC_ENDPOINT}...`);
  const provider = new WsProvider(RPC_ENDPOINT);
  const api = await ApiPromise.create({ provider });
  console.log('  ✅ Connected');

  // ── Fetch data ───────────────────────────────────────────────────────────────
  console.log('\n[2/4] Fetching accounts...');
  const freeBalances = await fetchAllAccounts(api);

  console.log('\n[3/4] Fetching subnet ratios + alpha stakes...');
  const subnetRatio = await fetchSubnetRatios(api);
  console.log(`  ✅ ${subnetRatio.size} subnet ratios`);
  const stakedTao = await fetchAlphaStakes(api, subnetRatio);

  await api.disconnect();

  // ── Build richlist ───────────────────────────────────────────────────────────
  console.log('\n[4/4] Merging, sorting, writing to Supabase...');
  const richlist: Array<{ address: string; free: number; staked: number; total: number }> = [];

  const allAddrs = new Set([...freeBalances.keys(), ...stakedTao.keys()]);
  for (const addr of allAddrs) {
    const free = toTao(freeBalances.get(addr) ?? 0n);
    const staked = stakedTao.get(addr) ?? 0;
    if (free + staked < 0.001) continue; // skip dust
    richlist.push({ address: addr, free, staked, total: free + staked });
  }
  richlist.sort((a, b) => b.total - a.total);
  const top500 = richlist.slice(0, TOP_N);

  console.log(`  Top ${TOP_N} built. Writing to Supabase...`);

  // ── Write to Supabase in batches ─────────────────────────────────────────────
  const rows = top500.map((w, i) => ({
    address: w.address,
    date: today,
    balance_total: w.total,
    balance_free: w.free,
    balance_staked: w.staked,
    rank: i + 1,
  }));

  const BATCH = 50;
  let written = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('whale_snapshots')
      .upsert(batch, { onConflict: 'address,date' });
    if (error) {
      console.error(`  ✗ Supabase error (batch ${i}):`, error.message);
    } else {
      written += batch.length;
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`NIGHTLY SCAN COMPLETE`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Date              : ${today}`);
  console.log(`Total accounts    : ${freeBalances.size.toLocaleString()}`);
  console.log(`Alpha entries     : staking coldkeys ${stakedTao.size.toLocaleString()}`);
  console.log(`Top ${TOP_N} written   : ${written} rows to Supabase`);
  console.log(`Total time        : ${elapsed}s`);
  console.log(`\nTop 10:`);
  top500.slice(0, 10).forEach((w, i) => {
    console.log(`  ${String(i+1).padStart(3)}. ${w.address.slice(0,12)}...  total=${w.total.toFixed(2)} TAO  (free=${w.free.toFixed(2)}, staked=${w.staked.toFixed(2)})`);
  });
}

main().catch(e => { console.error(e); process.exit(1); });

/**
 * scripts/nightly-chain-scan.ts
 *
 * Nightly GitHub Actions job: fetch all Bittensor accounts + alpha stakes
 * directly from chain, compute top 500 by total TAO, write daily snapshot
 * to Supabase:
 *   - whale_snapshots       (top 500 total TAO per address)
 *   - whale_alpha_balances  (per-subnet alpha positions for top 500)
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
import { runSubnetScan } from './subnet-scan';

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

interface AlphaEntry {
  hotkey: string;
  netuid: number;
  balanceAlpha: number;  // raw alpha shares (in TAO units after /1e9)
  balanceAsTao: number;  // converted to TAO via subnet ratio
}

/**
 * Fetch all alpha stakes.
 * Returns:
 *   stakedTao: coldkey → total TAO staked (summed across all subnets)
 *   alphaDetail: coldkey → array of per-subnet entries (for whale_alpha_balances)
 */
async function fetchAlphaStakes(
  api: ApiPromise,
  subnetRatio: Map<number, number>
): Promise<{ stakedTao: Map<string, number>; alphaDetail: Map<string, AlphaEntry[]> }> {
  console.log('  Fetching alpha stakes...');
  const stakedTao = new Map<string, number>();
  const alphaDetail = new Map<string, AlphaEntry[]>();
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
        const [hotkey, coldkey, netuIdStr] = key.args.map((a: any) => a.toString());
        const netuid = parseInt(netuIdStr);
        const bitsVal = (val as any).toJSON()?.bits;
        const alphaTaoShares = alphaToTao(bitsVal);
        alphaStart = key.toString();
        if (!alphaTaoShares) continue;

        const ratio = subnetRatio.get(netuid) ?? 1.0;
        const asTao = alphaTaoShares * ratio;

        // Sum total staked per coldkey
        stakedTao.set(coldkey, (stakedTao.get(coldkey) ?? 0) + asTao);

        // Store per-subnet detail
        if (!alphaDetail.has(coldkey)) alphaDetail.set(coldkey, []);
        alphaDetail.get(coldkey)!.push({ hotkey, netuid, balanceAlpha: alphaTaoShares, balanceAsTao: asTao });

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
  return { stakedTao, alphaDetail };
}

async function scanRecentBlocks(
  api: ApiPromise,
  top500Addrs: Set<string>,
  subnetRatio: Map<number, number>,
  supabase: any,
  today: string
): Promise<{ txnsWritten: number; delegationsWritten: number }> {
  try {
    const header = await api.rpc.chain.getHeader();
    const currentBlock = header.number.toNumber();
    const BLOCKS_PER_DAY = 7200;
    const startBlock = currentBlock - BLOCKS_PER_DAY;
    const BATCH_SIZE = 50;

    console.log(`  Scanning blocks ${startBlock} → ${currentBlock} (${BLOCKS_PER_DAY} blocks)`);

    const txnRows: any[] = [];
    const delegationRows: any[] = [];
    let scanned = 0;

    for (let b = startBlock; b <= currentBlock; b += BATCH_SIZE) {
      const end = Math.min(b + BATCH_SIZE - 1, currentBlock);
      const blockNums = Array.from({ length: end - b + 1 }, (_, i) => b + i);

      await Promise.all(blockNums.map(async (blockNum) => {
        try {
          const blockHash = await api.rpc.chain.getBlockHash(blockNum);
          const [eventsCodec, tsCodec] = await Promise.all([
            (api.query as any).system.events.at(blockHash),
            (api.query as any).timestamp.now.at(blockHash),
          ]);
          const timestamp = tsCodec.toNumber();
          const isoString = new Date(timestamp).toISOString();
          const events: any[] = eventsCodec.toArray ? eventsCodec.toArray() : Array.from(eventsCodec as any);

          events.forEach((record: any, idx: number) => {
            const { event } = record;
            const section: string = event.section.toString();
            const method: string = event.method.toString();

            if (section === 'balances' && method === 'Transfer') {
              const from = event.data[0].toString();
              const to = event.data[1].toString();
              const amountRaw = event.data[2].toString();
              const fromIsWhale = top500Addrs.has(from);
              const toIsWhale = top500Addrs.has(to);
              if (fromIsWhale) {
                txnRows.push({
                  id: `${blockNum}-${idx}-OUT-${from}`,
                  address: from,
                  type: 'OUT',
                  amount: Number(BigInt(amountRaw)) / 1e9,
                  counterparty: to,
                  block_number: blockNum,
                  timestamp: isoString,
                  transaction_hash: null,
                });
              }
              if (toIsWhale) {
                txnRows.push({
                  id: `${blockNum}-${idx}-IN-${to}`,
                  address: to,
                  type: 'IN',
                  amount: Number(BigInt(amountRaw)) / 1e9,
                  counterparty: from,
                  block_number: blockNum,
                  timestamp: isoString,
                  transaction_hash: null,
                });
              }
            } else if (
              section === 'subtensorModule' &&
              (method === 'StakeAdded' || method === 'StakeRemoved')
            ) {
              const coldkey = event.data[0].toString();
              const hotkey = event.data[1].toString();
              // StakeAdded/StakeRemoved event layout (6 fields):
              // data[0]=coldkey, data[1]=hotkey, data[2]=tao_amount, data[3]=alpha_amount, data[4]=netuid, data[5]=extra
              const taoAmountRaw = event.data[2].toString();
              const alphaAmountRaw = event.data[3].toString();
              const netuId = Number(event.data[4].toString());
              if (top500Addrs.has(coldkey)) {
                const taoVal = Number(BigInt(taoAmountRaw)) / 1e9;
                const alphaVal = Number(BigInt(alphaAmountRaw)) / 1e9;
                const ratio = netuId === 0 ? 1.0 : (subnetRatio.get(netuId) ?? 1.0);
                delegationRows.push({
                  id: `${blockNum}-${idx}-${method}-${coldkey}`,
                  address: coldkey,
                  action: method === 'StakeAdded' ? 'DELEGATE' : 'UNDELEGATE',
                  delegate: hotkey,
                  delegate_name: null,
                  netuid: netuId,
                  alpha: alphaVal,
                  amount: taoVal,
                  alpha_price_in_tao: ratio,
                  timestamp: isoString,
                  block_number: blockNum,
                });
              }
            }
          });
        } catch (err: any) {
          console.warn(`  ⚠ Block ${blockNum} error: ${err.message}`);
        }
      }));

      scanned += blockNums.length;
      if (scanned % 500 === 0 || scanned >= BLOCKS_PER_DAY) {
        console.log(`  ... scanned ${scanned} blocks`);
      }
      if (end < currentBlock) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`  Block scan complete: ${txnRows.length} transfer events, ${delegationRows.length} delegation events`);

    const BATCH = 50;
    let txnsWritten = 0;
    for (let i = 0; i < txnRows.length; i += BATCH) {
      const batch = txnRows.slice(i, i + BATCH);
      const { error } = await (supabase as any).from('whale_transactions').upsert(batch, { onConflict: 'id' });
      if (error) console.error(`  ✗ whale_transactions batch ${i}: ${error.message}`);
      else txnsWritten += batch.length;
    }

    let delegationsWritten = 0;
    for (let i = 0; i < delegationRows.length; i += BATCH) {
      const batch = delegationRows.slice(i, i + BATCH);
      const { error } = await (supabase as any)
        .from('whale_delegations')
        .upsert(batch, { onConflict: 'address,block_number,action,delegate,netuid' });
      if (error) console.error(`  ✗ whale_delegations batch ${i}: ${error.message}`);
      else delegationsWritten += batch.length;
    }

    return { txnsWritten, delegationsWritten };
  } catch (err: any) {
    console.error(`  ✗ scanRecentBlocks failed: ${err.message}`);
    return { txnsWritten: 0, delegationsWritten: 0 };
  }
}

async function main() {
  const t0 = Date.now();
  const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const today = dateArg ?? new Date().toISOString().split('T')[0];
  const skipBlocks = process.argv.includes('--skip-blocks');
  console.log(`\n🔗 Nightly chain scan — ${today}${dateArg ? ' (custom date)' : ''}${skipBlocks ? ' [skip-blocks]' : ''}`);

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
  const { stakedTao, alphaDetail } = await fetchAlphaStakes(api, subnetRatio);

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

  const BATCH = 50;

  // ── Write whale_snapshots ────────────────────────────────────────────────────
  const snapshotRows = top500.map((w, i) => ({
    address: w.address,
    date: today,
    balance_total: w.total,
    balance_free: w.free,
    balance_staked: w.staked,
    rank: i + 1,
  }));

  let snapshotsWritten = 0;
  for (let i = 0; i < snapshotRows.length; i += BATCH) {
    const batch = snapshotRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('whale_snapshots')
      .upsert(batch, { onConflict: 'address,date' });
    if (error) console.error(`  ✗ whale_snapshots batch ${i}: ${error.message}`);
    else snapshotsWritten += batch.length;
  }
  console.log(`  ✅ whale_snapshots: ${snapshotsWritten} rows`);

  // ── Write whale_alpha_balances (per-subnet aggregated, top 500 only) ─────────
  // Aggregate multiple hotkeys per (address, netuid) into one row (sum alpha+tao, keep first hotkey)
  const top500Addrs = new Set(top500.map(w => w.address));
  const alphaRows: any[] = [];
  for (const [address, entries] of alphaDetail) {
    if (!top500Addrs.has(address)) continue;
    const rank = top500.findIndex(w => w.address === address) + 1;
    // Aggregate by netuid
    const byNetuid = new Map<number, { balance_alpha: number; balance_as_tao: number; hotkey: string }>();
    for (const e of entries) {
      const existing = byNetuid.get(e.netuid);
      if (existing) {
        existing.balance_alpha += e.balanceAlpha;
        existing.balance_as_tao += e.balanceAsTao;
      } else {
        byNetuid.set(e.netuid, { balance_alpha: e.balanceAlpha, balance_as_tao: e.balanceAsTao, hotkey: e.hotkey });
      }
    }
    for (const [netuid, agg] of byNetuid) {
      alphaRows.push({
        address,
        date: today,
        netuid,
        hotkey: agg.hotkey,
        balance_alpha: agg.balance_alpha,
        balance_as_tao: agg.balance_as_tao,
        rank,
      });
    }
  }

  let alphaWritten = 0;
  for (let i = 0; i < alphaRows.length; i += BATCH) {
    const batch = alphaRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('whale_alpha_balances')
      .upsert(batch, { onConflict: 'address,date,netuid' });
    if (error) console.error(`  ✗ whale_alpha_balances batch ${i}: ${error.message}`);
    else alphaWritten += batch.length;
  }
  console.log(`  ✅ whale_alpha_balances: ${alphaWritten} rows`);

  // ── Subnet snapshots ─────────────────────────────────────────────────────────
  console.log('\n[5/6] Running subnet scan...');
  let subnetSnapshotsWritten = 0;
  try {
    const subnetResult = await runSubnetScan(api, supabase, today);
    subnetSnapshotsWritten = subnetResult.written;
  } catch (err: any) {
    console.error(`  ✗ Subnet scan failed: ${err.message}`);
  }

  // ── Block scan for whale_transactions + whale_delegations ────────────────────
  let txnsWritten = 0, delegationsWritten = 0;
  if (skipBlocks) {
    console.log('\n[6/6] Skipping block scan (--skip-blocks flag set)');
  } else {
    console.log('\n[6/6] Scanning last 24h of blocks for transactions + delegations...');
    ({ txnsWritten, delegationsWritten } = await scanRecentBlocks(api, top500Addrs, subnetRatio, supabase, today));
  }

  await api.disconnect();

  // ── Validation ───────────────────────────────────────────────────────────────
  console.log('\n[VALIDATION] Checking table counts...');
  const validationErrors: string[] = [];

  // whale_snapshots: expect exactly TOP_N rows for today
  const { count: snapCount, error: snapCountErr } = await supabase
    .from('whale_snapshots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);
  if (snapCountErr) {
    validationErrors.push(`whale_snapshots count error: ${snapCountErr.message}`);
  } else if ((snapCount ?? 0) < TOP_N * 0.95) {
    validationErrors.push(`whale_snapshots: expected ~${TOP_N} rows for ${today}, got ${snapCount}`);
  } else {
    console.log(`  ✅ whale_snapshots: ${snapCount} rows for ${today} (expected ${TOP_N})`);
  }

  // whale_alpha_balances: expect at least some rows for today
  const { count: alphaCount2, error: alphaCountErr } = await supabase
    .from('whale_alpha_balances')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);
  if (alphaCountErr) {
    validationErrors.push(`whale_alpha_balances count error: ${alphaCountErr.message}`);
  } else if ((alphaCount2 ?? 0) === 0) {
    validationErrors.push(`whale_alpha_balances: 0 rows for ${today} — expected at least some alpha stakes`);
  } else {
    console.log(`  ✅ whale_alpha_balances: ${alphaCount2} rows for ${today}`);
  }

  // whale_snapshots: spot-check rank 1 has the highest balance
  const { data: topTwo } = await supabase
    .from('whale_snapshots')
    .select('address, rank, balance_total')
    .eq('date', today)
    .order('rank', { ascending: true })
    .limit(2);
  if (topTwo && topTwo.length >= 2) {
    if (topTwo[0].balance_total >= topTwo[1].balance_total) {
      console.log(`  ✅ rank order check: #1 (${topTwo[0].balance_total.toFixed(0)} TAO) > #2 (${topTwo[1].balance_total.toFixed(0)} TAO)`);
    } else {
      validationErrors.push(`rank order broken: rank #1 has less TAO than rank #2`);
    }
  }

  // whale_snapshots: check no null addresses
  const { count: nullAddrCount } = await supabase
    .from('whale_snapshots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .is('address', null);
  if ((nullAddrCount ?? 0) > 0) {
    validationErrors.push(`whale_snapshots: ${nullAddrCount} rows with null address`);
  } else {
    console.log(`  ✅ no null addresses in whale_snapshots`);
  }

  // whale_alpha_balances: distinct wallets count
  const { data: distinctWallets } = await supabase
    .from('whale_alpha_balances')
    .select('address')
    .eq('date', today);
  const uniqueWalletCount = new Set(distinctWallets?.map(r => r.address) ?? []).size;
  console.log(`  ✅ whale_alpha_balances: ${uniqueWalletCount} distinct wallets with alpha positions today`);

  // whale_alpha_balances: distinct subnets count
  const { data: distinctSubnets } = await supabase
    .from('whale_alpha_balances')
    .select('netuid')
    .eq('date', today);
  const uniqueSubnetCount = new Set(distinctSubnets?.map(r => r.netuid) ?? []).size;
  console.log(`  ✅ whale_alpha_balances: ${uniqueSubnetCount} distinct subnets represented today`);

  // whale_transactions today
  const { count: txnCount } = await supabase
    .from('whale_transactions')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', today + 'T00:00:00Z');
  console.log(`  ✅ whale_transactions: ${txnCount ?? 0} rows for today`);

  // whale_delegations today
  const { count: delCount } = await supabase
    .from('whale_delegations')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', today + 'T00:00:00Z');
  console.log(`  ✅ whale_delegations: ${delCount ?? 0} rows for today`);

  // Total row counts across all tables (for history tracking)
  const tables = ['whale_snapshots', 'whale_alpha_balances', 'whale_transactions', 'whale_delegations'] as const;
  const totalCounts: Record<string, number> = {};
  for (const t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    totalCounts[t] = count ?? 0;
  }
  console.log(`\n  Table totals (all-time):`);
  for (const [t, c] of Object.entries(totalCounts)) {
    console.log(`    ${t}: ${c.toLocaleString()} rows`);
  }

  if (validationErrors.length > 0) {
    console.error(`\n  ⚠️  VALIDATION WARNINGS (${validationErrors.length}):`);
    for (const e of validationErrors) console.error(`    ✗ ${e}`);
  } else {
    console.log(`\n  ✅ All validation checks passed`);
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`NIGHTLY SCAN COMPLETE`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Date              : ${today}`);
  console.log(`Total accounts    : ${freeBalances.size.toLocaleString()}`);
  console.log(`Staking coldkeys  : ${stakedTao.size.toLocaleString()}`);
  console.log(`whale_snapshots   : ${snapshotsWritten} rows (today)`);
  console.log(`whale_alpha_balances: ${alphaWritten} rows (today)`);
  console.log(`subnet_snapshots  : ${subnetSnapshotsWritten} rows (today)`);
  console.log(`whale_transactions : ${txnsWritten} rows (today)`);
  console.log(`whale_delegations  : ${delegationsWritten} rows (today)`);
  console.log(`Validation        : ${validationErrors.length === 0 ? '✅ PASSED' : `⚠️  ${validationErrors.length} warnings`}`);
  console.log(`Total time        : ${elapsed}s`);
  console.log(`\nTop 10:`);
  top500.slice(0, 10).forEach((w, i) => {
    const subnets = alphaDetail.get(w.address)?.length ?? 0;
    console.log(`  ${String(i+1).padStart(3)}. ${w.address.slice(0,12)}...  total=${w.total.toFixed(2)} TAO  (free=${w.free.toFixed(2)}, staked=${w.staked.toFixed(2)}, subnets=${subnets})`);
  });
}

main().catch(e => { console.error(e); process.exit(1); });

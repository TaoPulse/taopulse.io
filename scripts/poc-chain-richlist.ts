/**
 * POC: Chain-Direct Richlist
 *
 * Fetches all accounts + stakes directly from Bittensor chain.
 * With dTAO, stake is stored as alpha(hotkey, coldkey, netuid) → alpha shares.
 * We convert alpha → TAO using subnet pool ratios: subnetTAO / subnetAlphaIn.
 *
 * Steps:
 *  1. Fetch all accounts (free balances) via system.account.entriesPaged
 *  2. Fetch subnet price ratios (subnetTAO / subnetAlphaIn per netuid)
 *  3. Fetch all alpha entries (hotkey, coldkey, netuid) → sum per coldkey in TAO
 *  4. Merge free + staked = total, sort, print top 20
 */

import { ApiPromise, WsProvider } from '@polkadot/api';

function toTao(rao: bigint | number | string): number {
  return Number(BigInt(rao.toString())) / 1e9;
}

/**
 * Parse I64F64 fixed-point alpha bits → float (in alpha share units, NOT rao).
 * The 128-bit `bits` field: upper 64 bits = integer, lower 64 bits = fraction.
 * Alpha shares are denominated in rao (nits), so divide by 1e9 to get TAO.
 */
function alphaToTao(bits: string | number): number {
  if (!bits || bits === '0' || bits === 0) return 0;
  const hex = bits.toString();
  if (!hex.startsWith('0x')) return 0;
  // Parse as big integer and right-shift 64 bits to get integer part (RAO)
  const full = BigInt(hex);
  const integerPartRao = full >> 64n;
  return Number(integerPartRao) / 1e9;
}

async function main() {
  const t0 = Date.now();
  const provider = new WsProvider('wss://entrypoint-finney.opentensor.ai:443');
  const api = await ApiPromise.create({ provider });
  console.log('Connected.\n');

  // ── Step 1: All accounts (free balances) ────────────────────────────────────
  console.log('Fetching all accounts (free balances)...');
  const tAccStart = Date.now();
  const freeBalances = new Map<string, bigint>(); // coldkey → free RAO
  let startKey: string | undefined;
  let pageCount = 0;

  while (true) {
    const page = await (api.query as any).system.account.entriesPaged({
      args: [],
      pageSize: 1000,
      startKey,
    });
    if (page.length === 0) break;
    for (const [key, val] of page) {
      const addr: string = key.args[0].toString();
      const free = BigInt((val as any).data.free.toString());
      freeBalances.set(addr, free);
      startKey = key.toString();
    }
    pageCount++;
    if (pageCount % 50 === 0) process.stdout.write(`  ... ${freeBalances.size} accounts\n`);
  }
  const tAccEnd = Date.now();
  console.log(`✅ Accounts: ${freeBalances.size} in ${((tAccEnd - tAccStart) / 1000).toFixed(1)}s\n`);

  // ── Step 2: Subnet price ratios (alpha → TAO conversion) ────────────────────
  console.log('Fetching subnet TAO/Alpha ratios...');
  const tRatioStart = Date.now();
  const subnetRatio = new Map<number, number>(); // netuid → TAO per alpha share

  const taoEntries = await (api.query as any).subtensorModule.subnetTAO.entries();
  const alphaEntries = await (api.query as any).subtensorModule.subnetAlphaIn.entries();

  const subnetTaoMap = new Map<number, bigint>();
  for (const [k, v] of taoEntries) {
    subnetTaoMap.set(k.args[0].toNumber(), BigInt(v.toString()));
  }
  for (const [k, v] of alphaEntries) {
    const netuid = k.args[0].toNumber();
    const alphaIn = BigInt(v.toString());
    const taoIn = subnetTaoMap.get(netuid) ?? 0n;
    if (alphaIn > 0n) {
      subnetRatio.set(netuid, Number(taoIn) / Number(alphaIn));
    } else {
      subnetRatio.set(netuid, 1.0); // subnet 0 (root) — 1:1
    }
  }
  // Subnet 0 (root) is always 1:1
  subnetRatio.set(0, 1.0);
  console.log(`✅ ${subnetRatio.size} subnet ratios in ${((Date.now() - tRatioStart) / 1000).toFixed(1)}s\n`);

  // ── Step 3: All alpha entries → sum per coldkey in TAO ──────────────────────
  console.log('Fetching all alpha stake entries...');
  const tAlphaStart = Date.now();
  const stakedTao = new Map<string, number>(); // coldkey → total TAO staked
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
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Page timeout')), 60000))
      ]) as any[];

      if (page.length === 0) break;
      retries = 0; // reset on success

      for (const [key, val] of page) {
        const [_hotkey, coldkey, netuid] = key.args.map((a: any) => a.toString());
        const bitsVal = (val as any).toJSON()?.bits;
        const alphaTaoShares = alphaToTao(bitsVal);
        if (!alphaTaoShares) { alphaStart = key.toString(); continue; }

        const netuidNum = parseInt(netuid);
        const ratio = subnetRatio.get(netuidNum) ?? 1.0;
        const alphaTao = alphaTaoShares * ratio;

        stakedTao.set(coldkey, (stakedTao.get(coldkey) ?? 0) + alphaTao);
        alphaStart = key.toString();
        alphaCount++;
      }

      if (alphaCount % 5000 === 0 && alphaCount > 0) {
        process.stdout.write(`  ... ${alphaCount} alpha entries (${((Date.now() - tAlphaStart)/1000).toFixed(0)}s)\n`);
      }
    } catch (err: any) {
      retries++;
      console.error(`  ⚠ Error on alpha page (retry ${retries}/${MAX_RETRIES}): ${err.message}`);
      if (retries >= MAX_RETRIES) {
        console.error('  ✗ Too many retries on alpha scan, continuing with what we have');
        break;
      }
      // Wait before retry, reconnect if needed
      await new Promise(r => setTimeout(r, 5000 * retries));
      try {
        if (!api.isConnected) {
          console.log('  Reconnecting...');
          await api.connect();
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch {}
    }
  }
  console.log(`✅ ${alphaCount} alpha entries, ${stakedTao.size} staking coldkeys in ${((Date.now() - tAlphaStart) / 1000).toFixed(1)}s\n`);

  // ── Step 4: Merge + sort ────────────────────────────────────────────────────
  console.log('Merging and sorting...');
  const tMergeStart = Date.now();
  const richlist: Array<{ address: string; free: number; staked: number; total: number }> = [];

  const allAddrs = new Set([...freeBalances.keys(), ...stakedTao.keys()]);
  for (const addr of allAddrs) {
    const free = toTao(freeBalances.get(addr) ?? 0n);
    const staked = stakedTao.get(addr) ?? 0;
    richlist.push({ address: addr, free, staked, total: free + staked });
  }
  richlist.sort((a, b) => b.total - a.total);
  console.log(`✅ Merged ${richlist.length} addresses in ${((Date.now() - tMergeStart) / 1000).toFixed(1)}s\n`);

  // ── Results ─────────────────────────────────────────────────────────────────
  const totalTime = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('='.repeat(60));
  console.log(`TOP 20 WALLETS BY TOTAL TAO BALANCE`);
  console.log('='.repeat(60));
  console.log(`${'RANK'.padEnd(6)} ${'ADDRESS'.padEnd(48)} ${'FREE'.padStart(12)} ${'STAKED'.padStart(12)} ${'TOTAL'.padStart(12)}`);
  console.log('-'.repeat(100));
  richlist.slice(0, 20).forEach((w, i) => {
    console.log(
      `${String(i + 1).padEnd(6)} ${w.address.padEnd(48)} ${w.free.toFixed(2).padStart(12)} ${w.staked.toFixed(2).padStart(12)} ${w.total.toFixed(2).padStart(12)}`
    );
  });

  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY`);
  console.log('='.repeat(60));
  console.log(`Total accounts on chain  : ${freeBalances.size.toLocaleString()}`);
  console.log(`Alpha entries processed  : ${alphaCount.toLocaleString()}`);
  console.log(`Unique staking coldkeys  : ${stakedTao.size.toLocaleString()}`);
  console.log(`Total run time           : ${totalTime}s`);

  await api.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

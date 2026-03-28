import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  const provider = new WsProvider('wss://entrypoint-finney.opentensor.ai:443');
  const api = await ApiPromise.create({ provider });

  const header = await api.rpc.chain.getHeader();
  const current = header.number.toNumber();
  console.log(`Scanning from block ${current} backwards...`);

  for (let b = current; b > current - 1000; b--) {
    const hash = await api.rpc.chain.getBlockHash(b);
    const events: any[] = (await (api.query as any).system.events.at(hash)).toArray();
    for (const r of events) {
      const s = r.event.section.toString();
      const m = r.event.method.toString();
      if (s === 'subtensorModule' && (m === 'StakeAdded' || m === 'StakeRemoved')) {
        console.log(`\nBlock ${b} — ${s}.${m}`);
        r.event.data.forEach((d: any, i: number) => {
          console.log(`  data[${i}]: ${d.toString()} (type: ${d.constructor?.name})`);
        });
        await api.disconnect();
        process.exit(0);
      }
    }
  }
  console.log('No StakeAdded/StakeRemoved found in last 1000 blocks');
  await api.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

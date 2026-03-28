/**
 * validate-scan.ts
 * Validates data in the 4 whale tables for a given date.
 * Usage: npx ts-node scripts/validate-scan.ts [YYYY-MM-DD]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function validate(date: string) {
  console.log(`\n${'='.repeat(55)}`)
  console.log(`  VALIDATION REPORT — ${date}`)
  console.log(`${'='.repeat(55)}`)

  let allPassed = true

  // ── whale_snapshots ──────────────────────────────────────────────────────────
  console.log('\n📊 whale_snapshots')
  const { data: snaps, error: snapErr } = await supabase
    .from('whale_snapshots')
    .select('address, total_tao, rank')
    .eq('date', date)
    .order('rank', { ascending: true })

  if (snapErr) { console.error('  ❌ Query error:', snapErr.message); allPassed = false }
  else {
    const count = snaps?.length ?? 0
    const distinctAddresses = new Set(snaps?.map(r => r.address)).size
    const nullAddresses = snaps?.filter(r => !r.address).length ?? 0
    const maxTao = snaps ? Math.max(...snaps.map(r => parseFloat(r.total_tao ?? '0'))) : 0
    const minTao = snaps ? Math.min(...snaps.map(r => parseFloat(r.total_tao ?? '0'))) : 0
    const rankOk = snaps?.[0]?.rank === 1

    console.log(`  Rows          : ${count} ${count >= 475 ? '✅' : count > 0 ? '⚠️  (expected ~500)' : '❌ EMPTY'}`)
    console.log(`  Distinct wallets: ${distinctAddresses}`)
    console.log(`  Null addresses: ${nullAddresses} ${nullAddresses === 0 ? '✅' : '❌'}`)
    console.log(`  TAO range     : ${minTao.toFixed(0)} – ${maxTao.toFixed(0)} TAO`)
    console.log(`  Rank #1 first : ${rankOk ? '✅' : '❌'}`)
    if (count < 475) allPassed = false
    if (nullAddresses > 0) allPassed = false

    // Top 5
    console.log(`  Top 5 wallets:`)
    snaps?.slice(0, 5).forEach(r => {
      console.log(`    #${r.rank} ${r.address?.slice(0, 12)}...  ${parseFloat(r.total_tao ?? '0').toFixed(2)} TAO`)
    })
  }

  // ── whale_alpha_balances ─────────────────────────────────────────────────────
  console.log('\n📊 whale_alpha_balances')
  const { data: alpha, error: alphaErr } = await supabase
    .from('whale_alpha_balances')
    .select('address, netuid, balance_as_tao')
    .eq('date', date)

  if (alphaErr) { console.error('  ❌ Query error:', alphaErr.message); allPassed = false }
  else {
    const count = alpha?.length ?? 0
    const distinctWallets = new Set(alpha?.map(r => r.address)).size
    const distinctSubnets = new Set(alpha?.map(r => r.netuid)).size
    const nullRows = alpha?.filter(r => !r.address || r.netuid == null).length ?? 0

    console.log(`  Rows          : ${count} ${count > 0 ? '✅' : '❌ EMPTY'}`)
    console.log(`  Distinct wallets: ${distinctWallets}`)
    console.log(`  Distinct subnets: ${distinctSubnets}`)
    console.log(`  Null rows     : ${nullRows} ${nullRows === 0 ? '✅' : '❌'}`)

    // Top 5 by balance
    const top5 = [...(alpha ?? [])].sort((a, b) => parseFloat(b.balance_as_tao ?? '0') - parseFloat(a.balance_as_tao ?? '0')).slice(0, 5)
    console.log(`  Top 5 positions:`)
    top5.forEach(r => {
      console.log(`    ${r.address?.slice(0, 12)}... SN${r.netuid}  ${parseFloat(r.balance_as_tao ?? '0').toFixed(2)} TAO`)
    })

    if (count === 0) allPassed = false
  }

  // ── whale_transactions ───────────────────────────────────────────────────────
  console.log('\n📊 whale_transactions')
  const { data: txns, error: txnErr } = await supabase
    .from('whale_transactions')
    .select('from_address, to_address, amount, timestamp, block_number')
    .eq('date', date)

  if (txnErr) { console.error('  ❌ Query error:', txnErr.message); allPassed = false }
  else {
    const count = txns?.length ?? 0
    const distinctFrom = new Set(txns?.map(r => r.from_address)).size
    const nullBlocks = txns?.filter(r => !r.block_number).length ?? 0
    const maxAmount = txns ? Math.max(...txns.map(r => parseFloat(r.amount ?? '0'))) : 0

    console.log(`  Rows          : ${count} ${count > 0 ? '✅' : '⚠️  0 rows (may be normal if quiet day)'}`)
    console.log(`  Distinct senders: ${distinctFrom}`)
    console.log(`  Null block_number: ${nullBlocks} ${nullBlocks === 0 ? '✅' : '❌'}`)
    if (count > 0) console.log(`  Largest txn   : ${maxAmount.toFixed(2)} TAO`)
  }

  // ── whale_delegations ────────────────────────────────────────────────────────
  console.log('\n📊 whale_delegations')
  const { data: dels, error: delErr } = await supabase
    .from('whale_delegations')
    .select('address, action, netuid, amount, block_number')
    .eq('date', date)

  if (delErr) { console.error('  ❌ Query error:', delErr.message); allPassed = false }
  else {
    const count = dels?.length ?? 0
    const delegates = new Set(dels?.map(r => r.address)).size
    const actions = dels?.reduce((acc, r) => { acc[r.action] = (acc[r.action] ?? 0) + 1; return acc }, {} as Record<string, number>)

    console.log(`  Rows          : ${count} ${count > 0 ? '✅' : '⚠️  0 rows (may be normal if no staking activity)'}`)
    console.log(`  Distinct wallets: ${delegates}`)
    if (count > 0) console.log(`  Actions       : ${JSON.stringify(actions)}`)
  }

  // ── All-time totals ──────────────────────────────────────────────────────────
  console.log('\n📊 All-time row counts')
  for (const table of ['whale_snapshots', 'whale_alpha_balances', 'whale_transactions', 'whale_delegations']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`  ${table.padEnd(25)}: ${count?.toLocaleString() ?? '?'} total rows`)
  }

  console.log(`\n${'='.repeat(55)}`)
  console.log(`  RESULT: ${allPassed ? '✅ ALL CHECKS PASSED' : '⚠️  SOME CHECKS FAILED — review above'}`)
  console.log(`${'='.repeat(55)}\n`)
}

const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a))
const date = dateArg ?? new Date().toISOString().split('T')[0]
validate(date).catch(e => { console.error(e); process.exit(1) })

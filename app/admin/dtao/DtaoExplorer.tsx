'use client'

import { useState, useMemo } from 'react'
import type { DtaoPool } from './page'

type SortField = 'market_cap' | 'price' | 'price_change_1_day' | 'tao_volume_24_hr' | 'liquidity'
type SortDir = 'asc' | 'desc'

function toNum(val: string | null | undefined): number {
  if (!val) return 0
  const n = parseFloat(val)
  return isNaN(n) ? 0 : n
}

function formatPrice(val: string | null | undefined): string {
  if (!val) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return n.toFixed(4)
}

function formatTao(val: string | null | undefined): string {
  if (!val) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B τ'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M τ'
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K τ'
  return n.toFixed(2) + ' τ'
}

function formatPct(val: string | null | undefined): { text: string; color: string } {
  if (!val) return { text: '—', color: 'text-gray-500' }
  const n = parseFloat(val)
  if (isNaN(n)) return { text: '—', color: 'text-gray-500' }
  return {
    text: (n >= 0 ? '+' : '') + n.toFixed(2) + '%',
    color: n > 0 ? 'text-emerald-400' : n < 0 ? 'text-red-400' : 'text-gray-400',
  }
}

const SORT_LABELS: Record<SortField, string> = {
  market_cap: 'Market Cap',
  price: 'Price',
  price_change_1_day: '24h Change',
  tao_volume_24_hr: 'Volume',
  liquidity: 'Liquidity',
}

export default function DtaoExplorer({ pools }: { pools: DtaoPool[] }) {
  const [hideStartup, setHideStartup] = useState(true)
  const [sortField, setSortField] = useState<SortField>('market_cap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const activePools = useMemo(() => pools.filter(p => !p.startup_mode), [pools])

  // Stats bar
  const stats = useMemo(() => {
    const totalLiquidity = activePools.reduce((sum, p) => sum + toNum(p.liquidity), 0)
    const sorted24h = [...activePools]
      .filter(p => p.price_change_1_day != null)
      .sort((a, b) => toNum(b.price_change_1_day) - toNum(a.price_change_1_day))
    const gainer = sorted24h[0] ?? null
    const loser = sorted24h[sorted24h.length - 1] ?? null
    return { totalLiquidity, gainer, loser }
  }, [activePools])

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = hideStartup ? activePools : pools
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        p =>
          p.name?.toLowerCase().includes(q) ||
          p.symbol?.toLowerCase().includes(q) ||
          String(p.netuid).includes(q),
      )
    }
    const dir = sortDir === 'desc' ? -1 : 1
    return [...list].sort((a, b) => {
      const av = toNum(a[sortField] as string)
      const bv = toNum(b[sortField] as string)
      return (bv - av) * dir
    })
  }, [activePools, pools, hideStartup, search, sortField, sortDir])

  const displayed = filtered.slice(0, 50)

  // Top movers (active pools only, 24h)
  const movers = useMemo(() => {
    const withChange = activePools.filter(p => p.price_change_1_day != null)
    const sorted = [...withChange].sort(
      (a, b) => toNum(b.price_change_1_day) - toNum(a.price_change_1_day),
    )
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    }
  }, [activePools])

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (field !== sortField) return <span className="text-gray-600 ml-1">↕</span>
    return <span className="text-purple-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  const gainerPct = formatPct(stats.gainer?.price_change_1_day)
  const loserPct = formatPct(stats.loser?.price_change_1_day)

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              dTAO Alpha Token Explorer
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Live alpha token prices from all active Bittensor subnets — powered by on-chain AMM pools
            </p>
          </div>
          <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-600/30 whitespace-nowrap">
            PREVIEW — Admin Only
          </span>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-[#0f1623] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Subnets</div>
            <div className="text-2xl font-bold text-white tabular-nums">{activePools.length}</div>
            <div className="text-xs text-gray-500 mt-1">startup_mode = false</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f1623] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Liquidity</div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatTao(String(stats.totalLiquidity))}
            </div>
            <div className="text-xs text-gray-500 mt-1">across all active pools</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f1623] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Top 24h Gainer</div>
            {stats.gainer ? (
              <>
                <div className="text-base font-semibold text-white truncate">{stats.gainer.name}</div>
                <div className={`text-sm font-bold mt-0.5 ${gainerPct.color}`}>{gainerPct.text}</div>
              </>
            ) : (
              <div className="text-gray-500">—</div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f1623] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Top 24h Loser</div>
            {stats.loser ? (
              <>
                <div className="text-base font-semibold text-white truncate">{stats.loser.name}</div>
                <div className={`text-sm font-bold mt-0.5 ${loserPct.color}`}>{loserPct.text}</div>
              </>
            ) : (
              <div className="text-gray-500">—</div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Sort buttons */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SORT_LABELS) as SortField[]).map(field => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  sortField === field
                    ? 'bg-purple-600/20 border-purple-600/40 text-purple-300'
                    : 'bg-[#0f1623] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {SORT_LABELS[field]}
                {sortField === field && (
                  <span className="ml-1 text-purple-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Hide startup toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setHideStartup(v => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                hideStartup ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  hideStartup ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm text-gray-400">Hide startup mode</span>
          </label>

          {/* Search */}
          <input
            type="text"
            placeholder="Search name, symbol, netuid…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56 px-3 py-1.5 rounded-lg text-sm bg-[#0f1623] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600/50"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0a0f1a] border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-16">Netuid</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Price (τ)<SortIcon field="price" />
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('market_cap')}
                  >
                    Market Cap<SortIcon field="market_cap" />
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('price_change_1_day')}
                  >
                    24h Change<SortIcon field="price_change_1_day" />
                  </th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">7d Change</th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors hidden lg:table-cell"
                    onClick={() => handleSort('tao_volume_24_hr')}
                  >
                    Volume 24h<SortIcon field="tao_volume_24_hr" />
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors hidden lg:table-cell"
                    onClick={() => handleSort('liquidity')}
                  >
                    Liquidity<SortIcon field="liquidity" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      No subnets found
                    </td>
                  </tr>
                )}
                {displayed.map((pool, i) => {
                  const chg24 = formatPct(pool.price_change_1_day)
                  const chg7d = formatPct(pool.price_change_1_week)
                  const isSelected = selectedRow === pool.netuid
                  return (
                    <tr
                      key={pool.netuid}
                      onClick={() => setSelectedRow(isSelected ? null : pool.netuid)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-600/10 border-l-2 border-l-purple-500'
                          : i % 2 === 0
                          ? 'bg-[#0f1623] hover:bg-white/5'
                          : 'bg-[#0b1019] hover:bg-white/5'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400 tabular-nums">{pool.netuid}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{pool.name || '—'}</div>
                        {pool.symbol && (
                          <div className="text-xs text-gray-500">{pool.symbol}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-white">
                        {formatPrice(pool.price)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-300">
                        {formatTao(pool.market_cap)}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-medium ${chg24.color}`}>
                        {chg24.text}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-medium hidden md:table-cell ${chg7d.color}`}>
                        {chg7d.text}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-300 hidden lg:table-cell">
                        {formatTao(pool.tao_volume_24_hr)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-300 hidden lg:table-cell">
                        {formatTao(pool.liquidity)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <div className="bg-[#0a0f1a] border-t border-white/10 px-4 py-3 text-xs text-gray-500 text-center">
              Showing top 50 of {filtered.length} subnets
            </div>
          )}
        </div>

        {/* Top Movers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gainers */}
          <div className="rounded-xl border border-emerald-500/20 bg-[#0f1623] p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔥</span>
              <h3 className="font-semibold text-white">Top 5 Gainers (24h)</h3>
            </div>
            <div className="space-y-2">
              {movers.gainers.length === 0 && (
                <div className="text-gray-500 text-sm">No data</div>
              )}
              {movers.gainers.map(pool => {
                const pct = formatPct(pool.price_change_1_day)
                return (
                  <div
                    key={pool.netuid}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <span className="text-white font-medium text-sm">{pool.name}</span>
                      <span className="text-gray-500 text-xs ml-2">#{pool.netuid}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 tabular-nums">{formatPrice(pool.price)} τ</div>
                      <div className={`text-sm font-bold tabular-nums ${pct.color}`}>{pct.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Losers */}
          <div className="rounded-xl border border-red-500/20 bg-[#0f1623] p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📉</span>
              <h3 className="font-semibold text-white">Top 5 Losers (24h)</h3>
            </div>
            <div className="space-y-2">
              {movers.losers.length === 0 && (
                <div className="text-gray-500 text-sm">No data</div>
              )}
              {movers.losers.map(pool => {
                const pct = formatPct(pool.price_change_1_day)
                return (
                  <div
                    key={pool.netuid}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <span className="text-white font-medium text-sm">{pool.name}</span>
                      <span className="text-gray-500 text-xs ml-2">#{pool.netuid}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 tabular-nums">{formatPrice(pool.price)} τ</div>
                      <div className={`text-sm font-bold tabular-nums ${pct.color}`}>{pct.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 pb-4">
          Data from TaoStats API · Refreshes every 60s · {pools.length} total subnets in feed
        </div>
      </div>
    </div>
  )
}

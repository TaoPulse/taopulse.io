import DtaoExplorer from './DtaoExplorer'

export const revalidate = 60

export interface DtaoPool {
  netuid: number
  name: string
  symbol: string
  price: string
  market_cap: string
  liquidity: string
  price_change_1_hour: string | null
  price_change_1_day: string | null
  price_change_1_week: string | null
  tao_volume_24_hr: string
  alpha_staked: string
  total_alpha: string
  startup_mode: boolean
}

async function fetchDtaoPools(): Promise<DtaoPool[]> {
  const apiKey = process.env.TAOSTATS_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch('https://api.taostats.io/api/dtao/pool/latest/v1?limit=200', {
      headers: { Authorization: apiKey },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []) as DtaoPool[]
  } catch {
    return []
  }
}

export default async function DtaoAdminPage() {
  const pools = await fetchDtaoPools()
  return <DtaoExplorer pools={pools} />
}

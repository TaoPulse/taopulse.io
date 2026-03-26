import type { Metadata } from "next";
import Link from "next/link";
import CopyButton from "./CopyButton";
import WalletSearchForm from "../WalletSearchForm";

const TAOSTATS_BASE = "https://api.taostats.io";

function truncateAddress(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

function formatTao(rao: string | number | undefined | null): string {
  if (rao == null) return "—";
  const tao = typeof rao === "string" ? parseFloat(rao) / 1e9 : rao;
  if (isNaN(tao)) return "—";
  return tao.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function formatUsd(tao: number, price: number | null): string {
  if (price == null) return "—";
  const usd = tao * price;
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAccount(address: string): Promise<any | null> {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) return null;
  try {
    // account/latest/v1 supports address filter and works with ss58 format
    const res = await fetch(`${TAOSTATS_BASE}/api/account/latest/v1?address=${address}`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchDelegations(address: string): Promise<any | null> {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${TAOSTATS_BASE}/api/delegation/v1?coldkey=${address}&limit=20`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTransfers(address: string): Promise<any | null> {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${TAOSTATS_BASE}/api/transfer/v1?coldkey=${address}&limit=10`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd",
      {
        headers: { "User-Agent": "TaoPulse/1.0" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.bittensor?.usd as number) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  const truncated = truncateAddress(address);
  return {
    title: `Wallet ${truncated} — TAO Portfolio | TaoPulse`,
    description: `View TAO balance, staked TAO, validator delegations, and recent transfers for wallet ${truncated}.`,
    alternates: { canonical: `https://taopulse.io/wallet/${address}` },
    robots: { index: false },
  };
}

export default async function WalletAddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const [accountJson, delegationsJson, transfersJson, price] = await Promise.all([
    fetchAccount(address),
    fetchDelegations(address),
    fetchTransfers(address),
    fetchPrice(),
  ]);

  // Parse account — account/latest/v1 uses balance_free + balance_staked fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accountRecord: any = accountJson?.data?.[0] ?? null;
  const balanceRao: string | null =
    accountRecord?.balance_free ?? accountRecord?.balance ?? accountRecord?.free_balance ?? null;
  const balanceTao = balanceRao != null ? parseFloat(balanceRao) / 1e9 : null;

  // Staked balance from account record (more accurate than summing delegations)
  const stakedRao: string | null = accountRecord?.balance_staked ?? null;
  const stakedFromAccount = stakedRao != null ? parseFloat(stakedRao) / 1e9 : null;

  // Parse delegations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegations: any[] = delegationsJson?.data ?? [];
  const totalStakedTao = delegations.reduce((sum, d) => {
    const rao = parseFloat(d?.stake ?? d?.amount ?? "0");
    return sum + (isNaN(rao) ? 0 : rao / 1e9);
  }, 0);

  // Parse transfers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transfers: any[] = transfersJson?.data ?? [];

  // Prefer account-level staked balance over summing delegations (more accurate)
  const effectiveStakedTao = stakedFromAccount ?? totalStakedTao;

  // Total value = free balance + staked
  const totalTao =
    balanceTao != null ? balanceTao + effectiveStakedTao : effectiveStakedTao > 0 ? effectiveStakedTao : null;

  // Determine if address was not found (all APIs returned nothing)
  const notFound =
    accountRecord === null && delegations.length === 0 && transfers.length === 0;

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Back + Search again */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Wallet Lookup
          </Link>
        </div>

        {/* Address header */}
        <div className="bg-[#0f1623] border border-white/10 rounded-xl px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Wallet Address</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-white break-all">{address}</span>
            <CopyButton text={address} />
          </div>
        </div>

        {/* Not found state */}
        {notFound && (
          <div className="bg-[#0f1623] border border-white/10 rounded-xl px-6 py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-300">Address not found or no activity</p>
            <p className="text-sm text-gray-500">
              This address may not exist on the Bittensor network, or has no recorded activity yet.
            </p>
            <div className="pt-4 max-w-md mx-auto">
              <WalletSearchForm />
            </div>
          </div>
        )}

        {/* Stats grid */}
        {!notFound && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Free Balance",
                value: balanceTao != null ? `${formatTao(balanceTao * 1e9)} TAO` : "—",
                sub: balanceTao != null ? formatUsd(balanceTao, price) : null,
                color: "text-white",
              },
              {
                label: "Total Staked",
                value: effectiveStakedTao > 0 ? `${formatTao(effectiveStakedTao * 1e9)} TAO` : "—",
                sub: effectiveStakedTao > 0 ? formatUsd(effectiveStakedTao, price) : null,
                color: "text-purple-400",
              },
              {
                label: "Total Value",
                value: totalTao != null ? formatUsd(totalTao, price) : "—",
                sub: totalTao != null ? `${formatTao(totalTao * 1e9)} TAO` : null,
                color: "text-emerald-400",
              },
              {
                label: "TAO Price",
                value: price != null ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
                sub: "via CoinGecko",
                color: "text-white",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0f1623] border border-white/10 rounded-xl p-4"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                {stat.sub && <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Stakes breakdown */}
        {!notFound && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-bold text-white">Stake Delegations</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </span>
            </div>

            {delegations.length === 0 ? (
              <div className="bg-[#0f1623] border border-white/10 rounded-xl px-5 py-8 text-center text-sm text-gray-500">
                No active delegations found for this address.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Validator
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Staked (TAO)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Value
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Est. APY
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {delegations.map((d: any, i: number) => {
                      const hotkey =
                        d?.hotkey?.ss58 ?? d?.hotkey ?? d?.validator_hotkey ?? "";
                      const name =
                        d?.hotkey?.name ?? d?.validator_name ?? d?.name ?? null;
                      const displayName = name || truncateAddress(hotkey) || "Unknown";
                      const stakeRao = d?.stake ?? d?.amount ?? "0";
                      const stakeTao = parseFloat(stakeRao) / 1e9;
                      const aprRaw = d?.apr != null ? parseFloat(d.apr) * 100 : null;
                      const takeRaw = d?.take != null ? parseFloat(d.take) * 100 : null;

                      return (
                        <tr key={hotkey || i} className="hover:bg-purple-600/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white text-sm">{displayName}</div>
                            {name && (
                              <div className="font-mono text-xs text-gray-500 mt-0.5">
                                {truncateAddress(hotkey)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-300 font-mono text-sm">
                            {formatTao(stakeRao)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 text-sm hidden sm:table-cell">
                            {formatUsd(stakeTao, price)}
                          </td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            {aprRaw != null ? (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                                ~{aprRaw.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 text-sm hidden md:table-cell">
                            {takeRaw != null ? `${takeRaw.toFixed(1)}%` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Recent transfers */}
        {!notFound && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Recent Transfers</h2>

            {transfers.length === 0 ? (
              <div className="bg-[#0f1623] border border-white/10 rounded-xl px-5 py-8 text-center text-sm text-gray-500">
                No recent transfers found for this address.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#080d14] border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Counterparty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {transfers.map((t: any, i: number) => {
                      const fromSs58 =
                        t?.from?.ss58 ?? t?.from ?? t?.source ?? "";
                      const toSs58 =
                        t?.to?.ss58 ?? t?.to ?? t?.destination ?? "";
                      const isIncoming =
                        toSs58.toLowerCase() === address.toLowerCase();
                      const counterparty = isIncoming ? fromSs58 : toSs58;
                      const amountRao = t?.amount ?? t?.value ?? "0";
                      const blockTime =
                        t?.block_time ?? t?.timestamp ?? t?.created_at ?? null;

                      return (
                        <tr key={t?.extrinsic_id ?? i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isIncoming
                                  ? "bg-emerald-400/10 text-emerald-400"
                                  : "bg-red-400/10 text-red-400"
                              }`}
                            >
                              {isIncoming ? "↓ In" : "↑ Out"}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="font-mono text-xs text-gray-400">
                              {counterparty ? truncateAddress(counterparty) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-gray-300">
                            {formatTao(amountRao)} TAO
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-500 hidden md:table-cell">
                            {formatDate(blockTime)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        {!notFound && (
          <p className="text-xs text-gray-600 text-center pb-4">
            Data from TaoStats API. Balance and stakes refresh every ~60 seconds.
            APY estimates based on current network emissions — actual returns vary.
          </p>
        )}

        {/* Search again */}
        {!notFound && (
          <div className="bg-[#0f1623] border border-white/10 rounded-xl px-6 py-5">
            <p className="text-sm text-gray-400 mb-3">Look up another wallet</p>
            <WalletSearchForm />
          </div>
        )}
      </div>
    </div>
  );
}

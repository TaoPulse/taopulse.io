import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

const TAOSTATS_BASE = "https://api.taostats.io";

export const dynamic = "force-dynamic";

type KnownWallets = {
  exchange: Record<string, string>;
  foundation: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTao(raw: any): number {
  return parseFloat(raw ?? "0") / 1e9;
}

export async function GET() {
  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const fetchOpts = { headers: { Authorization: apiKey }, next: { revalidate: 1800 } as const };

    const [pageResults, validatorsJson] = await Promise.all([
      Promise.all(
        [1, 2, 3, 4, 5].map((page) =>
          fetch(
            `${TAOSTATS_BASE}/api/account/latest/v1?order_by=balance_total_desc&limit=200&page=${page}`,
            fetchOpts
          ).then((r) => r.json())
        )
      ),
      fetch(
        `${TAOSTATS_BASE}/api/validator/latest/v1?limit=200&netuid=0`,
        fetchOpts
      ).then((r) => r.json()),
    ]);

    // Build coldkey → validator name map
    const validatorMap: Record<string, string> = {};
    for (const v of validatorsJson.data ?? []) {
      const coldkey = typeof v.coldkey === "object" ? (v.coldkey?.ss58 ?? "") : (v.coldkey ?? "");
      if (coldkey && v.name) {
        validatorMap[coldkey] = v.name;
      }
    }

    // Load known wallets from static file
    const knownWalletsPath = path.join(process.cwd(), "data", "known-wallets.json");
    const knownWallets: KnownWallets = JSON.parse(readFileSync(knownWalletsPath, "utf-8"));

    // Flatten pages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allAccounts: any[] = pageResults.flatMap((p) => p.data ?? []);

    const whales = allAccounts.map((account, i) => {
      const address =
        typeof account.address === "object"
          ? (account.address?.ss58 ?? "")
          : (account.address ?? "");

      const balance_total = toTao(account.balance_total);
      const balance_free = toTao(account.balance_free);
      const balance_staked = toTao(account.balance_staked);

      const balance_total_24hr_ago =
        account.balance_total_24hr_ago != null
          ? toTao(account.balance_total_24hr_ago)
          : null;

      const change_24hr =
        balance_total_24hr_ago != null ? balance_total - balance_total_24hr_ago : null;

      const change_24hr_pct =
        balance_total_24hr_ago != null && balance_total_24hr_ago !== 0
          ? (change_24hr! / balance_total_24hr_ago) * 100
          : null;

      let label: "validator" | "exchange" | "foundation" | "unknown" = "unknown";
      let label_name: string | null = null;

      if (validatorMap[address]) {
        label = "validator";
        label_name = validatorMap[address];
      } else if (knownWallets.exchange[address]) {
        label = "exchange";
        label_name = knownWallets.exchange[address];
      } else if (knownWallets.foundation[address]) {
        label = "foundation";
        label_name = knownWallets.foundation[address];
      }

      return {
        rank: account.rank ?? i + 1,
        address,
        balance_total,
        balance_free,
        balance_staked,
        balance_total_24hr_ago,
        change_24hr,
        change_24hr_pct,
        label,
        label_name,
      };
    });

    return NextResponse.json(whales, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("Failed to fetch whale data:", err);
    return NextResponse.json({ error: "Failed to fetch whale data" }, { status: 502 });
  }
}

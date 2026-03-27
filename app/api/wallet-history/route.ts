import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TAOSTATS_BASE = "https://api.taostats.io";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10);

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const apiKey = process.env.TAOSTATS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${TAOSTATS_BASE}/api/account/history/v1?address=${address}&limit=${days}`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 3600 }, // cache 1 hour
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const json = await res.json();
    const data = (json?.data ?? []).map((r: Record<string, unknown>) => ({
      date: (r.timestamp as string)?.slice(0, 10) ?? "",
      total: parseFloat(String(r.balance_total ?? 0)),
      staked: parseFloat(String(r.balance_staked ?? 0)),
      free: parseFloat(String(r.balance_free ?? 0)),
    }));

    // Return in ascending order (oldest first for chart)
    data.reverse();

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

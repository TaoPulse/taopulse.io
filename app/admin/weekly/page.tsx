"use client";

import { useState, useEffect, useCallback } from "react";

interface PriceData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

interface NetworkStats {
  activeSubnets: number | null;
  stakedTao: number | null;
  stakedPct: number | null;
  circulatingSupply: number | null;
  marketCap: number | null;
}

interface Subnet {
  id: number;
  name: string;
  emission: number;
}

interface AllData {
  price: PriceData | null;
  network: NetworkStats | null;
  subnets: Subnet[];
  isLive: boolean;
  lastFetched: Date | null;
}

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtMC(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

function fmtTao(n: number) {
  return `${Math.round(n).toLocaleString("en-US")} TAO`;
}

function getWeekOf(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  return now.toLocaleDateString("en-US", options);
}

function buildEmailHTML(data: AllData, deepDive: string): string {
  const weekOf = getWeekOf();
  const price = data.price;
  const network = data.network;
  const top5 = data.subnets.slice(0, 5);

  const priceSection = price
    ? `
      <tr><td style="padding:6px 0;"><strong>Price:</strong></td><td style="padding:6px 0;">${fmt(price.price)}</td></tr>
      <tr><td style="padding:6px 0;"><strong>24h Change:</strong></td><td style="padding:6px 0;color:${price.change24h >= 0 ? "#16a34a" : "#dc2626"};">${price.change24h >= 0 ? "+" : ""}${price.change24h.toFixed(2)}%</td></tr>
      <tr><td style="padding:6px 0;"><strong>Market Cap:</strong></td><td style="padding:6px 0;">${fmtMC(price.marketCap)}</td></tr>
    `
    : `<tr><td colspan="2" style="color:#9ca3af;">Price data unavailable</td></tr>`;

  const subnetRows = top5.length > 0
    ? top5.map((s, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">#${i + 1}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">SN${s.id}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">${s.name}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">${s.emission.toFixed(2)}%</td>
      </tr>`).join("")
    : `<tr><td colspan="4" style="padding:8px 12px;color:#9ca3af;">Subnet data unavailable</td></tr>`;

  const networkSection = network
    ? `
      <tr><td style="padding:6px 0;"><strong>Active Subnets:</strong></td><td style="padding:6px 0;">${network.activeSubnets ?? "—"}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Total Staked:</strong></td><td style="padding:6px 0;">${network.stakedTao ? fmtTao(network.stakedTao) : "—"}${network.stakedPct ? ` (${network.stakedPct}% of supply)` : ""}</td></tr>
    `
    : `<tr><td colspan="2" style="color:#9ca3af;">Network data unavailable</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TAO Alpha — Week of ${weekOf}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 40px;text-align:center;">
              <img src="https://taopulse.io/logo.jpg" alt="TAOPulse" width="180" style="display:block;margin:0 auto 12px;" />
              <p style="margin:0;color:#a78bfa;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">TAO Alpha Newsletter</p>
            </td>
          </tr>

          <!-- Issue heading -->
          <tr>
            <td style="padding:28px 40px 0;border-bottom:2px solid #7c3aed;">
              <h1 style="margin:0 0 8px;font-size:22px;color:#111827;font-family:Arial,sans-serif;">TAO Alpha — Week of ${weekOf}</h1>
              <p style="margin:0 0 20px;color:#6b7280;font-size:14px;font-family:Arial,sans-serif;">Your weekly signal from the Bittensor network</p>
            </td>
          </tr>

          <!-- TAO Price Snapshot -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">📈 TAO Price Snapshot</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#374151;">
                ${priceSection}
              </table>
            </td>
          </tr>

          <!-- Top Subnets -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">🔥 Top 5 Subnets by Emission</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
                <thead>
                  <tr style="background:#7c3aed;color:#ffffff;">
                    <th style="padding:8px 12px;text-align:left;border:1px solid #6d28d9;">Rank</th>
                    <th style="padding:8px 12px;text-align:left;border:1px solid #6d28d9;">NetUID</th>
                    <th style="padding:8px 12px;text-align:left;border:1px solid #6d28d9;">Subnet</th>
                    <th style="padding:8px 12px;text-align:left;border:1px solid #6d28d9;">Emission %</th>
                  </tr>
                </thead>
                <tbody>
                  ${subnetRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Network Health -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">🌐 Network Health</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#374151;">
                ${networkSection}
              </table>
            </td>
          </tr>

          <!-- Deep Dive -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">🔍 Deep Dive</h2>
              ${deepDive.trim()
                ? `<p style="font-family:Arial,sans-serif;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${deepDive.trim()}</p>`
                : `<p style="font-family:Arial,sans-serif;font-size:14px;color:#9ca3af;font-style:italic;border:2px dashed #e5e7eb;padding:20px;border-radius:4px;">✏️ Write your deep dive in the left panel...</p>`
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;margin-top:28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">You're receiving this because you subscribed to TAO Alpha.</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;"><a href="[UNSUBSCRIBE_URL]" style="color:#7c3aed;">Unsubscribe</a> · <a href="https://taopulse.io" style="color:#7c3aed;">TAOPulse.io</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPlainText(data: AllData, deepDive: string): string {
  const weekOf = getWeekOf();
  const price = data.price;
  const network = data.network;
  const top5 = data.subnets.slice(0, 5);

  const lines: string[] = [
    `ALPHA PULSE — WEEK OF ${weekOf.toUpperCase()}`,
    `Your weekly signal from the Bittensor network`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📈 TAO PRICE SNAPSHOT`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];

  if (price) {
    lines.push(`Price: ${fmt(price.price)}`);
    lines.push(`24h Change: ${price.change24h >= 0 ? "+" : ""}${price.change24h.toFixed(2)}%`);
    lines.push(`Market Cap: ${fmtMC(price.marketCap)}`);
  } else {
    lines.push(`Price data unavailable`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🔥 TOP 5 SUBNETS BY EMISSION`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (top5.length > 0) {
    top5.forEach((s, i) => {
      lines.push(`${i + 1}. SN${s.id} — ${s.name} — ${s.emission.toFixed(2)}%`);
    });
  } else {
    lines.push(`Subnet data unavailable`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🌐 NETWORK HEALTH`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (network) {
    lines.push(`Active Subnets: ${network.activeSubnets ?? "—"}`);
    lines.push(`Total Staked: ${network.stakedTao ? fmtTao(network.stakedTao) : "—"}${network.stakedPct ? ` (${network.stakedPct}% of supply)` : ""}`);
  } else {
    lines.push(`Network data unavailable`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🔍 DEEP DIVE`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(deepDive.trim() || `✏️ Write your deep dive here...`);
  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`TAOPulse.io | Unsubscribe: [UNSUBSCRIBE_URL]`);

  return lines.join("\n");
}

export default function WeeklyAdminPage() {
  const [data, setData] = useState<AllData>({
    price: null,
    network: null,
    subnets: [],
    isLive: false,
    lastFetched: null,
  });
  const [loading, setLoading] = useState(true);
  const [deepDive, setDeepDive] = useState("");
  const [copyHTMLStatus, setCopyHTMLStatus] = useState<"idle" | "copied">("idle");
  const [copyTextStatus, setCopyTextStatus] = useState<"idle" | "copied">("idle");

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [priceRes, networkRes, subnetsRes] = await Promise.allSettled([
      fetch("/api/price").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/network-stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/trending-subnets").then((r) => (r.ok ? r.json() : null)),
    ]);

    setData({
      price: priceRes.status === "fulfilled" ? priceRes.value : null,
      network: networkRes.status === "fulfilled" ? networkRes.value : null,
      subnets:
        subnetsRes.status === "fulfilled" && subnetsRes.value?.subnets
          ? subnetsRes.value.subnets
          : [],
      isLive:
        subnetsRes.status === "fulfilled" ? (subnetsRes.value?.isLive ?? false) : false,
      lastFetched: new Date(),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const copyHTML = useCallback(async () => {
    const html = buildEmailHTML(data, deepDive);
    await navigator.clipboard.writeText(html);
    setCopyHTMLStatus("copied");
    setTimeout(() => setCopyHTMLStatus("idle"), 2000);
  }, [data, deepDive]);

  const copyText = useCallback(async () => {
    const text = buildPlainText(data, deepDive);
    await navigator.clipboard.writeText(text);
    setCopyTextStatus("copied");
    setTimeout(() => setCopyTextStatus("idle"), 2000);
  }, [data, deepDive]);

  const emailHTML = buildEmailHTML(data, deepDive);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">TAO Alpha — Newsletter Generator</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Internal tool · /admin/weekly
            {data.lastFetched && (
              <span className="ml-3 text-gray-500">
                Last fetched: {data.lastFetched.toLocaleTimeString()}
                {data.isLive ? (
                  <span className="ml-2 text-green-400">● live</span>
                ) : (
                  <span className="ml-2 text-yellow-500">● static fallback</span>
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white transition-colors"
          >
            {loading ? "Refreshing…" : "↻ Refresh Data"}
          </button>
          <button
            onClick={copyText}
            className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            {copyTextStatus === "copied" ? "✓ Copied!" : "Copy Plain Text"}
          </button>
          <button
            onClick={copyHTML}
            className="px-4 py-2 text-sm rounded bg-purple-700 hover:bg-purple-600 text-white font-medium transition-colors"
          >
            {copyHTMLStatus === "copied" ? "✓ Copied!" : "Copy Email HTML"}
          </button>
        </div>
      </div>

      <div className="flex gap-0 h-[calc(100vh-73px)]">
        {/* Left: editor + data summary panel */}
        <div className="w-80 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto p-4 space-y-5">

          {/* Deep Dive — top, most important */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
              🔍 Deep Dive
            </h2>
            <textarea
              value={deepDive}
              onChange={(e) => setDeepDive(e.target.value)}
              rows={6}
              placeholder="Write your weekly analysis here… (subnet spotlight, macro outlook, etc.)"
              className="w-full bg-gray-800 text-gray-100 text-sm rounded p-3 border border-gray-700 focus:border-purple-500 focus:outline-none resize-y placeholder-gray-600 leading-relaxed"
            />
          </div>

          {/* Live data summary — compact */}
          <div className="border-t border-gray-800 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
              Live Data
            </h2>
            {loading ? (
              <p className="text-xs text-gray-500">Loading…</p>
            ) : (
              <dl className="space-y-1 text-xs">
                {data.price && <>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Price</dt>
                    <dd className="text-white font-mono">{fmt(data.price.price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">24h</dt>
                    <dd className={`font-mono ${data.price.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {data.price.change24h >= 0 ? "+" : ""}{data.price.change24h.toFixed(2)}%
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Mkt Cap</dt>
                    <dd className="text-white font-mono">{fmtMC(data.price.marketCap)}</dd>
                  </div>
                </>}
                {data.network && <>
                  <div className="flex justify-between mt-1">
                    <dt className="text-gray-400">Subnets</dt>
                    <dd className="text-white font-mono">{data.network.activeSubnets ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Staked</dt>
                    <dd className="text-white font-mono">{data.network.stakedTao ? fmtTao(data.network.stakedTao) : "—"}</dd>
                  </div>
                </>}
              </dl>
            )}
          </div>

          {/* Top subnets — compact */}
          {!loading && data.subnets.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
                Top Subnets
              </h2>
              <ol className="space-y-0.5 text-xs">
                {data.subnets.slice(0, 5).map((s, i) => (
                  <li key={s.id} className="flex justify-between">
                    <span className="text-gray-400 truncate mr-2">{i + 1}. SN{s.id} {s.name}</span>
                    <span className="text-white font-mono shrink-0">{s.emission.toFixed(2)}%</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right: email preview */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Email Preview
            </span>
            <span className="text-xs text-gray-400">
              Week of {getWeekOf()}
            </span>
          </div>
          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow">
              Loading data…
            </div>
          ) : (
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ color: "#111827" }}
              dangerouslySetInnerHTML={{ __html: emailHTML }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

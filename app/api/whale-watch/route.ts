/**
 * /api/whale-watch
 *
 * POST { email, address, threshold_pct }
 *   → store subscription in KV
 *   → send confirmation email via Resend
 *
 * DELETE { email, address }
 *   → remove subscription
 *
 * Subscriptions stored in KV:
 *   watch:subs:{address}  → Set of "email|threshold_pct" strings
 *   watch:addr:{email}    → Set of addresses this email watches (for unsubscribe)
 */

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const VALID_THRESHOLDS = [1, 5, 10, 20]; // percent drop thresholds

function subKey(address: string) { return `watch:subs:${address}`; }
function addrKey(email: string) { return `watch:addr:${email}`; }

function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { email, address, threshold_pct = 5 } = body;
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  if (!address || address.length < 10) return NextResponse.json({ error: "Valid wallet address required" }, { status: 400 });
  if (!VALID_THRESHOLDS.includes(Number(threshold_pct))) {
    return NextResponse.json({ error: `threshold_pct must be one of ${VALID_THRESHOLDS.join(", ")}` }, { status: 400 });
  }

  const subValue = `${email}|${threshold_pct}`;

  // Store subscription (sets deduplicate automatically)
  await kv.sadd(subKey(address), subValue);
  await kv.sadd(addrKey(email), address);

  // Send confirmation email if Resend is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const shortAddr = `${address.slice(0, 8)}…${address.slice(-8)}`;
      await resend.emails.send({
        from: "TaoPulse Alerts <alerts@taopulse.io>",
        to: email,
        subject: `🐋 Watching ${shortAddr} — TAO Whale Alert Set`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#080d14;color:#e5e7eb;padding:32px;border-radius:12px">
            <img src="https://taopulse.io/logo.jpg" alt="TaoPulse" style="height:40px;margin-bottom:24px" />
            <h2 style="color:#fff;margin:0 0 8px">Whale alert set ✅</h2>
            <p style="color:#9ca3af;margin:0 0 24px">You're now watching:</p>
            <div style="background:#0f1623;border:1px solid #1f2937;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="font-family:monospace;color:#a78bfa;margin:0 0 8px;word-break:break-all">${address}</p>
              <p style="margin:0;color:#9ca3af;font-size:14px">
                Alert threshold: <strong style="color:#fff">${threshold_pct}% drop</strong> in 24 hours
              </p>
            </div>
            <p style="color:#6b7280;font-size:13px;margin:0 0 16px">
              You'll get an email when this wallet's TAO balance drops by ${threshold_pct}% or more in a 24-hour window.
              Early unstaking events will also be flagged as a pre-sell warning.
            </p>
            <a href="https://taopulse.io/whales" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">
              View Whale Tracker →
            </a>
            <p style="color:#374151;font-size:12px;margin:24px 0 0">
              To unsubscribe from this wallet alert, reply to this email with "unwatch" or visit your alert settings on TaoPulse.
            </p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Resend confirmation failed:", e);
      // Don't fail the request — subscription is stored regardless
    }
  }

  return NextResponse.json({ ok: true, message: `Watching ${address} at ${threshold_pct}% threshold` });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { email, address } = body;
  if (!email || !address) return NextResponse.json({ error: "email and address required" }, { status: 400 });

  // Remove all entries for this email from this address's subscriber set
  const subs = await kv.smembers<string[]>(subKey(address)) ?? [];
  const toRemove = subs.filter((s) => s.startsWith(`${email}|`));
  if (toRemove.length > 0) await kv.srem(subKey(address), ...toRemove);
  await kv.srem(addrKey(email), address);

  return NextResponse.json({ ok: true });
}

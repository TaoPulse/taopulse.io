import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const client = getSupabaseAdmin();
  if (!client) {
    return NextResponse.json({ error: "Signup unavailable" }, { status: 503 });
  }

  let body: { name?: string; email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const source = (body.source ?? "").trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const { error } = await client.from("subscribers").insert({ name, email, source });

  if (error) {
    // Duplicate email — treat as success
    if (error.code === "23505") {
      return NextResponse.json({ success: true });
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

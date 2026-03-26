import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "quiz-results.json");

type ResultEntry = { date: string; result: "stake" | "mine" | "both" };

async function readEntries(): Promise<ResultEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ResultEntry[];
  } catch {
    return [];
  }
}

async function writeEntries(entries: ResultEntry[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(entries), "utf-8");
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function cutoffString(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = body?.result;
  if (result !== "stake" && result !== "mine" && result !== "both") {
    return NextResponse.json({ error: "invalid result" }, { status: 400 });
  }

  const entries = await readEntries();
  entries.push({ date: todayString(), result });

  // Keep only last 90 days
  const cutoff = cutoffString(90);
  const trimmed = entries.filter((e) => e.date >= cutoff);

  try {
    await writeEntries(trimmed);
  } catch {
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const entries = await readEntries();
  const cutoff30 = cutoffString(30);
  const recent = entries.filter((e) => e.date >= cutoff30);

  // Build a map: date → {stake, mine, both}
  const byDate: Record<string, { stake: number; mine: number; both: number }> = {};
  for (const e of recent) {
    if (!byDate[e.date]) byDate[e.date] = { stake: 0, mine: 0, both: 0 };
    byDate[e.date][e.result]++;
  }

  // Generate last 30 days in order
  const days: { date: string; stake: number; mine: number; both: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, ...(byDate[key] ?? { stake: 0, mine: 0, both: 0 }) });
  }

  const totalStake = recent.filter((e) => e.result === "stake").length;
  const totalMine = recent.filter((e) => e.result === "mine").length;
  const totalBoth = recent.filter((e) => e.result === "both").length;
  const total = recent.length;

  return NextResponse.json({ days, totals: { stake: totalStake, mine: totalMine, both: totalBoth, total } });
}

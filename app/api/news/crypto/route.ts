import { NextResponse } from "next/server";

interface CryptoNewsItem {
  title: string;
  url: string;
  source: "CoinDesk" | "CoinTelegraph";
  date: string;
  summary?: string;
}

function isRelevant(title: string): boolean {
  const lower = title.toLowerCase();
  return lower.includes("bittensor") || lower.includes(" tao ");
}

function extractTags(xml: string, tag: string): string[] {
  const results: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match;
  while ((match = re.exec(xml)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function extractCData(raw: string): string {
  const m = raw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : raw.trim();
}

function parseRss(
  xml: string,
  source: "CoinDesk" | "CoinTelegraph"
): CryptoNewsItem[] {
  // Extract <item> blocks
  const itemBlocks: string[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    itemBlocks.push(m[1]);
  }

  return itemBlocks
    .map((block) => {
      const titleRaw = extractTags(block, "title")[0] ?? "";
      const title = extractCData(titleRaw);
      const link =
        extractTags(block, "link")[0] ??
        extractTags(block, "guid")[0] ??
        "";
      const pubDate = extractTags(block, "pubDate")[0] ?? "";
      const descRaw = extractTags(block, "description")[0] ?? "";
      const descText = extractCData(descRaw)
        .replace(/<[^>]+>/g, "")
        .slice(0, 150);
      return {
        title,
        url: extractCData(link),
        source,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        summary: descText || undefined,
      };
    })
    .filter((item) => isRelevant(item.title));
}

async function fetchRss(
  url: string,
  source: "CoinDesk" | "CoinTelegraph"
): Promise<CryptoNewsItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TaoPulse/1.0" },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRss(xml, source);
}

export async function GET() {
  const [coindesk, cointelegraph] = await Promise.allSettled([
    fetchRss("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk"),
    fetchRss("https://cointelegraph.com/rss", "CoinTelegraph"),
  ]);

  const items: CryptoNewsItem[] = [];
  if (coindesk.status === "fulfilled") items.push(...coindesk.value);
  if (cointelegraph.status === "fulfilled") items.push(...cointelegraph.value);

  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate=60",
    },
  });
}

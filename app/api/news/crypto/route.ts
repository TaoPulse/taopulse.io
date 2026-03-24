import { NextResponse } from "next/server";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface CryptoNewsItem {
  title: string;
  url: string;
  source: "CoinDesk" | "CoinTelegraph" | "CryptoPanic";
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
  try {
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
  } catch {
    return [];
  }
}

async function fetchRss(
  url: string,
  source: "CoinDesk" | "CoinTelegraph"
): Promise<CryptoNewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, source);
  } catch {
    return [];
  }
}

async function fetchCryptoPanic(): Promise<CryptoNewsItem[]> {
  try {
    const res = await fetch(
      "https://cryptopanic.com/api/v1/posts/?auth_token=free&currencies=TAO&public=true",
      {
        headers: { "User-Agent": BROWSER_UA },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json?.results)) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.results.map((item: any) => ({
      title: item.title,
      url: item.url,
      source: "CryptoPanic" as const,
      date: item.published_at
        ? new Date(item.published_at).toISOString()
        : new Date().toISOString(),
      summary: item.source?.title || undefined,
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const [coindesk, coindesAlt, cointelegraph, cryptoPanic] =
    await Promise.allSettled([
      fetchRss("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk"),
      fetchRss("https://feeds.feedburner.com/CoinDesk", "CoinDesk"),
      fetchRss("https://cointelegraph.com/rss", "CoinTelegraph"),
      fetchCryptoPanic(),
    ]);

  const seen = new Set<string>();
  const items: CryptoNewsItem[] = [];

  for (const result of [coindesk, coindesAlt, cointelegraph, cryptoPanic]) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          items.push(item);
        }
      }
    }
  }

  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate=60",
    },
  });
}

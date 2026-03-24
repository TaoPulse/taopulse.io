import { NextResponse } from "next/server";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface NewsItem {
  title: string;
  url: string;
  source: "Reddit" | "Community" | "News" | "Blog";
  date: string;
  summary?: string;
}

function extractRssField(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  const raw = m[1].trim();
  const cdata = raw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdata ? cdata[1].trim() : raw;
}

async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: NewsItem[] = [];
    const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRe.exec(xml)) !== null) {
      const block = m[1];
      const title = extractRssField(block, "title");
      const link = extractRssField(block, "link") || extractRssField(block, "guid");
      const pubDate = extractRssField(block, "pubDate");
      const source = extractRssField(block, "source");
      if (!title || title.toLowerCase().includes("google news")) continue;
      // skip duplicate/aggregator entries
      if (!link || link.includes("news.google.com/rss")) continue;
      items.push({
        title: title.replace(/ - [^-]+$/, "").trim(), // strip " - Source Name" suffix
        url: link,
        source: "News",
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        summary: source || undefined,
      });
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchReddit(subreddit: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/new.json?limit=20`,
      {
        headers: {
          "User-Agent": "Bittensor:TaoPulse:v1.0 (by /u/taopulse)",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.data?.children) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.data.children.map((child: any) => ({
      title: child.data.title,
      url: `https://reddit.com${child.data.permalink}`,
      source: "Reddit" as const,
      date: new Date(child.data.created_utc * 1000).toISOString(),
      summary: child.data.selftext?.slice(0, 150) || undefined,
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const [googleBittensor, googleTao, reddit] = await Promise.allSettled([
    fetchGoogleNews("bittensor TAO cryptocurrency"),
    fetchGoogleNews("bittensor subnet AI"),
    fetchReddit("bittensor_"),
  ]);

  const seen = new Set<string>();
  const items: NewsItem[] = [];

  // Merge all sources, deduplicate by URL
  for (const result of [googleBittensor, googleTao, reddit]) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (!seen.has(item.url) && item.title.length > 5) {
          seen.add(item.url);
          items.push(item);
        }
      }
    }
  }

  // Sort by date, newest first
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(items.slice(0, 30), {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}

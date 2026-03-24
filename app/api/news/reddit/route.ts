import { NextResponse } from "next/server";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface NewsItem {
  title: string;
  url: string;
  source: "Reddit" | "Community" | "News" | "Blog";
  date: string;
  summary?: string;
  score?: number;
  comments?: number;
  rank?: number;
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
      if (!link) continue;
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
      score: child.data.score ?? 0,
      comments: child.data.num_comments ?? 0,
    }));
  } catch {
    return [];
  }
}

// High-authority news sources get a boost
const SOURCE_AUTHORITY: Record<string, number> = {
  coindesk: 40,
  cointelegraph: 35,
  decrypt: 35,
  theblock: 35,
  blockworks: 30,
  forbes: 30,
  bloomberg: 40,
  reuters: 40,
  wired: 25,
  techcrunch: 25,
  coinbase: 20,
  binance: 20,
  beincrypto: 15,
  cryptoslate: 15,
  cryptonews: 15,
};

function getSourceBonus(summary?: string): number {
  if (!summary) return 5;
  const s = summary.toLowerCase();
  for (const [key, val] of Object.entries(SOURCE_AUTHORITY)) {
    if (s.includes(key)) return val;
  }
  return 5;
}

function rankScore(item: NewsItem): number {
  const ageHours = (Date.now() - new Date(item.date).getTime()) / 3_600_000;
  // Recency decay: score halves every 12 hours
  const recencyMultiplier = Math.pow(0.5, ageHours / 12);

  if (item.source === "Reddit") {
    const engagement = (item.score ?? 0) + (item.comments ?? 0) * 2;
    return (engagement + 5) * recencyMultiplier;
  } else {
    const authority = getSourceBonus(item.summary);
    return (authority + 10) * recencyMultiplier;
  }
}

export async function GET() {
  const [googleBittensor, googleTao, reddit] = await Promise.allSettled([
    fetchGoogleNews("bittensor TAO cryptocurrency"),
    fetchGoogleNews("bittensor subnet AI"),
    fetchReddit("bittensor_"),
  ]);

  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const googleItems: NewsItem[] = [];
  const redditItems: NewsItem[] = [];

  function normalizeTitle(t: string): string {
    return t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
  }

  // Collect Google News items (deduplicate by URL + title between the two queries)
  for (const result of [googleBittensor, googleTao]) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        const normTitle = normalizeTitle(item.title);
        if (!seenUrls.has(item.url) && !seenTitles.has(normTitle) && item.title.length > 5) {
          seenUrls.add(item.url);
          seenTitles.add(normTitle);
          googleItems.push(item);
        }
      }
    }
  }

  // Collect Reddit items — deduplicate by URL only (titles are user-written, not news headlines)
  const seenRedditUrls = new Set<string>();
  if (reddit.status === "fulfilled") {
    for (const item of reddit.value) {
      if (!seenRedditUrls.has(item.url) && item.title.length > 3) {
        seenRedditUrls.add(item.url);
        redditItems.push(item);
      }
    }
  }

  // Combine, rank, and sort
  const all = [...googleItems, ...redditItems];
  all.sort((a, b) => rankScore(b) - rankScore(a));

  // Add rank field
  const ranked = all.slice(0, 40).map((item, i) => ({ ...item, rank: i + 1 }));

  return NextResponse.json(ranked, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}

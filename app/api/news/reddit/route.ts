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

  // Interleave: roughly 2 news : 1 reddit to ensure Reddit is always represented
  const merged: NewsItem[] = [];
  const gSorted = googleItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const rSorted = redditItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let gi = 0, ri = 0;
  while (gi < gSorted.length || ri < rSorted.length) {
    if (gi < gSorted.length) merged.push(gSorted[gi++]);
    if (gi < gSorted.length) merged.push(gSorted[gi++]);
    if (ri < rSorted.length) merged.push(rSorted[ri++]);
  }

  return NextResponse.json(merged.slice(0, 40), {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}

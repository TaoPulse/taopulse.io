import { NextResponse } from "next/server";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REDDIT_UA =
  "Bittensor:TaoPulse:v1.0 (by /u/taopulse)";

interface NewsItem {
  title: string;
  url: string;
  source: "Reddit" | "Community" | "CryptoPanic" | "Blog";
  date: string;
  summary?: string;
  score?: number;
}

function isRelevant(title: string, selftext: string): boolean {
  const text = (title + " " + selftext).toLowerCase();
  return (
    text.includes("bittensor") ||
    text.includes(" tao ") ||
    text.includes("subnet") ||
    text.includes("staking")
  );
}

async function fetchCryptoPanic(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://cryptopanic.com/api/v1/posts/?auth_token=free&currencies=TAO&public=true",
      {
        headers: { "User-Agent": BROWSER_UA },
        signal: AbortSignal.timeout(8000),
      }
    );
    console.log("[news/reddit] CryptoPanic status:", res.status);
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json?.results)) {
      console.log("[news/reddit] CryptoPanic: unexpected response shape");
      return [];
    }
    const items = json.results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ({
        title: item.title,
        url: item.url,
        source: "CryptoPanic" as const,
        date: item.published_at
          ? new Date(item.published_at).toISOString()
          : new Date().toISOString(),
        summary: item.source?.title || undefined,
      }));
    console.log("[news/reddit] CryptoPanic returned", items.length, "items");
    return items;
  } catch (e) {
    console.log("[news/reddit] CryptoPanic error:", e);
    return [];
  }
}

function extractRssField(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  const raw = m[1].trim();
  const cdata = raw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdata ? cdata[1].trim() : raw;
}

async function fetchBlogRss(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(8000),
    });
    console.log("[news/reddit] Blog RSS", url, "status:", res.status);
    if (!res.ok) return [];
    const xml = await res.text();
    const items: NewsItem[] = [];
    const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRe.exec(xml)) !== null) {
      const block = m[1];
      const title = extractRssField(block, "title");
      const link =
        extractRssField(block, "link") || extractRssField(block, "guid");
      const pubDate = extractRssField(block, "pubDate");
      const desc = extractRssField(block, "description")
        .replace(/<[^>]+>/g, "")
        .slice(0, 150);
      if (!title) continue;
      items.push({
        title,
        url: link,
        source: "Blog",
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        summary: desc || undefined,
      });
    }
    console.log("[news/reddit] Blog RSS returned", items.length, "items");
    return items;
  } catch (e) {
    console.log("[news/reddit] Blog RSS error:", e);
    return [];
  }
}

async function fetchSubreddit(
  url: string,
  source: "Reddit" | "Community"
): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": REDDIT_UA },
      signal: AbortSignal.timeout(8000),
    });
    console.log("[news/reddit] Reddit", url, "status:", res.status);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.data?.children) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = json.data.children
      .map((child: any) => ({
        title: child.data.title,
        url: `https://reddit.com${child.data.permalink}`,
        source,
        date: new Date(child.data.created_utc * 1000).toISOString(),
        summary: child.data.selftext?.slice(0, 150) || undefined,
        score: child.data.score,
        _selftext: child.data.selftext || "",
      }))
      .filter((item: NewsItem & { _selftext: string }) =>
        isRelevant(item.title, item._selftext)
      )
      .map(({ _selftext: _s, ...rest }: { _selftext: string } & NewsItem) => rest);
    console.log("[news/reddit] Reddit returned", items.length, "items from", url);
    return items;
  } catch (e) {
    console.log("[news/reddit] Reddit fetch error:", e);
    return [];
  }
}

export async function GET() {
  // Fetch all sources in parallel — CryptoPanic + blog are primary (not Vercel-blocked)
  const [cryptoPanic, bittensorBlog, bittensorNew, taoSub] =
    await Promise.allSettled([
      fetchCryptoPanic(),
      fetchBlogRss("https://bittensor.com/feed"),
      fetchSubreddit(
        "https://www.reddit.com/r/bittensor_/new.json?limit=25",
        "Reddit"
      ),
      fetchSubreddit(
        "https://www.reddit.com/r/TAO.json?limit=10&sort=new",
        "Community"
      ),
    ]);

  const allItems: NewsItem[] = [];
  for (const result of [cryptoPanic, bittensorBlog, bittensorNew, taoSub]) {
    if (result.status === "fulfilled") allItems.push(...result.value);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const items = allItems.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  console.log("[news/reddit] Total unique items:", items.length);

  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}

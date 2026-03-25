import { NextResponse } from "next/server";
import { Sn13Client } from "macrocosmos";

// Force Node.js runtime — gRPC requires Node.js, not edge runtime
export const runtime = "nodejs";
// NOTE: SN13 gRPC calls can take 30-60s. Requires Vercel Pro (60s max) or self-hosted.
// On Vercel Hobby (10s limit), this will likely time out — falls back to empty array gracefully.
export const maxDuration = 60;

export interface SocialNewsItem {
  title: string;
  url: string;
  source: "Social";
  date: string;
  summary?: string;
  score?: number;
  comments?: number;
  platform: "X" | "Reddit";
  author?: string;
}

function buildXUrl(item: { [key: string]: unknown }): string {
  const id = item.id ?? item.tweet_id ?? item.post_id;
  const username = item.username ?? item.author ?? item.user;
  if (id && username) {
    return `https://x.com/${username}/status/${id}`;
  }
  if (typeof item.url === "string" && item.url.startsWith("http")) {
    return item.url;
  }
  return "";
}

function normalizeXItem(item: { [key: string]: unknown }): SocialNewsItem | null {
  const text = (item.text ?? item.content ?? item.body ?? "") as string;
  if (!text || text.length < 5) return null;

  const url = buildXUrl(item);
  if (!url) return null;

  const rawDate = item.created_at ?? item.timestamp ?? item.date ?? item.datetime;
  const date = rawDate ? new Date(rawDate as string).toISOString() : new Date().toISOString();

  const score =
    ((item.like_count ?? item.likes ?? item.favorite_count ?? 0) as number) +
    ((item.retweet_count ?? item.retweets ?? 0) as number);

  return {
    title: text.slice(0, 200),
    url,
    source: "Social",
    date,
    summary: `@${item.username ?? item.author ?? "unknown"} on X`,
    score,
    platform: "X",
    author: (item.username ?? item.author ?? "") as string,
  };
}

function normalizeRedditItem(item: { [key: string]: unknown }): SocialNewsItem | null {
  const title = (item.title ?? item.text ?? item.body ?? "") as string;
  if (!title || title.length < 5) return null;

  const url = (item.url ?? item.permalink ?? "") as string;
  if (!url.startsWith("http")) return null;

  const rawDate = item.created_utc ?? item.created_at ?? item.timestamp ?? item.date;
  const date = rawDate
    ? typeof rawDate === "number"
      ? new Date(rawDate * 1000).toISOString()
      : new Date(rawDate as string).toISOString()
    : new Date().toISOString();

  return {
    title,
    url,
    source: "Social",
    date,
    summary: (item.selftext ?? item.summary ?? "") as string || undefined,
    score: (item.score ?? item.upvotes ?? 0) as number,
    comments: (item.num_comments ?? item.comments ?? 0) as number,
    platform: "Reddit",
    author: (item.author ?? "") as string,
  };
}

async function fetchSocialData(
  client: Sn13Client,
  source: "x" | "reddit",
  keywords: string[]
): Promise<SocialNewsItem[]> {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const startDate = threeDaysAgo.toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    const response = await client.onDemandData({
      source,
      usernames: [],
      keywords,
      startDate,
      endDate,
      limit: 20,
      keywordMode: "any",
    });

    if (!response?.data || !Array.isArray(response.data)) return [];

    const items: SocialNewsItem[] = [];
    for (const raw of response.data) {
      const item =
        source === "x"
          ? normalizeXItem(raw as { [key: string]: unknown })
          : normalizeRedditItem(raw as { [key: string]: unknown });
      if (item) items.push(item);
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const apiKey = process.env.MACROCOSMOS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MACROCOSMOS_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const client = new Sn13Client({
      apiKey,
      appName: "taopulse",
    });

    const keywords = ["bittensor", "TAO", "$TAO"];

    const [xItems, redditItems] = await Promise.allSettled([
      fetchSocialData(client, "x", keywords),
      fetchSocialData(client, "reddit", keywords),
    ]);

    const all: SocialNewsItem[] = [];
    if (xItems.status === "fulfilled") all.push(...xItems.value);
    if (redditItems.status === "fulfilled") all.push(...redditItems.value);

    // Deduplicate by URL
    const seen = new Set<string>();
    const deduped = all.filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

    // Sort by recency
    deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(deduped, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  }
}

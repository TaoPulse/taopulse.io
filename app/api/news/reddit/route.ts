import { NextResponse } from "next/server";

interface RedditPost {
  title: string;
  url: string;
  source: "Reddit" | "Community";
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

async function fetchSubreddit(
  url: string,
  source: "Reddit" | "Community"
): Promise<RedditPost[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TaoPulse/1.0" },
  });
  if (!res.ok) return [];
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.data.children
    .map((child: any) => ({
      title: child.data.title,
      url: `https://reddit.com${child.data.permalink}`,
      source,
      date: new Date(child.data.created_utc * 1000).toISOString(),
      summary: child.data.selftext?.slice(0, 150) || undefined,
      score: child.data.score,
      _selftext: child.data.selftext || "",
    }))
    .filter((item: RedditPost & { _selftext: string }) =>
      isRelevant(item.title, item._selftext)
    )
    .map(({ _selftext: _s, ...rest }: { _selftext: string } & RedditPost) => rest);
}

export async function GET() {
  const [bittensor, tao] = await Promise.allSettled([
    fetchSubreddit(
      "https://www.reddit.com/r/bittensor_.json?limit=25&sort=new",
      "Reddit"
    ),
    fetchSubreddit(
      "https://www.reddit.com/r/TAO.json?limit=10&sort=new",
      "Community"
    ),
  ]);

  const items: RedditPost[] = [];
  if (bittensor.status === "fulfilled") items.push(...bittensor.value);
  if (tao.status === "fulfilled") items.push(...tao.value);

  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}

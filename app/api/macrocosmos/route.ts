import { NextResponse } from "next/server";

// Macrocosmos SN13 gRPC SDK is incompatible with Vercel serverless (requires persistent gRPC connection).
// Returning empty for now — TODO: implement via Macrocosmos HTTP REST API when available,
// or move to a self-hosted Node.js server with persistent connections.
export async function GET() {
  return NextResponse.json([], {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}

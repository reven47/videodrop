import { NextResponse } from "next/server";

import { ResolveError, resolveMedia } from "@/lib/media";

export const runtime = "nodejs";

const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  bucket.count += 1;
  return bucket.count > 20;
}

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { error: "Thoda ruk kar try karein. Ek minute mein 20 links tak." },
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request samajh nahi aayi. Dobara try karein." },
      { status: 400 },
    );
  }

  const url =
    typeof body === "object" && body !== null && "url" in body
      ? (body as { url?: unknown }).url
      : undefined;

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json(
      { error: "Pehle koi Instagram ya Facebook link paste karein." },
      { status: 400 },
    );
  }

  try {
    const result = await resolveMedia(url);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ResolveError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("resolve failed", error);
    return NextResponse.json(
      {
        error:
          "Media fetch nahi ho paya. Post public hai ya nahi check karein, phir dobara try karein.",
      },
      { status: 502 },
    );
  }
}

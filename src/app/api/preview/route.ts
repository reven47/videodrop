import { isAllowedMediaUrl } from "@/lib/media";

export const runtime = "nodejs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaUrl = searchParams.get("url");

  if (!mediaUrl || !isAllowedMediaUrl(mediaUrl)) {
    return new Response("Invalid media link.", { status: 400 });
  }

  const referer = mediaUrl.includes("instagram")
    ? "https://www.instagram.com/"
    : "https://www.facebook.com/";

  let upstream: Response;

  try {
    upstream = await fetch(mediaUrl, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        Referer: referer,
      },
    });
  } catch {
    return new Response("Preview unavailable.", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";

  if (!upstream.ok || !upstream.body || !contentType.startsWith("image/")) {
    return new Response("Preview unavailable.", { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=600");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, { status: 200, headers });
}

import { isAllowedMediaUrl, sanitizeFilename } from "@/lib/media";

export const runtime = "nodejs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function extensionFor(contentType: string | null, url: string): string {
  const type = (contentType ?? "").toLowerCase();
  if (type.includes("video/mp4")) return "mp4";
  if (type.includes("video/")) return "mp4";
  if (type.includes("image/webp")) return "webp";
  if (type.includes("image/png")) return "png";
  if (type.includes("image/jpeg")) return "jpg";

  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const match = path.match(/\.(mp4|jpe?g|png|webp)$/);
  if (match) return match[1] === "jpeg" ? "jpg" : match[1];

  return "bin";
}

function asciiFallback(name: string): string {
  return name
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "")
    .slice(0, 100) || "download";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaUrl = searchParams.get("url");
  const requestedName = searchParams.get("name") ?? "";

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
      signal: AbortSignal.timeout(120_000),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "*/*",
        Referer: referer,
      },
    });
  } catch {
    return new Response("Media server se connect nahi ho paya.", {
      status: 502,
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Media link expire ho gaya. Post dobara resolve karein.", {
      status: 502,
    });
  }

  if (!isAllowedMediaUrl(upstream.url)) {
    return new Response("Media link allowed nahi hai.", { status: 400 });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";

  if (contentType.includes("text/html")) {
    return new Response("Media link expire ho gaya. Post dobara resolve karein.", {
      status: 502,
    });
  }

  const ext = extensionFor(contentType, upstream.url || mediaUrl);
  let filename = sanitizeFilename(requestedName, `download-${Date.now()}`);

  if (!/\.[a-z0-9]{2,5}$/i.test(filename)) {
    filename = `${filename}.${ext}`;
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${asciiFallback(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { status: 200, headers });
}

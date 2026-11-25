export type Platform = "instagram" | "facebook";

export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  label: string;
}

export interface ResolveResult {
  platform: Platform;
  sourceUrl: string;
  author?: string;
  title?: string;
  thumbnail?: string;
  media: MediaItem[];
  note?: string;
}

export class ResolveError extends Error {
  status: number;

  constructor(message: string, status = 422) {
    super(message);
    this.name = "ResolveError";
    this.status = status;
  }
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FETCH_TIMEOUT_MS = 20_000;

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
]);

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.com",
  "www.fb.com",
  "fb.watch",
  "www.fb.watch",
]);

export function detectPlatform(rawInput: string): {
  platform: Platform;
  url: URL;
} {
  const input = rawInput.trim();

  if (!input) {
    throw new ResolveError("Paste an Instagram or Facebook post link to start.", 400);
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    throw new ResolveError("That does not look like a valid link. Paste the full post URL.", 400);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ResolveError("Only http and https links are supported.", 400);
  }

  const host = url.hostname.toLowerCase();

  if (INSTAGRAM_HOSTS.has(host)) {
    if (!/\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/.test(url.pathname)) {
      throw new ResolveError(
        "Paste an Instagram post, reel or TV link, for example instagram.com/p/…",
        400,
      );
    }
    return { platform: "instagram", url };
  }

  if (FACEBOOK_HOSTS.has(host)) {
    return { platform: "facebook", url };
  }

  throw new ResolveError(
    "Only public Instagram and Facebook links are supported.",
    400,
  );
}

export function isAllowedMediaUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();
    return (
      host === "instagram.com" ||
      host === "www.instagram.com" ||
      host === "facebook.com" ||
      host === "www.facebook.com" ||
      host.endsWith(".cdninstagram.com") ||
      host.endsWith(".fbcdn.net") ||
      host.endsWith(".fbsbx.com")
    );
  } catch {
    return false;
  }
}

export function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

export function guessExtension(url: string, type: MediaType): string {
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (path.endsWith(".mp4")) return "mp4";
  if (path.endsWith(".webp")) return "webp";
  if (path.endsWith(".png")) return "png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "jpg";

  return type === "video" ? "mp4" : "jpg";
}

async function request(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    cache: "no-store",
    redirect: init.redirect ?? "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      ...(init.headers ?? {}),
    },
  });
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await request(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    );
}

function unescapeMediaUrl(value: string): string {
  return decodeEntities(value)
    .replace(/\\u0025/gi, "%")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u003d/gi, "=")
    .replace(/\\u003a/gi, ":")
    .replace(/\\u002f/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/\\\\/g, "\\");
}

function metaContent(html: string, property: string): string | undefined {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }

  return undefined;
}

function pageTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeEntities(match[1]).trim() : undefined;
}

function unique<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function looksLikeImage(url: string): boolean {
  return (
    isAllowedMediaUrl(url) &&
    !/static\.xx\.fbcdn\.net|rsrc\.php|emoji|profile_pic/i.test(url)
  );
}

function looksLikeVideo(url: string): boolean {
  return isAllowedMediaUrl(url) && /\.mp4(\?|$)|video|m4v/i.test(url);
}

function findJsonUrl(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`"${escaped}"\\s*:\\s*"([^"]+)"`, "i");
    const match = html.match(pattern);
    if (match?.[1]) {
      const url = unescapeMediaUrl(match[1]);
      if (isAllowedMediaUrl(url)) return url;
    }
  }
  return undefined;
}

async function fetchInstagramOEmbed(canonicalUrl: string) {
  try {
    const res = await request(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(canonicalUrl)}`,
      { headers: { Accept: "application/json" } },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };

    return {
      title: data.title?.trim() || undefined,
      author: data.author_name?.trim() || undefined,
      thumbnail:
        data.thumbnail_url && isAllowedMediaUrl(data.thumbnail_url)
          ? data.thumbnail_url
          : undefined,
    };
  } catch {
    return null;
  }
}

async function resolveInstagramRedirect(url: string): Promise<string | null> {
  try {
    const res = await request(url, {
      redirect: "manual",
      headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
    });

    const location = res.headers.get("location");
    if (location) {
      const absolute = new URL(location, url).toString();
      if (isAllowedMediaUrl(absolute)) return absolute;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (res.ok && contentType.startsWith("image/") && isAllowedMediaUrl(url)) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

function findInstagramVideo(html: string): string | undefined {
  const direct = findJsonUrl(html, [
    "video_url",
    "playable_url",
    "playable_url_quality_hd",
  ]);
  if (direct && looksLikeVideo(direct)) return direct;

  const videoVersions = html.match(/"video_versions"\s*:\s*\[([\s\S]*?)\]/i);
  if (videoVersions?.[1]) {
    const urls = [...videoVersions[1].matchAll(/"url"\s*:\s*"([^"]+)"/gi)]
      .map((match) => unescapeMediaUrl(match[1]))
      .filter((url) => isAllowedMediaUrl(url));
    if (urls[0]) return urls[0];
  }

  const tag = html.match(/<video[^>]+src=["']([^"']+)["']/i);
  if (tag?.[1]) {
    const url = unescapeMediaUrl(tag[1]);
    if (isAllowedMediaUrl(url)) return url;
  }

  return undefined;
}

function instagramDeclaresVideo(html: string): boolean {
  return /"is_video"\s*:\s*true/i.test(html) || /"media_type"\s*:\s*2/i.test(html);
}

async function resolveInstagram(url: URL): Promise<ResolveResult> {
  const match = url.pathname.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) {
    throw new ResolveError(
      "Paste an Instagram post, reel or TV link, for example instagram.com/p/…",
      400,
    );
  }

  const kind = match[1];
  const code = match[2];
  const isReel = kind === "reel" || kind === "reels";
  const canonical = `https://www.instagram.com/${isReel ? "reel" : "p"}/${code}/`;
  const oembed = await fetchInstagramOEmbed(canonical);

  if (!oembed) {
    throw new ResolveError(
      "We could not find this post. Check that the link is correct and the post is public.",
    );
  }

  const [fullImage, embedHtml] = await Promise.all([
    resolveInstagramRedirect(`https://www.instagram.com/p/${code}/media/?size=l`),
    fetchText(
      `https://www.instagram.com/${isReel ? "reel" : "p"}/${code}/embed/captioned/`,
    ),
  ]);

  const thumbnail = oembed.thumbnail;
  const title = oembed.title;
  const author = oembed.author;
  const base = {
    platform: "instagram" as const,
    sourceUrl: canonical,
    author,
    title,
    thumbnail,
  };

  if (embedHtml) {
    const videoUrl = findInstagramVideo(embedHtml);
    if (videoUrl) {
      return {
        ...base,
        media: [
          {
            id: `${code}-video`,
            type: "video",
            url: videoUrl,
            thumbnail,
            label: "Video",
          },
        ],
      };
    }

    if (isReel || instagramDeclaresVideo(embedHtml)) {
      throw new ResolveError(
        "This Instagram reel or video is not available without logging in. Public photo posts can still be downloaded.",
      );
    }
  }

  if (isReel) {
    throw new ResolveError(
      "This Instagram reel is not available without logging in. Public photo posts can still be downloaded.",
    );
  }

  const imageUrl = fullImage ?? thumbnail;
  if (!imageUrl) {
    throw new ResolveError(
      "No media was found for this post. Check that the post is public.",
    );
  }

  return {
    ...base,
    media: [
      {
        id: `${code}-image`,
        type: "image",
        url: imageUrl,
        thumbnail,
        label: "Photo",
      },
    ],
    note: "For carousel posts, the first photo is downloaded.",
  };
}

function isFacebookVideoUrl(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  return (
    path.includes("/videos/") ||
    path.includes("/video.php") ||
    path.includes("/watch") ||
    path.includes("/reel/") ||
    path.includes("/share/v/") ||
    url.searchParams.has("v")
  );
}

function facebookAuthor(url: URL): string | undefined {
  const first = url.pathname.split("/").filter(Boolean)[0];
  if (!first) return undefined;
  if (["watch", "reel", "share", "permalink.php", "photo.php", "photo"].includes(first)) {
    return undefined;
  }
  return decodeURIComponent(first);
}

function collectFacebookImages(html: string): string[] {
  const candidates: string[] = [];

  const ogImage = metaContent(html, "og:image");
  if (ogImage) candidates.push(ogImage);

  for (const match of html.matchAll(/"image_url"\s*:\s*"([^"]+)"/gi)) {
    candidates.push(unescapeMediaUrl(match[1]));
  }

  for (const match of html.matchAll(/https?:\/\/[^"'\\\s]+scontent[^"'\\\s]+/gi)) {
    candidates.push(unescapeMediaUrl(match[0]));
  }

  return unique(
    candidates.filter((url) => looksLikeImage(url) && !looksLikeVideo(url)),
    (url) => url.split("?")[0],
  ).slice(0, 4);
}

function collectFacebookVideos(html: string): string[] {
  const candidates: string[] = [];

  for (const key of [
    "hd_src",
    "browser_native_hd_url",
    "playable_url_quality_hd",
    "sd_src",
    "browser_native_sd_url",
    "playable_url",
  ]) {
    const found = findJsonUrl(html, [key]);
    if (found) candidates.push(found);
  }

  for (const match of html.matchAll(/https?:\/\/[^"'\\\s]+?\.mp4[^"'\\\s]*/gi)) {
    candidates.push(unescapeMediaUrl(match[0]));
  }

  return unique(
    candidates.filter((url) => looksLikeVideo(url)),
    (url) => url.split("?")[0],
  );
}

async function resolveFacebook(url: URL): Promise<ResolveResult> {
  const wantsVideo = isFacebookVideoUrl(url);
  const plugin = wantsVideo
    ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false&width=720`
    : `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url.toString())}&width=500&show_text=true`;

  let html = await fetchText(plugin);

  if (!html) {
    html = await fetchText(url.toString());
  }

  if (!html) {
    throw new ResolveError(
      "Facebook did not return data for this post. Check that the post is public.",
    );
  }

  const videos = collectFacebookVideos(html);
  const images = collectFacebookImages(html);
  const thumbnail =
    metaContent(html, "og:image") ??
    (images[0] && looksLikeImage(images[0]) ? images[0] : undefined);
  const rawTitle = metaContent(html, "og:title") ?? pageTitle(html);
  const title =
    rawTitle && rawTitle.toLowerCase() !== "facebook" ? rawTitle : undefined;
  const author = facebookAuthor(url);

  const base = {
    platform: "facebook" as const,
    sourceUrl: url.toString(),
    author,
    title,
    thumbnail,
  };

  if (videos.length > 0) {
    return {
      ...base,
      media: [
        {
          id: "facebook-video",
          type: "video",
          url: videos[0],
          thumbnail,
          label: "Video",
        },
      ],
    };
  }

  if (images.length > 0 && !wantsVideo) {
    return {
      ...base,
      media: images.map((image, index) => ({
        id: `facebook-image-${index + 1}`,
        type: "image" as const,
        url: image,
        thumbnail: image,
        label: images.length > 1 ? `Photo ${index + 1}` : "Photo",
      })),
    };
  }

  throw new ResolveError(
    wantsVideo
      ? "This Facebook video could not be found. Try a public video or reel link."
      : "No media was found for this post. Try a public photo or video post.",
  );
}

export async function resolveMedia(rawInput: string): Promise<ResolveResult> {
  const { platform, url } = detectPlatform(rawInput);

  if (platform === "instagram") {
    return resolveInstagram(url);
  }

  return resolveFacebook(url);
}

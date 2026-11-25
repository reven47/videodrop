export interface VastAd {
  mediaUrl: string;
  mediaType: string;
  impressions: string[];
  clickThrough?: string;
  clickTracking: string[];
  errorUrls: string[];
  durationSeconds?: number;
  adTitle?: string;
  advertiser?: string;
}

export class VastError extends Error {}

const MAX_WRAPPER_DEPTH = 3;

function pickTag(xml: string, tag: string): string | undefined {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return match?.[1]?.trim();
}

function pickAllTags(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  return [...xml.matchAll(pattern)]
    .map((match) => match[1]?.trim() ?? "")
    .filter(Boolean);
}

function cleanUrl(value: string): string {
  return value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/&amp;/g, "&")
    .trim();
}

export function parseDuration(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parts = value.trim().split(":").map((part) => Number.parseFloat(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return undefined;
  }
  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}

function parseMediaFiles(vastXml: string): {
  url: string;
  type: string;
  bitrate: number;
}[] {
  const files: { url: string; type: string; bitrate: number }[] = [];

  for (const match of vastXml.matchAll(/<MediaFile(\s[^>]*)?>([\s\S]*?)<\/MediaFile>/gi)) {
    const attrs = match[1] ?? "";
    const url = cleanUrl(match[2] ?? "");
    if (!/^https?:\/\//i.test(url)) continue;

    const type = /type=["']([^"']+)["']/i.exec(attrs)?.[1]?.toLowerCase() ?? "";
    const bitrate = Number(
      /bitrate=["']([^"']+)["']/i.exec(attrs)?.[1] ?? Number.NaN,
    );

    files.push({ url, type, bitrate: Number.isNaN(bitrate) ? 0 : bitrate });
  }

  return files;
}

function scoreFile(file: { type: string; bitrate: number }): number {
  let score = 0;
  if (file.type.includes("mp4")) score += 100;
  else if (file.type.includes("webm")) score += 60;
  else if (file.type.startsWith("video/")) score += 40;
  if (file.bitrate > 0) score += Math.min(file.bitrate / 1000, 30);
  return score;
}

export function parseVast(vastXml: string): {
  ad?: VastAd;
  wrapperUrl?: string;
} {
  const impressions = [
    ...pickAllTags(vastXml, "Impression"),
    ...pickAllTags(vastXml, "ImpressionURL"),
  ]
    .map(cleanUrl)
    .filter((url) => /^https?:\/\//i.test(url));

  const clickTracking = pickAllTags(vastXml, "ClickTracking")
    .map(cleanUrl)
    .filter((url) => /^https?:\/\//i.test(url));

  const errorUrls = pickAllTags(vastXml, "Error")
    .map(cleanUrl)
    .filter((url) => /^https?:\/\//i.test(url));

  const wrapperUrl = pickTag(vastXml, "VASTAdTagURI");
  if (wrapperUrl) {
    const url = cleanUrl(wrapperUrl);
    if (!/^https?:\/\//i.test(url)) {
      throw new VastError("VAST wrapper tag is not a valid URL.");
    }
    return { wrapperUrl: url };
  }

  const files = parseMediaFiles(vastXml);
  if (files.length === 0) {
    return {};
  }

  files.sort((a, b) => scoreFile(b) - scoreFile(a));
  const best = files[0];

  const creative = pickTag(vastXml, "Creative") ?? vastXml;
  const linear = pickTag(creative, "Linear") ?? creative;

  return {
    ad: {
      mediaUrl: best.url,
      mediaType: best.type || "video/mp4",
      impressions,
      clickThrough: pickTag(linear, "ClickThrough")
        ? cleanUrl(pickTag(linear, "ClickThrough") as string)
        : undefined,
      clickTracking,
      errorUrls,
      durationSeconds: parseDuration(pickTag(linear, "Duration")),
      adTitle: pickTag(linear, "AdTitle"),
      advertiser: pickTag(linear, "Advertiser"),
    },
  };
}

export const VAST_WRAPPER_LIMIT = MAX_WRAPPER_DEPTH;

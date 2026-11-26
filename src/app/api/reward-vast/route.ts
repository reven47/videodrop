import { NextResponse } from "next/server";

import { assertSafeRemoteUrl } from "@/lib/safe-fetch";
import { parseVast, VastError, VAST_WRAPPER_LIMIT, type VastAd } from "@/lib/vast";

export const runtime = "nodejs";

const MAX_BYTES = 512 * 1024;
const CACHE_TTL_MS = 45_000;

interface CacheEntry {
  ad: VastAd;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<VastAd>>();

function cacheKey(tag: string): string {
  return tag.trim();
}

function readCache(tag: string): VastAd | null {
  const entry = cache.get(cacheKey(tag));
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(cacheKey(tag));
    return null;
  }
  return entry.ad;
}

function writeCache(tag: string, ad: VastAd) {
  if (cache.size > 200) cache.clear();
  cache.set(cacheKey(tag), { ad, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchVastDocument(tagUrl: string): Promise<string> {
  const safeUrl = await assertSafeRemoteUrl(tagUrl);

  const res = await fetch(safeUrl, {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Accept: "application/xml,text/xml,*/*",
      "User-Agent": "VideoDrop/1.0 (+reward-ad)",
    },
  });

  if (!res.ok) {
    throw new VastError(`Ad server responded with ${res.status}.`);
  }

  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) {
    throw new VastError("Ad response is too large.");
  }

  const text = (await res.text()).slice(0, MAX_BYTES);

  if (!/<VAST[\s>]/i.test(text)) {
    throw new VastError("Ad server did not return a VAST document.");
  }

  return text;
}

async function loadVast(tagUrl: string): Promise<VastAd> {
  let current = tagUrl;
  const impressions: string[] = [];
  const clickTracking: string[] = [];
  const errorUrls: string[] = [];

  for (let depth = 0; depth <= VAST_WRAPPER_LIMIT; depth += 1) {
    const parsed = parseVast(await fetchVastDocument(current));

    if (parsed.ad) {
      return {
        ...parsed.ad,
        impressions: [...impressions, ...parsed.ad.impressions],
        clickTracking: [...clickTracking, ...parsed.ad.clickTracking],
        errorUrls: [...errorUrls, ...parsed.ad.errorUrls],
      };
    }

    if (!parsed.wrapperUrl) {
      throw new VastError("This ad tag returned no playable creative.");
    }

    current = parsed.wrapperUrl;
  }

  throw new VastError("Too many VAST wrapper redirects.");
}

async function loadWithRetry(tag: string): Promise<VastAd> {
  try {
    return await loadVast(tag);
  } catch (error) {
    if (error instanceof VastError && /no playable creative/i.test(error.message)) {
      return await loadVast(tag);
    }
    throw error;
  }
}

async function resolveAd(tag: string): Promise<VastAd> {
  const cached = readCache(tag);
  if (cached) return cached;

  const key = cacheKey(tag);
  const existing = inflight.get(key);
  if (existing) return existing;

  const pending = loadWithRetry(tag)
    .then((ad) => {
      writeCache(tag, ad);
      return ad;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, pending);
  return pending;
}

export async function GET(request: Request) {
  const tag = new URL(request.url).searchParams.get("tag");

  if (!tag) {
    return NextResponse.json({ error: "Missing ad tag." }, { status: 400 });
  }

  try {
    const ad = await resolveAd(tag);
    return NextResponse.json(ad, {
      headers: { "Cache-Control": "private, max-age=15" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ad could not be loaded.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

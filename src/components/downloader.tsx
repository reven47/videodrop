"use client";

import {
  CircleAlert,
  ClipboardPaste,
  Download,
  ImageIcon,
  Link2,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { RewardedAdDialog } from "@/components/rewarded-ad-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem, Platform, ResolveResult } from "@/lib/media";

const PLATFORMS: {
  id: Platform;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    hint: "Works with instagram.com/p/… post links.",
    placeholder: "https://www.instagram.com/p/…",
  },
  {
    id: "facebook",
    label: "Facebook",
    hint: "Works with public facebook.com posts, videos and reels.",
    placeholder: "https://www.facebook.com/…/videos/…",
  },
];

function platformFromInput(value: string): Platform | null {
  const lower = value.toLowerCase();
  if (lower.includes("instagram.com")) return "instagram";
  if (
    lower.includes("facebook.com") ||
    lower.includes("fb.watch") ||
    lower.includes("fb.com")
  ) {
    return "facebook";
  }
  return null;
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
    </svg>
  );
}

function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return platform === "instagram" ? (
    <InstagramGlyph className={className} />
  ) : (
    <FacebookGlyph className={className} />
  );
}

function MediaPreview({ item }: { item: MediaItem }) {
  const [failed, setFailed] = useState(false);
  const rawPreview = item.thumbnail ?? item.url;
  const preview =
    item.type === "video" && rawPreview?.includes("s40x40") ? null : rawPreview;

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-gradient-to-br from-fuchsia-500/15 via-rose-500/10 to-orange-400/15">
      {preview && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/preview?url=${encodeURIComponent(preview)}`}
          alt={item.label}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          {item.type === "video" ? (
            <Play className="size-5" />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </div>
      )}

      {item.type === "video" && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-black shadow-sm">
            <Play className="size-3.5 fill-current" />
          </span>
        </span>
      )}
    </div>
  );
}

export function Downloader() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [pending, setPending] = useState<MediaItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const active = PLATFORMS.find((entry) => entry.id === platform) ?? PLATFORMS[0];

  useEffect(() => {
    if (!result) return;
    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [result]);

  function applyUrl(value: string) {
    setUrl(value);
    if (error) setError(null);

    const detected = platformFromInput(value);
    if (detected && detected !== platform) {
      setPlatform(detected);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Your clipboard is empty. Copy a post link first.");
        return;
      }
      applyUrl(text.trim());
    } catch {
      toast.error("Clipboard access was blocked. Paste the link manually.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = url.trim();
    if (!value) {
      setError(`Paste an ${active.label} post link to start.`);
      return;
    }

    const detected = platformFromInput(value);

    if (!detected) {
      setError("That link is not from Instagram or Facebook.");
      return;
    }

    if (detected !== platform) {
      setPlatform(detected);
      setError(
        `That is a ${detected === "instagram" ? "Instagram" : "Facebook"} link, so we switched the tab for you. Press Download again.`,
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUnlocked(false);
    setPending(null);

    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });

      const data = (await res.json()) as ResolveResult & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Could not fetch this post.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function startDownload(item: MediaItem) {
    if (!result) return;

    const ext = item.type === "video" ? "mp4" : "jpg";
    const author = result.author ?? "media";
    const name = `${result.platform}-${author}-${item.id}.${ext}`;
    const params = new URLSearchParams({ url: item.url, name });

    setDownloadingId(item.id);
    const link = document.createElement("a");
    link.href = `/api/download?${params.toString()}`;
    link.download = name;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Download started. Check your browser downloads.");
    window.setTimeout(() => setDownloadingId(null), 1800);
  }

  function handleDownload(item: MediaItem) {
    if (!unlocked) {
      setPending(item);
      setAdOpen(true);
      return;
    }
    startDownload(item);
  }

  function handleAdComplete() {
    setAdOpen(false);
    setUnlocked(true);
    const item = pending;
    setPending(null);
    if (item) window.setTimeout(() => startDownload(item), 250);
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border bg-card/90 p-2 shadow-xl shadow-foreground/5 backdrop-blur">
          <div
            role="tablist"
            aria-label="Choose platform"
            className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
          >
            {PLATFORMS.map((entry) => {
              const selected = entry.id === platform;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setPlatform(entry.id);
                    setError(null);
                  }}
                  disabled={loading}
                  className={[
                    "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
                    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <PlatformIcon platform={entry.id} className="size-4" />
                  {entry.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 px-2 pt-3 pb-1.5">
            <label
              htmlFor="media-url"
              className="shrink-0 text-xs font-medium text-muted-foreground"
            >
              {active.label} post link
            </label>
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">
              {active.hint}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Link2
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="media-url"
                name="url"
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                value={url}
                onChange={(event) => applyUrl(event.target.value)}
                placeholder={active.placeholder}
                className="h-12 rounded-xl pr-24 pl-10 text-base shadow-none"
                aria-invalid={Boolean(error)}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                disabled={loading}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 gap-1.5 text-muted-foreground"
              >
                <ClipboardPaste className="size-4" />
                Paste
              </Button>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 rounded-xl px-6 text-base sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Fetching…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>Public posts only</span>
          <span aria-hidden>·</span>
          <span>No login</span>
          <span aria-hidden>·</span>
          <span>1 reward ad per post</span>
        </p>
      </form>

      <div className="mx-auto mt-6 w-full max-w-2xl text-left">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <CircleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card aria-live="polite" aria-busy="true">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <div ref={resultRef}>
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <PlatformIcon platform={result.platform} className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <CardTitle className="line-clamp-2 text-base">
                      {result.title ?? "Post ready"}
                    </CardTitle>
                    <CardDescription className="mt-1 truncate">
                      {result.author
                        ? `@${result.author}`
                        : result.platform === "instagram"
                          ? "Instagram"
                          : "Facebook"}
                    </CardDescription>
                  </div>

                  <Badge variant={unlocked ? "default" : "secondary"}>
                    {unlocked ? "Unlocked" : "1 ad"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {result.media.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <MediaPreview item={item} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.type === "video" ? "MP4 video" : "JPG photo"} ·{" "}
                        {unlocked ? "Ready to save" : "Locked until the ad ends"}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={unlocked ? "default" : "outline"}
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item.id}
                      className="shrink-0"
                    >
                      {downloadingId === item.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : unlocked ? (
                        <Download className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                      <span className="hidden sm:inline">
                        {downloadingId === item.id
                          ? "Saving…"
                          : unlocked
                            ? "Download"
                            : "Unlock"}
                      </span>
                      <span className="sr-only sm:hidden">
                        {unlocked
                          ? "Download"
                          : "Watch an ad to unlock this download"}
                      </span>
                    </Button>
                  </div>
                ))}

                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result.note ? `${result.note} ` : ""}
                  One 15-second ad unlocks every file in this post.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <RewardedAdDialog
        open={adOpen}
        onOpenChange={setAdOpen}
        onComplete={handleAdComplete}
      />
    </div>
  );
}

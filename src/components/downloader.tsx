"use client";

import {
  CircleAlert,
  ClipboardPaste,
  Download,
  Facebook,
  ImageIcon,
  Instagram,
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

function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return platform === "instagram" ? (
    <Instagram className={className} />
  ) : (
    <Facebook className={className} />
  );
}

function MediaPreview({ item }: { item: MediaItem }) {
  const [failed, setFailed] = useState(false);
  const rawPreview = item.thumbnail ?? item.url;
  const preview =
    item.type === "video" && rawPreview?.includes("s40x40")
      ? null
      : rawPreview;

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
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [pending, setPending] = useState<MediaItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const detected = platformFromInput(url);

  useEffect(() => {
    if (!result) return;
    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [result]);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Clipboard khaali hai. Link copy karke paste karein.");
        return;
      }
      setUrl(text.trim());
      setError(null);
    } catch {
      toast.error("Clipboard access nahi mila. Link manually paste karein.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = url.trim();
    if (!value) {
      setError("Pehle koi Instagram ya Facebook link paste karein.");
      return;
    }

    if (!platformFromInput(value)) {
      setError("Sirf Instagram ya Facebook ke public links supported hain.");
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
        throw new Error(data.error ?? "Media fetch nahi ho paya.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kuch galat ho gaya. Dobara try karein.",
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

    toast.success("Download shuru ho gaya. Browser ke downloads check karein.");
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
          <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-1.5">
            <label
              htmlFor="media-url"
              className="text-xs font-medium text-muted-foreground"
            >
              Post ka link
            </label>
            {detected && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <PlatformIcon platform={detected} className="size-3.5" />
                {detected === "instagram" ? "Instagram" : "Facebook"} detected
              </span>
            )}
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
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="instagram.com/p/… ya facebook.com/…"
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
                    <PlatformIcon
                      platform={result.platform}
                      className="size-5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <CardTitle className="line-clamp-2 text-base">
                      {result.title ?? "Post ready hai"}
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
                        {unlocked ? "Ready to save" : "Ad ke baad ready"}
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
                        {unlocked ? "Download" : "Ad dekh kar unlock karein"}
                      </span>
                    </Button>
                  </div>
                ))}

                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result.note
                    ? `${result.note} `
                    : ""}
                  Ek 15-second ad is post ke saare downloads unlock karta hai.
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

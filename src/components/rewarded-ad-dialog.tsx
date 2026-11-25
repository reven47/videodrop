"use client";

import { Clock3, Download, ExternalLink, Play, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AdSenseUnit } from "@/components/adsense-unit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { adsConfig, getRewardMode } from "@/lib/ads";

const MIN_WATCH_SECONDS = 30;

interface VastCreative {
  mediaUrl: string;
  mediaType: string;
  impressions: string[];
  clickThrough?: string;
  clickTracking: string[];
  durationSeconds?: number;
  adTitle?: string;
  advertiser?: string;
}

interface RewardedAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  vastTag?: string;
}

function firePixels(urls: string[]) {
  for (const url of urls) {
    try {
      const image = new Image(1, 1);
      image.referrerPolicy = "no-referrer";
      image.src = url;
    } catch {
      // Tracking failures must never block the download.
    }
  }
}

function HouseCreative({ done }: { done: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 p-5 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-52 rounded-full bg-black/20 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase">
            Sponsored
          </span>
          <Download className="size-5 text-white/80" />
        </div>

        <div className="mt-10 space-y-1">
          <p className="text-2xl font-semibold tracking-tight">
            Download. Watch. Save.
          </p>
          <p className="text-sm text-white/80">
            SnapSave — public posts, straight to your device.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-white/80">
          <ShieldCheck className="size-3.5" />
          {done
            ? "Ad complete — your download is starting…"
            : "Keep this page open until the ad finishes."}
        </div>
      </div>
    </div>
  );
}

export function RewardedAdDialog({
  open,
  onOpenChange,
  onComplete,
  vastTag,
}: RewardedAdDialogProps) {
  const tag = vastTag ?? adsConfig.rewardVastTag;
  const mode = tag ? "vast" : getRewardMode();

  const [phase, setPhase] = useState<"loading" | "ready" | "fallback">(
    mode === "vast" ? "loading" : "fallback",
  );
  const [creative, setCreative] = useState<VastCreative | null>(null);
  const [watched, setWatched] = useState(0);
  const [required, setRequired] = useState(MIN_WATCH_SECONDS);
  const [needsTap, setNeedsTap] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const watchedRef = useRef(0);
  const impressionFired = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const markWatched = useCallback((seconds: number) => {
    const next = Math.max(watchedRef.current, seconds);
    if (next - watchedRef.current < 0.05) return;
    watchedRef.current = next;
    setWatched(next);
  }, []);

  useEffect(() => {
    if (!open) return;

    watchedRef.current = 0;
    impressionFired.current = false;
    completedRef.current = false;
    setWatched(0);
    setRequired(MIN_WATCH_SECONDS);
    setNeedsTap(false);
    setMuted(false);
    setVideoFailed(false);
    setVideoEnded(false);
    setCreative(null);

    if (mode !== "vast") {
      setPhase("fallback");
      return;
    }

    setPhase("loading");
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/reward-vast?tag=${encodeURIComponent(tag)}`,
          { signal: controller.signal, cache: "no-store" },
        );

        if (!res.ok) throw new Error("Ad request failed: " + res.status);

        const data = (await res.json()) as VastCreative;
        if (!data.mediaUrl) throw new Error("Ad has no media.");

        setCreative(data);
        setRequired(
          Math.max(MIN_WATCH_SECONDS, Math.ceil(data.durationSeconds ?? 0)),
        );
        setPhase("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[reward-ad] falling back:", error);
        setPhase("fallback");
      }
    })();

    return () => controller.abort();
  }, [open, mode, tag]);

  const done = watched >= required && (phase === "fallback" || Boolean(creative));

  useEffect(() => {
    if (!open || !done || completedRef.current) return;
    completedRef.current = true;
    const timeout = window.setTimeout(() => onCompleteRef.current(), 400);
    return () => window.clearTimeout(timeout);
  }, [open, done]);

  useEffect(() => {
    if (!open || phase !== "fallback") return;
    if (watched >= required) return;

    const startedAt = Date.now() - watchedRef.current * 1000;
    const timer = window.setInterval(() => {
      markWatched(Math.min(required, (Date.now() - startedAt) / 1000));
    }, 250);

    return () => window.clearInterval(timer);
  }, [open, phase, required, watched, markWatched]);

  useEffect(() => {
    if (!open || phase !== "ready" || !videoEnded) return;
    if (watchedRef.current >= required) return;

    const startedAt = Date.now() - watchedRef.current * 1000;
    const timer = window.setInterval(() => {
      markWatched(Math.min(required, (Date.now() - startedAt) / 1000));
    }, 250);

    return () => window.clearInterval(timer);
  }, [open, phase, videoEnded, required, markWatched]);

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      await video.play();
      setNeedsTap(false);
    } catch {
      try {
        video.muted = true;
        setMuted(true);
        await video.play();
        setNeedsTap(false);
      } catch {
        setNeedsTap(true);
      }
    }
  }, []);

  useEffect(() => {
    if (phase !== "ready" || !creative) return;
    const timeout = window.setTimeout(() => void startPlayback(), 120);
    return () => window.clearTimeout(timeout);
  }, [phase, creative, startPlayback]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;

    if (!impressionFired.current && creative) {
      impressionFired.current = true;
      firePixels(creative.impressions);
    }

    markWatched(video.currentTime);

    if (video.currentTime >= required) {
      video.pause();
    }
  }

  function handleSeeking() {
    const video = videoRef.current;
    if (!video) return;
    const maxWatched = Math.max(watchedRef.current, 0);
    if (video.currentTime > maxWatched + 1) {
      video.currentTime = maxWatched;
    }
  }

  function handleClickThrough() {
    if (!creative?.clickThrough) return;
    firePixels(creative.clickTracking);
    window.open(creative.clickThrough, "_blank", "noopener,noreferrer");
  }

  const progress = required > 0 ? Math.min(100, (watched / required) * 100) : 0;
  const remaining = Math.max(0, Math.ceil(required - watched));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Unlock your download</DialogTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground tabular-nums">
              <Clock3 className="size-3.5" />
              {done ? "Ready" : `${remaining}s`}
            </span>
          </div>
          <DialogDescription>
            Watch one {required}-second ad and every file in this post becomes
            ready to download.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 p-1">
          <p className="px-1 pt-1 pb-1.5 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Advertisement
          </p>

          {phase === "loading" && (
            <div className="flex h-[220px] items-center justify-center rounded-lg bg-background">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Loading ad…
              </div>
            </div>
          )}

          {phase === "ready" && creative && (
            <div className="relative overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                src={creative.mediaUrl}
                className="aspect-video w-full bg-black object-contain"
                playsInline
                preload="auto"
                controls={false}
                disablePictureInPicture
                onTimeUpdate={handleTimeUpdate}
                onSeeking={handleSeeking}
                onEnded={() => setVideoEnded(true)}
                onError={() => setVideoFailed(true)}
                onPause={(event) => {
                  if (event.currentTarget.ended) return;
                  if (watchedRef.current < required) setNeedsTap(true);
                }}
              />

              {needsTap && !done && !videoEnded && (
                <button
                  type="button"
                  onClick={() => void startPlayback()}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white backdrop-blur-sm"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-white text-black">
                    <Play className="size-5 fill-current" />
                  </span>
                  <span className="text-sm font-medium">Tap to play the ad</span>
                </button>
              )}

              {!needsTap && !done && !videoEnded && (
                <button
                  type="button"
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    video.muted = !video.muted;
                    setMuted(video.muted);
                  }}
                  aria-label={muted ? "Unmute ad" : "Mute ad"}
                  className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                >
                  {muted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
              )}

              {creative.clickThrough && (
                <button
                  type="button"
                  onClick={handleClickThrough}
                  className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
                >
                  Learn more
                  <ExternalLink className="size-3" />
                </button>
              )}

              {videoEnded && !done && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/90 text-center text-white backdrop-blur-sm">
                  <span className="text-sm font-semibold">Ad finished</span>
                  <span className="text-xs text-white/70">
                    Your download unlocks in {remaining}s
                  </span>
                </div>
              )}

              {done && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-sm font-medium text-white backdrop-blur-sm">
                  Ad complete — unlocking…
                </div>
              )}
            </div>
          )}

          {phase === "fallback" && (
            <AdSenseUnit
              slot={adsConfig.slots.reward}
              minHeight={220}
              format="rectangle"
              fallback={<HouseCreative done={done} />}
            />
          )}

          {videoFailed && phase === "ready" && (
            <p className="px-2 pt-2 text-xs text-muted-foreground">
              The ad video could not play. Keep this window open — the timer
              still counts.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Progress value={progress} aria-label="Reward ad progress" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {done ? "Unlocked" : videoEnded ? "Ad finished" : "Ad playing…"}
            </span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {creative?.advertiser ?? "Sponsored content"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={done}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

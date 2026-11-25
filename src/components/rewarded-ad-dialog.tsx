"use client";

import { Clock3, Download, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const AD_SECONDS = 15;

interface RewardedAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function RewardedAdDialog({
  open,
  onOpenChange,
  onComplete,
}: RewardedAdDialogProps) {
  const [remaining, setRemaining] = useState(AD_SECONDS);
  const firedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!open) return;

    firedRef.current = false;
    setRemaining(AD_SECONDS);
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, AD_SECONDS - elapsed);
      setRemaining(left);
      if (left === 0) window.clearInterval(timer);
    }, 250);

    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open || remaining > 0 || firedRef.current) return;

    firedRef.current = true;
    const timeout = window.setTimeout(() => onCompleteRef.current(), 350);
    return () => window.clearTimeout(timeout);
  }, [open, remaining]);

  const progress = ((AD_SECONDS - remaining) / AD_SECONDS) * 100;
  const done = remaining === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Download unlock karein</DialogTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground tabular-nums">
              <Clock3 className="size-3.5" />
              {done ? "Ready" : `${remaining}s`}
            </span>
          </div>
          <DialogDescription>
            Ek chhoti reward ad dekhein — uske baad is post ke saare files
            download ho jayenge.
          </DialogDescription>
        </DialogHeader>

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
                SnapSave — public posts, seedha aapke device mein.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-white/80">
              <ShieldCheck className="size-3.5" />
              {done
                ? "Ad complete — download shuru ho raha hai…"
                : "Ad complete hone tak page band na karein."}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} aria-label="Reward ad progress" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{done ? "Unlocked" : "Ad chal rahi hai…"}</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="flex justify-end">
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

"use client";

import { ExternalLink, Sparkles } from "lucide-react";

import { AdSenseUnit } from "@/components/adsense-unit";
import { adsConfig } from "@/lib/ads";
import { cn } from "@/lib/utils";

type AdVariant = "leaderboard" | "rectangle" | "inline";

const creatives: Record<
  AdVariant,
  {
    eyebrow: string;
    headline: string;
    body: string;
    cta: string;
    tone: string;
    accent: string;
    slot: string;
    minHeight: number;
  }
> = {
  leaderboard: {
    eyebrow: "Sponsored",
    headline: "Editing your reels takes too long?",
    body: "Auto-cut, captions and music in one editor. Free to try on web.",
    cta: "Try the editor",
    tone: "from-indigo-500/10 via-sky-500/10 to-emerald-400/10",
    accent: "bg-indigo-600 text-white hover:bg-indigo-600/90",
    slot: adsConfig.slots.top,
    minHeight: 100,
  },
  rectangle: {
    eyebrow: "Sponsored",
    headline: "Store every post you love",
    body: "A simple gallery app for your saved photos and videos. No account needed.",
    cta: "Get the app",
    tone: "from-amber-400/15 via-rose-400/10 to-fuchsia-400/15",
    accent: "bg-foreground text-background hover:bg-foreground/90",
    slot: adsConfig.slots.mid,
    minHeight: 250,
  },
  inline: {
    eyebrow: "Sponsored",
    headline: "Back up your phone photos",
    body: "Automatic backup with 5 GB free. Set it up in under a minute.",
    cta: "Start free",
    tone: "from-emerald-400/15 via-teal-400/10 to-sky-400/15",
    accent: "bg-emerald-600 text-white hover:bg-emerald-600/90",
    slot: adsConfig.slots.bottom,
    minHeight: 100,
  },
};

function HouseCreative({ variant }: { variant: AdVariant }) {
  const creative = creatives[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-r p-4",
        creative.tone,
        variant === "rectangle" && "sm:p-6",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-8 size-32 rounded-full bg-background/40 blur-2xl"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            <Sparkles className="size-3" />
            {creative.eyebrow}
          </span>
          <p className="mt-2 text-sm font-semibold sm:text-base">
            {creative.headline}
          </p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {creative.body}
          </p>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-4 text-sm font-medium transition-colors sm:self-auto",
            "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            creative.accent,
          )}
        >
          {creative.cta}
          <ExternalLink className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function AdSlot({
  variant = "leaderboard",
  className,
}: {
  variant?: AdVariant;
  className?: string;
}) {
  const creative = creatives[variant];

  return (
    <aside aria-label="Advertisement" className={cn("w-full", className)}>
      <div
        className={cn(
          "mx-auto w-full",
          variant === "rectangle" ? "max-w-2xl" : "max-w-5xl",
        )}
      >
        <p className="mb-1.5 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Advertisement
        </p>

        <AdSenseUnit
          slot={creative.slot}
          minHeight={creative.minHeight}
          format={variant === "rectangle" ? "rectangle" : "horizontal"}
          fallback={<HouseCreative variant={variant} />}
        />
      </div>
    </aside>
  );
}

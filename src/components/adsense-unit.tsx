"use client";

import { useEffect, useRef, useState } from "react";

import { adsConfig } from "@/lib/ads";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type Status = "pending" | "filled" | "failed";

export function AdSenseUnit({
  slot,
  format = "auto",
  minHeight = 100,
  className,
  fallback,
}: {
  slot: string;
  format?: string;
  minHeight?: number;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const [status, setStatus] = useState<Status>(
    adsConfig.client && slot ? "pending" : "failed",
  );

  useEffect(() => {
    if (!adsConfig.client || !slot) {
      setStatus("failed");
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch {
      setStatus("failed");
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const state = insRef.current?.getAttribute("data-ad-status");

      if (state === "filled") {
        setStatus("filled");
        window.clearInterval(timer);
      } else if (state === "unfilled") {
        setStatus("failed");
        window.clearInterval(timer);
      } else if (Date.now() - startedAt > 6000) {
        setStatus("failed");
        window.clearInterval(timer);
      }
    }, 400);

    return () => window.clearInterval(timer);
  }, [slot]);

  if (status === "failed") {
    return <>{fallback ?? null}</>;
  }

  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      style={{ minHeight }}
      aria-live="polite"
    >
      <ins
        ref={insRef}
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight }}
        data-ad-client={adsConfig.client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

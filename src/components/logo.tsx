import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const mark = size === "sm" ? "size-7" : "size-9";
  const glyph = size === "sm" ? "size-3.5" : "size-4";
  const word = size === "sm" ? "text-sm" : "text-lg";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/20",
          mark,
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={glyph}
        >
          <path d="M12 3v11" />
          <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
          <path d="M4.5 18.5h15" />
        </svg>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15"
        />
      </span>

      <span className={cn("font-semibold tracking-tight", word)}>
        Video<span className="text-muted-foreground">Drop</span>
      </span>
    </span>
  );
}

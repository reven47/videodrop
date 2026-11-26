import { site } from "@/lib/site";

export function LegalPage({
  title,
  intro,
  updated = site.legalUpdated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated: {updated}
      </p>

      {intro ? (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {intro}
        </p>
      ) : null}

      <div
        className={[
          "mt-8 text-sm leading-relaxed sm:text-base",
          "[&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:sm:text-lg",
          "[&_h3]:mt-6 [&_h3]:text-sm [&_h3]:font-semibold",
          "[&_p]:mt-3 [&_p]:text-muted-foreground",
          "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-muted-foreground",
          "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:text-muted-foreground",
          "[&_li]:leading-relaxed",
          "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
          "[&_strong]:font-semibold [&_strong]:text-foreground",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Download, Globe2, ShieldCheck, Zap } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `About — ${site.name}`,
  description:
    "VideoDrop is a free, no-login tool for saving public Instagram and Facebook photos and videos.",
};

const values = [
  {
    icon: Zap,
    title: "One click, no friction",
    body: "No sign-up, no app install, no password. Paste a link and go.",
  },
  {
    icon: ShieldCheck,
    title: "Public content only",
    body: "We never log in to an account or touch private posts. What you can see publicly is what you can save.",
  },
  {
    icon: Globe2,
    title: "Free to use",
    body: "A single short reward ad keeps the servers running, so the tool stays free for everyone.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            About
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A simple way to keep the posts you love.
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {site.name} is a free web tool for saving publicly available photos
            and videos from Instagram and Facebook. It exists because the built-in
            save options are limited: you cannot always get the original file, and
            you cannot always do it from a desktop browser.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We built {site.name} to fix that. Pick a platform, paste a public post
            link, and the site fetches the media for you. A single 30-second
            reward ad unlocks the download, which is how the service stays free
            without subscriptions or accounts.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border bg-card p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                  <value.icon className="size-4" />
                </span>
                <h2 className="mt-3 text-sm font-semibold">{value.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-lg font-semibold tracking-tight">
            What we do not do
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>We do not ask for or store your Instagram or Facebook login.</li>
            <li>We do not access private accounts or friends-only posts.</li>
            <li>We do not sell your personal data.</li>
          </ul>

          <h2 className="mt-10 text-lg font-semibold tracking-tight">
            Use it responsibly
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Only download your own content, or content you have permission to
            use. Respect creators&apos; rights and the terms of the platform the
            media came from. {site.name} is not affiliated with Instagram,
            Facebook or Meta Platforms.
          </p>

          <div className="mt-10 flex flex-col gap-3 rounded-xl border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Ready to try it?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste a public post link and save the file in a click.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="size-4" />
              Open the downloader
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Questions or feedback? Email{" "}
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

import Link from "next/link";

import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="VideoDrop home"
            >
              <Logo size="sm" />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {site.tagline} Only download your own content or content you have
              permission to use. VideoDrop is not affiliated with Instagram or
              Facebook.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:gap-x-16">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Product
              </p>
              <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">
                How it works
              </Link>
              <Link href="/#platforms" className="text-muted-foreground hover:text-foreground">
                Supported links
              </Link>
              <Link href="/#faq" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Company
              </p>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About us
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms &amp; conditions
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="hover:text-foreground"
          >
            {site.email}
          </a>
        </div>
      </div>
    </footer>
  );
}

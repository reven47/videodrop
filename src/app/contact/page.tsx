import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact — ${site.name}`,
  description:
    "Get in touch with the VideoDrop team about bugs, takedown requests or general questions.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Contact
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Talk to us.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Found a bug, want a post removed, or have an idea for{" "}
            {site.name}? Send a message and we will get back to you.
          </p>

          <div className="mt-8 rounded-xl border bg-card p-5 sm:p-6">
            <ContactForm email={site.email} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-5">
              <h2 className="text-sm font-semibold">Response time</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                We usually reply within 2 business days. Include the post link if
                your message is about a specific download.
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <h2 className="text-sm font-semibold">Takedown requests</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                We do not host any media. If content is online, it is stored by
                Instagram or Facebook — contact them directly for removal.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

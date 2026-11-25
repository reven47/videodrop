import {
  Check,
  Download,
  Link2,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import { Downloader } from "@/components/downloader";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const steps = [
  {
    title: "Paste the post link",
    description:
      "Copy the public link of an Instagram post or a Facebook photo, video or reel, then paste it above.",
  },
  {
    title: "We fetch the media",
    description:
      "We pull the available photo or video and show a preview — no login, no app install.",
  },
  {
    title: "Watch the ad, then save",
    description:
      "A 15-second reward ad unlocks the download. One ad covers every file in that post.",
  },
];

const platforms = [
  {
    name: "Instagram",
    supports: [
      "Public photo posts",
      "Single-image posts",
      "Full-resolution image download",
    ],
    limits: "Login-gated reels and videos cannot be fetched.",
  },
  {
    name: "Facebook",
    supports: [
      "Public photo posts",
      "Public videos in HD",
      "Reels and watch links",
    ],
    limits: "Private profiles and friends-only posts are not supported.",
  },
];

const faqs = [
  {
    question: "Can I download posts from private accounts?",
    answer:
      "No. Only public posts are fetched. We never log in to an account and cannot access private content.",
  },
  {
    question: "Do I need to log in to Instagram or Facebook?",
    answer:
      "No. All you need is the post link. We never ask for your password or cookies.",
  },
  {
    question: "How long is the reward ad?",
    answer:
      "15 seconds. One ad unlocks every available file in that post, so you do not have to watch it again.",
  },
  {
    question: "Which links are supported?",
    answer:
      "Instagram photo posts, and public Facebook photos, videos and reels. Some Instagram reels and videos require a login, so they cannot be fetched.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. There is no subscription — just one short reward ad that helps keep the site running.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <a
            href="#top"
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="PostSave home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/20">
              <Download className="size-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">PostSave</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a href="#platforms" className="transition-colors hover:text-foreground">
              Supported
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main id="top" className="flex-1">
        <section className="relative isolate overflow-hidden px-4 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden"
          >
            <div className="absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-400/25 via-rose-400/20 to-orange-300/25 blur-3xl dark:from-fuchsia-500/15 dark:via-rose-500/10 dark:to-orange-400/10" />
            <div className="absolute top-24 right-0 size-64 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span>Instagram</span>
              <span aria-hidden className="text-border">
                +
              </span>
              <span>Facebook</span>
              <span aria-hidden>·</span>
              <span>Public posts</span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Save your favourite posts,{" "}
              <span className="bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500 bg-clip-text text-transparent dark:from-fuchsia-400 dark:via-rose-400 dark:to-orange-300">
                straight to your device.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pick Instagram or Facebook, paste a public post link, watch one
              15-second reward ad, and save the photo or video in a click.
            </p>

            <div className="mt-8">
              <Downloader />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t bg-muted/30 px-4 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Three small steps. That is it.
              </h2>
            </div>

            <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full border bg-background text-sm font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-3 border-t pt-8 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <LockKeyhole className="size-4 shrink-0" />
                No login or password
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />
                Public content only
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="size-4 shrink-0" />
                One 15-second ad per post
              </div>
            </div>
          </div>
        </section>

        <section id="platforms" className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Supported
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Both platforms, one downloader.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Switch between Instagram and Facebook with the tabs above — no
                separate tool, no second account.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="rounded-xl border bg-card p-5"
                >
                  <h3 className="text-base font-semibold">{platform.name}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {platform.supports.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
                    {platform.limits}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:pb-20">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Link2 className="size-3.5" />
            FAQ
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>

          <Accordion type="single" collapsible className="mt-6">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 text-white">
              <Download className="size-3.5" />
            </span>
            <span className="text-sm font-semibold">PostSave</span>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
            Only download your own content or content you have permission to
            use. This tool is not affiliated with Instagram or Facebook.
          </p>
        </div>
      </footer>
    </div>
  );
}

import {
  Download,
  Instagram,
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
    title: "Link paste karein",
    description:
      "Instagram post ya Facebook photo/video ka public link copy karke upar paste karein.",
  },
  {
    title: "Post fetch karein",
    description:
      "Hum available media nikaal kar preview dikhate hain — bina login, bina app.",
  },
  {
    title: "Ad dekh kar save karein",
    description:
      "15-second reward ad ke baad download unlock ho jata hai. Ek ad, poora post.",
  },
];

const faqs = [
  {
    question: "Kya private account ke posts download ho sakte hain?",
    answer:
      "Nahi. Sirf public posts hi fetch hoti hain. Hum kisi account mein login nahi karte aur private content access nahi karte.",
  },
  {
    question: "Kya mujhe Instagram ya Facebook login karna padega?",
    answer:
      "Nahi. Sirf post ka link chahiye. Login, password ya cookies kabhi nahi maange jaate.",
  },
  {
    question: "Reward ad kitni lambi hai?",
    answer:
      "15 seconds. Ek ad us post ke saare available files unlock karta hai, baar-baar dekhne ki zaroorat nahi.",
  },
  {
    question: "Kaun se links supported hain?",
    answer:
      "Instagram photo posts aur Facebook public photos, videos aur reels. Kuch Instagram reels/videos login-gated hote hain, isliye woh fetch nahi ho paate.",
  },
  {
    question: "Kya yeh free hai?",
    answer:
      "Haan. Koi subscription nahi — bas ek chhoti reward ad, jo site ko chalane mein madad karti hai.",
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
            <span className="text-lg font-semibold tracking-tight">
              PostSave
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              Kaise kaam karta hai
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
              <span className="flex items-center gap-1">
                <Instagram className="size-3.5" />
                Instagram
              </span>
              <span aria-hidden className="text-border">
                +
              </span>
              <span className="flex items-center gap-1">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3.5"
                >
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
                </svg>
                Facebook
              </span>
              <span aria-hidden>·</span>
              <span>Public posts</span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Apne favourite posts,{" "}
              <span className="bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500 bg-clip-text text-transparent dark:from-fuchsia-400 dark:via-rose-400 dark:to-orange-300">
                seedha apne device mein.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Instagram ya Facebook ka public link paste karein, 15-second
              reward ad dekhein, aur photo ya video ek click mein save karein.
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
                Kaise kaam karta hai
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Teen chhote steps. Bas.
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
                Koi login ya password nahi
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />
                Sirf public content
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="size-4 shrink-0" />
                Ek 15-second ad, poora post unlocked
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Link2 className="size-3.5" />
            FAQ
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Aksar poochhe jaane wale sawaal
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
            Sirf apna content ya jiske liye aapke paas permission ho download
            karein. Yeh tool Instagram ya Facebook se affiliated nahi hai.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { ExampleSiteFooter } from "@/components/example-site-footer";
import { ExampleSiteHeader } from "@/components/example-site-header";
import { SubscribeForm } from "@/components/subscribe-form";
import { Card } from "@/components/ui/card";
import "@/content-packs";
import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Art of Mindful Productivity — Learnwise",
  description:
    "A free 5-day email course on building sustainable focus and productivity habits.",
};

/* ── Static data ── */

const COURSE_OUTLINE = [
  {
    day: "Welcome",
    title: "Welcome & What to Expect",
    description:
      "A warm introduction to the course, what you'll learn, and how to squeeze every drop of value from each lesson.",
  },
  {
    day: "Day 1",
    title: "The Power of Single-Tasking",
    description:
      "Multitasking is a myth. Discover why doing one thing at a time isn't just productive — it's transformative.",
  },
  {
    day: "Day 2",
    title: "Designing Your Ideal Morning",
    description:
      "The first hour shapes the entire day. Learn to craft a morning that fuels focus and intention.",
  },
  {
    day: "Day 3",
    title: "The Two-Minute Rule",
    description:
      "Small, immediate actions build unstoppable momentum. A deceptively simple technique that changes everything.",
  },
  {
    day: "Day 4",
    title: "Digital Minimalism",
    description:
      "Your attention is your most valuable asset. Reclaim it from the pull of notifications and noise.",
  },
  {
    day: "Day 5",
    title: "Building Sustainable Habits",
    description:
      "Turn five days of insights into a practice that lasts. Because productivity without sustainability is just burnout.",
  },
];

const FAQS = [
  {
    q: "Is this really free?",
    a: "Completely. No credit card, no hidden upsells, no catch. Five days of focused, actionable content — that's the whole deal.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Of course. Every email includes a manage link where you can pause deliveries and pick up exactly where you left off.",
  },
  {
    q: "How do I unsubscribe?",
    a: "One click. Every email has an unsubscribe link at the bottom. We also include a manage link if you'd rather adjust preferences instead.",
  },
  {
    q: "When will I receive emails?",
    a: "You choose your preferred time when you sign up. Emails arrive at that time in your local timezone, every day for five days.",
  },
  {
    q: "What if I miss an email?",
    a: 'Each email has a "read online" link that takes you to a beautifully formatted companion page. The content is always there for you.',
  },
  {
    q: "Can I start over?",
    a: "Yes — unsubscribe and re-subscribe to begin fresh from the welcome email. Simple as that.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "This course changed how I approach my mornings. The single-tasking lesson alone was worth signing up for — I'm more focused than I've been in years.",
    name: "Sarah K.",
    role: "Product Designer",
  },
  {
    quote:
      "Perfectly paced. Each email gave me exactly one thing to implement that day. No overwhelm, just steady progress.",
    name: "Marcus R.",
    role: "Software Engineer",
  },
  {
    quote:
      "I've tried dozens of productivity systems. This is the first that actually stuck — because it taught me habits, not hacks.",
    name: "Aisha M.",
    role: "Marketing Director",
  },
];

/* ── Page ── */

export default function MindfulProductivityPage() {
  return (
    <div className="min-h-screen bg-background">
      <ExampleSiteHeader />

      {/* ── Demo Banner ── */}
      <div className="border-b bg-primary/5 px-6 py-3 text-center">
        <p className="text-sm text-muted-foreground">
          This is a <strong className="text-foreground">live demo</strong> of a
          ContentDrip content pack.{" "}
          <a href="/" className="font-medium text-primary hover:underline">
            Learn more about ContentDrip &rarr;
          </a>
        </p>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b bg-grain">
        {/* Warm gradient wash */}
        <div className="absolute inset-0 bg-linear-to-b from-(--surface-warm) via-(--surface-warm)/60 to-background" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-12 md:pb-32 md:pt-28 lg:gap-20">
          {/* ── Left: Copy ── */}
          <div className="max-w-xl">
            <p className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Free 5-Day Email Course
            </p>

            <h1 className="animate-fade-in-up delay-1 mt-8 font-serif text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
              Master the Art of{" "}
              <span className="relative inline-block italic text-primary">
                Mindful
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 14"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10c30-7 60-7 98-3.5 38 3.5 68 1 98-3.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="text-primary/50"
                  />
                </svg>
              </span>{" "}
              <span className="italic text-primary">Productivity</span>
            </h1>

            <p className="animate-fade-in-up delay-2 mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-[17px] md:leading-[1.75]">
              One actionable lesson in your inbox each morning. Five days to
              transform how you work, think, and focus.
            </p>

            {/* Social proof strip */}
            <div className="animate-fade-in-up delay-3 mt-10 flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  2,400+ learners
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      className="h-3.5 w-3.5 fill-current text-amber-500/80"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                    4.9 avg
                  </span>
                </div>
              </div>
            </div>

            {/* Trust markers */}
            <div className="animate-fade-in-up delay-4 mt-7 flex flex-wrap gap-3">
              {["No spam", "Unsubscribe anytime", "Free forever"].map(
                (label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-background/50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
                  >
                    <svg
                      className="h-3 w-3 text-primary/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* ── Right: Form composition ── */}
          <div className="animate-fade-in-up delay-2 relative flex items-center justify-center md:justify-end">
            {/* The form card */}
            <Card className="relative z-[5] w-full max-w-sm overflow-hidden pt-0 shadow-2xl shadow-foreground/8 ring-1 ring-border/50">
              {/* Card header with warm accent bar */}
              <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-7 pb-4 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 shadow-sm">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">
                      Start your journey
                    </p>
                    <p className="text-xs text-muted-foreground">
                      5 lessons delivered to your inbox
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-7 pb-7 pt-2">
                <SubscribeForm
                  packKey="mindful-productivity"
                  cadence="0 8 * * *"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Three steps to better habits
            </h2>
          </div>

          <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {(
              [
                {
                  num: "01",
                  title: "Subscribe",
                  desc: "Enter your email and choose when you'd like each lesson to arrive.",
                },
                {
                  num: "02",
                  title: "Learn Daily",
                  desc: "One focused lesson each morning — five minutes to read, a lifetime to apply.",
                },
                {
                  num: "03",
                  title: "Transform",
                  desc: "Build real habits with practical exercises you can start using immediately.",
                },
              ] as const
            ).map((step) => (
              <div key={step.num} className="text-center sm:text-left">
                <span className="font-serif text-3xl font-semibold text-primary/30">
                  {step.num}
                </span>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Outline ── */}
      <section className="border-b bg-warm-subtle py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
            The Curriculum
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            What You&apos;ll Learn
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Six carefully sequenced lessons, each building on the last. Read in
            five minutes, practice for a lifetime.
          </p>

          <div className="mt-12 space-y-0 divide-y divide-border/60">
            {COURSE_OUTLINE.map((item, i) => (
              <div
                key={i}
                className="group flex gap-5 py-6 first:pt-0 last:pb-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/10">
                  {i === 0 ? "✦" : i}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug text-foreground">
                    <span className="font-normal text-muted-foreground">
                      {item.day}
                      <span className="mx-2 text-border">—</span>
                    </span>
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sneak Peek ── */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
            Preview
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            A Taste of What Arrives
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Here&apos;s a glimpse of what lands in your inbox on Day 1.
          </p>

          <Card className="mt-10 overflow-hidden shadow-lg shadow-foreground/3 pt-0">
            {/* Email header */}
            <div className="border-b bg-(--surface-warm) px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-semibold text-primary">
                  M
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground no-underline">
                    Mindful Productivity
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Day 1 — The Power of Single-Tasking
                  </p>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="p-6 md:p-8">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Good morning! Today we&apos;re exploring one of the most
                counterintuitive truths about productivity:{" "}
                <strong className="text-foreground">
                  doing less leads to achieving more.
                </strong>
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/singletask/560/280"
                alt="A focused workspace with a single notebook"
                className="mt-5 w-full rounded-lg object-cover"
              />
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                When we scatter our attention across five tasks, we don&apos;t
                get five things done — we get fragments of five things done,
                each poorly. Research from Stanford shows that heavy
                multitaskers are{" "}
                <strong className="text-foreground">
                  worse at filtering irrelevant information
                </strong>{" "}
                and slower at switching between tasks...
              </p>
              <p className="mt-6 text-sm font-medium text-primary no-underline">
                Continue reading in your inbox&ensp;&rarr;
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-b bg-warm-subtle py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Testimonials
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              From Real Learners
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card
                key={i}
                className="flex flex-col p-6 transition-shadow hover:shadow-lg hover:shadow-foreground/2"
              >
                {/* Stars */}
                <div className="flex gap-0.5 text-primary/60">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      className="h-3.5 w-3.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-5 border-t pt-4">
                  <p className="text-sm font-medium text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
            Questions
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Frequently Asked
          </h2>

          <div className="mt-10 divide-y divide-border/60">
            {FAQS.map((faq, i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium text-foreground no-underline">
                  {faq.q}
                  <ChevronDown className="ml-4 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 pr-8 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-link ── */}
      <section className="border-b bg-warm-subtle py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
            Also from Learnwise
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            Deep Work Essentials
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            A free 2-day email course on mastering deep work. Learn to eliminate
            distractions and produce your best work.
          </p>
          <Link
            href="/deep-work"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
          >
            Explore Deep Work Essentials &rarr;
          </Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-foreground py-20 md:py-28">
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-grain opacity-40" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/40">
            Start Today
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
            Ready to Transform Your Mornings?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/60">
            Five days. Five lessons. One email at a time, at the hour you
            choose. No spam, no nonsense — just a better way to work.
          </p>
          <div className="mx-auto mt-10 max-w-sm">
            <Card className="p-6 shadow-2xl ring-1 ring-white/10">
              <SubscribeForm
                packKey="mindful-productivity"
                cadence="0 8 * * *"
              />
            </Card>
          </div>
        </div>
      </section>

      <ExampleSiteFooter />
    </div>
  );
}

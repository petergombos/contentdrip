import Link from "next/link";
import { DemoBanner } from "@/components/demo-banner";
import { ExampleSiteFooter } from "@/components/example-site-footer";
import { ExampleSiteHeader } from "@/components/example-site-header";
import { SubscribeForm } from "@/components/subscribe-form";
import { Card } from "@/components/ui/card";
import "@/content-packs";
import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep Work Essentials — Learnwise",
  description:
    "A free email course on mastering deep work. Learn to achieve laser focus and produce your best work.",
  openGraph: {
    title: "Deep Work Essentials",
    description:
      "A free email course on mastering deep work. Learn to achieve laser focus and produce your best work.",
    images: [
      {
        url: "/api/og?type=landing&title=Deep+Work+Essentials&description=A+free+email+course+on+mastering+deep+work.+Learn+to+achieve+laser+focus+and+produce+your+best+work.",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    title: "Deep Work Essentials — Learnwise",
    images: [
      "/api/og?type=landing&title=Deep+Work+Essentials&description=A+free+email+course+on+mastering+deep+work.+Learn+to+achieve+laser+focus+and+produce+your+best+work.",
    ],
  },
};

/* -- Static data -- */

const COURSE_OUTLINE = [
  {
    day: "Welcome",
    title: "Welcome & The Deep Work Framework",
    description:
      "An introduction to the science of deep work and a framework you can start using today.",
  },
  {
    day: "Day 1",
    title: "The Deep Work Method",
    description:
      "Dedicate uninterrupted blocks to your most important work. Learn the ritual that makes it stick.",
  },
  {
    day: "Day 2",
    title: "Building Your Deep Work Ritual",
    description:
      "Turn deep work from an occasional event into a daily habit. Design your ritual, master the shutdown, and make focus automatic.",
  },
];

const FAQS = [
  {
    q: "Is this really free?",
    a: "Completely. No credit card, no hidden upsells. Two days of focused, actionable content.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Of course. Every email includes a manage link where you can pause deliveries and pick up where you left off.",
  },
  {
    q: "How do I unsubscribe?",
    a: "One click. Every email has an unsubscribe link at the bottom.",
  },
  {
    q: "When will I receive emails?",
    a: "You choose your preferred time when you sign up. Emails arrive at that time in your local timezone.",
  },
];

/* -- Page -- */

export default function DeepWorkPage() {
  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <ExampleSiteHeader />

      {/* -- Hero -- */}
      <section className="relative overflow-hidden border-b bg-grain">
        <div className="absolute inset-0 bg-linear-to-b from-(--surface-warm) via-(--surface-warm)/60 to-background" />

        <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-20 text-center md:pb-32 md:pt-28">
          <p className="animate-fade-in-up text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Free 2-Day Email Course
          </p>

          <h1 className="animate-fade-in-up delay-1 mx-auto mt-6 max-w-2xl font-serif text-[2.75rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Master the Art of{" "}
            <span className="italic text-primary">Deep Work</span>
          </h1>

          <p className="animate-fade-in-up delay-2 mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Two focused lessons delivered to your inbox. Learn to eliminate
            distractions and produce your best work.
          </p>

          <div className="animate-fade-in-up delay-3 mx-auto mt-10 max-w-sm">
            <Card className="p-6 shadow-xl shadow-foreground/3 ring-1 ring-border/60">
              <SubscribeForm packKey="deep-work" />
            </Card>
            <p className="mt-5 text-[11px] tracking-wide text-muted-foreground/70">
              No spam&ensp;&middot;&ensp;Unsubscribe
              anytime&ensp;&middot;&ensp;Free forever
            </p>
          </div>
        </div>
      </section>

      {/* -- How It Works -- */}
      <section className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Three steps to laser focus
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
                  title: "Learn",
                  desc: "Two focused lessons on deep work fundamentals, delivered at your pace.",
                },
                {
                  num: "03",
                  title: "Apply",
                  desc: "Practical exercises to immediately improve your focus and output.",
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

      {/* -- Content Outline -- */}
      <section className="border-b bg-warm-subtle py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
            The Curriculum
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            What You&apos;ll Learn
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Two carefully crafted lessons to help you master focused,
            distraction-free work.
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

      {/* -- FAQ -- */}
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

      {/* -- Cross-link -- */}
      <section className="border-b bg-warm-subtle py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
            Also from Learnwise
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            The Art of Mindful Productivity
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            A free 5-day email course on building sustainable focus and
            productivity habits. One actionable lesson each morning.
          </p>
          <Link
            href="/mindful-productivity"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
          >
            Explore Mindful Productivity &rarr;
          </Link>
        </div>
      </section>

      {/* -- Final CTA -- */}
      <section className="relative overflow-hidden bg-foreground py-20 md:py-28">
        <div className="absolute inset-0 bg-grain opacity-40" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/40">
            Start Today
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
            Ready to Master Deep Work?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/60">
            Two days. Two focused lessons. One email at a time, at the hour you
            choose. No spam, no nonsense — just focused work.
          </p>
          <div className="mx-auto mt-10 max-w-sm">
            <Card className="p-6 shadow-2xl ring-1 ring-white/10">
              <SubscribeForm packKey="deep-work" />
            </Card>
          </div>
        </div>
      </section>

      <ExampleSiteFooter />
    </div>
  );
}

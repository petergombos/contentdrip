import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "ContentDrip — Open-Source Email Drip Courses",
  description:
    "Turn your knowledge into automated email courses. Open-source, self-hosted, built with Next.js.",
};

/* ── Data ── */

const FEATURES = [
  {
    label: "Content Packs",
    desc: "Each course is a self-contained pack — a folder of markdown emails, companion web pages, and a custom email template. Create one pack or twenty. They're independent, portable, and easy to reason about.",
  },
  {
    label: "Scheduled Delivery",
    desc: "Subscribers choose the hour they want to receive emails. A cron job evaluates every active subscription each minute and sends emails at the exact time the subscriber chose. No batching, no approximation.",
  },
  {
    label: "Timezone Aware",
    desc: "Timezones are auto-detected from the subscriber's browser via the Intl API and stored per subscription. The scheduler evaluates cron expressions in the subscriber's local timezone, so 8am means 8am wherever they are.",
  },
  {
    label: "Companion Pages",
    desc: "Every email has a web-readable companion page at /p/{pack}/{step}. Subscribers can share links, read on any device, and access content without digging through their inbox. Pages are generated from markdown in your pack's pages/ directory.",
  },
  {
    label: "Subscriber Management",
    desc: "Built-in manage page where subscribers update their delivery time, timezone, or unsubscribe — all via secure, signed, single-use token links. No account creation, no passwords. Just click the link in any email.",
  },
  {
    label: "Pause & Resume",
    desc: "Subscribers pause delivery with one click from any email. When they resume, they pick up exactly where they left off — the scheduler tracks which step was last sent and continues from the next one.",
  },
  {
    label: "Email Branding",
    desc: "Each pack defines its own EmailShell — a React Email component that wraps every outgoing email in custom branding. Headers, footers, typography, colors, images — full control over every pixel, tested across email clients.",
  },
  {
    label: "One-Click Unsubscribe",
    desc: "Every email includes a signed, one-click unsubscribe link that immediately stops delivery. The link is unique per subscriber and cryptographically verified. CAN-SPAM and GDPR compliant out of the box.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Clone",
    desc: "Fork or clone the ContentDrip template repository. It's a standard Next.js app with the App Router — no custom build tools, no exotic dependencies. If you've used Next.js before, you already know how this works.",
  },
  {
    n: "02",
    title: "Write",
    desc: "Create a content pack by writing markdown files with YAML frontmatter for subjects and previews. Define your steps in pack.ts, build an EmailShell for branding, and register the pack. That's the entire content model.",
  },
  {
    n: "03",
    title: "Deploy",
    desc: "Push to Vercel (or any Node.js host). Set your environment variables for the database (Turso), email provider (Postmark), and cron secret. Configure a cron job to hit /api/cron every minute. That's the infrastructure.",
  },
  {
    n: "04",
    title: "Drip",
    desc: "Visitors land on your pack's page, enter their email, and choose a delivery time. They confirm via email, get a welcome message immediately, then receive one lesson per day at their chosen time in their timezone.",
  },
];

const STACK = [
  { name: "Next.js", note: "App Router, Server Actions, API Routes" },
  { name: "React Email", note: "Type-safe, cross-client email templates" },
  { name: "Drizzle ORM", note: "Type-safe SQL with zero-overhead" },
  { name: "SQLite / Turso", note: "Edge-ready, zero-config database" },
  { name: "Postmark", note: "Transactional email with delivery tracking" },
  { name: "Tailwind CSS", note: "Utility-first styling throughout" },
];

/* ── Page ── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e8e8e8] selection:bg-[#c8ff00]/20 selection:text-[#c8ff00]">
      {/* ── Header ── */}
      <header className="border-b border-[#1a1a1a]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-mono text-sm font-bold tracking-tight text-[#e8e8e8] no-underline"
          >
            ContentDrip
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="font-mono text-sm text-[#666] no-underline transition-colors hover:text-[#e8e8e8]"
            >
              docs
            </Link>
            <Link
              href="/example"
              className="font-mono text-sm text-[#666] no-underline transition-colors hover:text-[#e8e8e8]"
            >
              example
            </Link>
            <a
              href="https://github.com/petergombos/content-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#666] no-underline transition-colors hover:text-[#e8e8e8]"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative border-b border-[#1a1a1a]">
        <div className="absolute inset-0 bg-grid-dark" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-32 md:pt-28">
          <p className="animate-fade-in-up font-mono text-[13px] uppercase tracking-[0.3em] text-[#c8ff00]">
            Open Source
          </p>

          <h1 className="animate-fade-in-up delay-1 mt-6 max-w-4xl text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[1.02] tracking-tighter">
            Ship email courses
            <br />
            from <span className="text-[#c8ff00]">markdown</span>.
          </h1>

          <p className="animate-fade-in-up delay-2 mt-6 max-w-xl font-mono text-base leading-relaxed text-[#777]">
            ContentDrip is an open-source Next.js template for building
            automated email drip courses. You write content in markdown, define a
            delivery schedule, and subscribers receive one lesson at a time — at
            the hour they choose, in their timezone.
          </p>

          {/* Terminal */}
          <div className="animate-fade-in-up delay-3 mt-10 max-w-lg border border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#333]" />
              <span className="h-2 w-2 rounded-full bg-[#333]" />
              <span className="h-2 w-2 rounded-full bg-[#333]" />
              <span className="ml-auto font-mono text-xs text-[#333]">
                terminal
              </span>
            </div>
            <div className="p-4 font-mono text-[15px] leading-loose">
              <p>
                <span className="text-[#c8ff00]">$</span>{" "}
                <span className="text-[#999]">
                  git clone content-drip my-course
                </span>
              </p>
              <p>
                <span className="text-[#c8ff00]">$</span>{" "}
                <span className="text-[#999]">
                  cd my-course && npm install
                </span>
              </p>
              <p>
                <span className="text-[#c8ff00]">$</span>{" "}
                <span className="text-[#999]">npm run dev</span>
              </p>
              <p className="text-[#444]">
                ▸ Ready on localhost:3000
                <span className="animate-cursor-blink ml-0.5 inline-block h-3.5 w-[7px] translate-y-[3px] bg-[#c8ff00]" />
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-4 mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="group inline-flex h-9 items-center gap-2 bg-[#c8ff00] px-4 font-mono text-[13px] font-bold uppercase tracking-widest text-[#050505] no-underline transition-colors hover:bg-[#d8ff44]"
            >
              Get Started
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/example"
              className="inline-flex h-9 items-center border border-[#333] px-4 font-mono text-[13px] font-bold uppercase tracking-widest text-[#777] no-underline transition-colors hover:border-[#555] hover:text-[#e8e8e8]"
            >
              View Example
            </Link>
          </div>

          <p className="animate-fade-in-up delay-5 mt-6 font-mono text-xs uppercase tracking-widest text-[#333]">
            MIT Licensed &middot; Self-Hosted &middot; No Vendor Lock-In
          </p>
        </div>
      </section>

      {/* ── The Drip Flow ── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#444]">
            The Drip Flow
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            What happens after someone subscribes
          </h2>
          <p className="mt-3 max-w-xl font-mono text-base leading-relaxed text-[#555]">
            Every subscription follows the same lifecycle. No configuration
            needed — this is how ContentDrip works out of the box.
          </p>

          <div className="mt-10 border border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="border-b border-[#1a1a1a] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#444]">
              subscription lifecycle
            </div>
            <div className="p-5 font-mono text-[13px] leading-[2.2] text-[#666] md:p-6">
              <p>
                <span className="text-[#c8ff00]">01</span>{" "}
                <span className="text-[#999]">subscribe</span>
                <span className="text-[#333]">
                  {" "}
                  ── visitor enters email + preferred delivery time
                </span>
              </p>
              <p>
                <span className="text-[#c8ff00]">02</span>{" "}
                <span className="text-[#999]">confirm</span>
                <span className="text-[#333]">
                  {" "}
                  ─── signed token email → click to activate
                </span>
              </p>
              <p>
                <span className="text-[#c8ff00]">03</span>{" "}
                <span className="text-[#999]">welcome</span>
                <span className="text-[#333]">
                  {" "}
                  ─── step 0 sent immediately on confirmation
                </span>
              </p>
              <p>
                <span className="text-[#c8ff00]">04</span>{" "}
                <span className="text-[#999]">drip</span>
                <span className="text-[#333]">
                  {" "}
                  ──── one lesson per day at the chosen time & timezone
                </span>
              </p>
              <p>
                <span className="text-[#c8ff00]">05</span>{" "}
                <span className="text-[#999]">complete</span>
                <span className="text-[#333]">
                  {" "}
                  ── subscription marked as completed after final step
                </span>
              </p>
              <p className="mt-3 border-t border-[#1a1a1a] pt-3 text-[#444]">
                <span className="text-[#666]">
                  at any point: pause ──→ resume exactly where they left off
                </span>
              </p>
              <p className="text-[#444]">
                <span className="text-[#666]">
                  at any point: unsubscribe ──→ one-click, signed link, instant
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-px bg-[#1a1a1a] p-px sm:grid-cols-3">
            {[
              {
                label: "Signed Tokens",
                desc: "Every action link (confirm, manage, pause, stop) uses a cryptographically signed, single-use token. No passwords, no sessions.",
              },
              {
                label: "Idempotent Delivery",
                desc: "The send log tracks every email sent. If the cron job runs twice, the same step is never sent again. Safe to retry, safe to overlap.",
              },
              {
                label: "Status Machine",
                desc: "Subscriptions move through PENDING_CONFIRM → ACTIVE → PAUSED → COMPLETED or STOPPED. Every transition is logged and auditable.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-[#050505] p-5">
                <p className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#c8ff00]">
                  {item.label}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#777]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#444]">
              Features
            </p>
            <p className="hidden font-mono text-[13px] text-[#333] sm:block">
              {FEATURES.length} built-in
            </p>
          </div>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need, nothing you don&apos;t.
          </h2>

          <div className="mt-10 grid gap-px bg-[#1a1a1a] p-px sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-[#050505] p-5 md:p-6">
                <p className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#c8ff00]">
                  {f.label}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#777]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#444]">
            How It Works
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
            From repo to running course in four steps.
          </h2>

          <div className="mt-10 grid gap-px bg-[#1a1a1a] p-px sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#050505] p-5 md:p-6">
                <span className="font-mono text-[13px] text-[#c8ff00]/40">
                  {s.n}
                </span>
                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#777]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Packs ── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#444]">
            Content Packs
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
            Markdown in, emails out.
          </h2>
          <p className="mt-3 max-w-xl font-mono text-base leading-relaxed text-[#555]">
            A content pack is a folder. Inside: a config file, an email
            template, and markdown files for each lesson. ContentDrip reads the
            markdown, replaces template variables with signed subscriber URLs,
            renders it through your EmailShell, and sends it via Postmark.
          </p>

          {/* Three-panel code view */}
          <div className="mt-10 grid gap-px bg-[#1a1a1a] p-px lg:grid-cols-3">
            {/* Directory tree */}
            <div className="bg-[#050505]">
              <div className="border-b border-[#1a1a1a] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#444]">
                structure
              </div>
              <pre className="p-5 font-mono text-[13px] leading-[1.9] text-[#666]">
                {`src/content-packs/
└── my-course/
    ├── pack.ts
    ├── email-shell.tsx
    ├── emails/
    │   ├── welcome.md
    │   ├── day-1.md
    │   ├── day-2.md
    │   └── day-3.md
    └── pages/
        ├── welcome.md
        ├── day-1.md
        └── day-2.md`}
              </pre>
            </div>

            {/* Pack config */}
            <div className="bg-[#050505]">
              <div className="border-b border-[#1a1a1a] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#444]">
                pack.ts
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.9] text-[#666]">
                <code>{`const pack: ContentPack = {
  key: "my-course",
  name: "My Email Course",
  description: "...",
  steps: [
    { slug: "welcome",
      emailFile: "welcome.md" },
    { slug: "day-1",
      emailFile: "day-1.md" },
    { slug: "day-2",
      emailFile: "day-2.md" },
    { slug: "day-3",
      emailFile: "day-3.md" },
  ],
  EmailShell: MyShell,
};

registerPack(pack);`}</code>
              </pre>
            </div>

            {/* Email markdown */}
            <div className="bg-[#050505]">
              <div className="border-b border-[#1a1a1a] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#444]">
                emails/day-1.md
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.9] text-[#666]">
                <code>{`---
subject: "Day 1: Getting
  Started"
preview: "Your first
  lesson awaits"
---

Good morning!

Today we're covering...

![hero](https://...)

## The Key Idea

Content goes here in
standard **markdown**.

[Read online →](
  {{companionUrl}}
)`}</code>
              </pre>
            </div>
          </div>

          {/* Template variables */}
          <div className="mt-6 grid gap-px bg-[#1a1a1a] p-px sm:grid-cols-2 lg:grid-cols-4">
            {[
              { var: "{{companionUrl}}", desc: "Web version of this lesson" },
              { var: "{{manageUrl}}", desc: "Manage subscription page" },
              { var: "{{pauseUrl}}", desc: "Pause delivery one-click" },
              { var: "{{stopUrl}}", desc: "Unsubscribe one-click" },
            ].map((v) => (
              <div key={v.var} className="bg-[#050505] p-4">
                <code className="font-mono text-[13px] text-[#c8ff00]">
                  {v.var}
                </code>
                <p className="mt-1 text-[13px] text-[#555]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#444]">
            Stack
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
            Tools you already know.
          </h2>

          <div className="mt-10 grid gap-px bg-[#1a1a1a] p-px sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map((tech) => (
              <div key={tech.name} className="bg-[#050505] p-5">
                <p className="text-base font-bold tracking-tight">{tech.name}</p>
                <p className="mt-1 font-mono text-[13px] text-[#555]">
                  {tech.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Start building.
          </h2>
          <p className="mt-4 max-w-lg font-mono text-base leading-relaxed text-[#777]">
            Clone the repo, create a content pack in markdown, deploy to Vercel,
            and your subscribers start learning. The whole setup takes minutes,
            not weeks. Read the docs or explore the live example.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="group inline-flex h-9 items-center gap-2 bg-[#c8ff00] px-4 font-mono text-[13px] font-bold uppercase tracking-widest text-[#050505] no-underline transition-colors hover:bg-[#d8ff44]"
            >
              Read the Docs
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/example"
              className="inline-flex h-9 items-center border border-[#333] px-4 font-mono text-[13px] font-bold uppercase tracking-widest text-[#777] no-underline transition-colors hover:border-[#555] hover:text-[#e8e8e8]"
            >
              See a Live Example
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[13px] text-[#333]">
            &copy; {new Date().getFullYear()} ContentDrip
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="font-mono text-[13px] text-[#444] no-underline transition-colors hover:text-[#888]"
            >
              docs
            </Link>
            <Link
              href="/example"
              className="font-mono text-[13px] text-[#444] no-underline transition-colors hover:text-[#888]"
            >
              example
            </Link>
            <Link
              href="/manage"
              className="font-mono text-[13px] text-[#444] no-underline transition-colors hover:text-[#888]"
            >
              manage
            </Link>
            <a
              href="https://github.com/petergombos/content-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[13px] text-[#444] no-underline transition-colors hover:text-[#888]"
            >
              github
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

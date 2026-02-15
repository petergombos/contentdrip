import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "./code-block";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to set up and customize ContentDrip — the open-source email drip course template.",
};

/* ── Helper Components ── */

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-[#111] px-1.5 py-0.5 font-mono text-[13px] text-[#c8ff00]">
      {children}
    </code>
  );
}


function H2({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-20 text-2xl font-bold tracking-tight text-[#e8e8e8] md:text-3xl"
    >
      {children}
    </h2>
  );
}

function H3({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="scroll-mt-20 text-lg font-bold tracking-tight text-[#e8e8e8]"
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] leading-[1.8] text-[#999]">{children}</p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#e8e8e8]">{children}</strong>;
}

/* ── Sidebar Navigation Data ── */

const NAV = [
  {
    category: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick Start" },
      { id: "project-structure", label: "Project Structure" },
    ],
  },
  {
    category: "Core Concepts",
    items: [
      { id: "content-packs", label: "Content Packs" },
      { id: "subscriber-flow", label: "Subscriber Flow" },
      { id: "scheduling", label: "Scheduling & Delivery" },
      { id: "scheduling-fanout", label: "Fan-Out Dispatch" },
      { id: "email-adapters", label: "Email Adapters" },
      { id: "email-templates", label: "Email Templates" },
    ],
  },
  {
    category: "Guides",
    items: [
      { id: "creating-a-pack", label: "Creating a Pack" },
      { id: "custom-branding", label: "Custom Email Branding" },
      { id: "markdown-format", label: "Markdown & Frontmatter" },
      { id: "placeholders", label: "Placeholder Variables" },
      { id: "multiple-packs", label: "Multiple Packs" },
    ],
  },
  {
    category: "Reference",
    items: [
      { id: "env-variables", label: "Environment Variables" },
      { id: "database-schema", label: "Database Schema" },
      { id: "api-routes", label: "API Routes" },
      { id: "deployment", label: "Deployment" },
    ],
  },
];

/* ── Page ── */

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e8e8e8] selection:bg-[#c8ff00]/20 selection:text-[#c8ff00]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <Link
            href="/"
            className="font-mono text-sm font-bold tracking-tight text-[#e8e8e8] no-underline"
          >
            ContentDrip
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="font-mono text-sm text-[#e8e8e8] no-underline"
            >
              docs
            </Link>
            <Link
              href="/mindful-productivity"
              className="font-mono text-sm text-[#666] no-underline transition-colors hover:text-[#e8e8e8]"
            >
              demo
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

      <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-[240px_1fr]">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden border-r border-[#1a1a1a] lg:block">
          <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-5 py-8">
            {NAV.map((group) => (
              <div key={group.category} className="mb-6">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#555]">
                  {group.category}
                </p>
                <ul className="mt-2.5 space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block py-1 font-mono text-[13px] text-[#777] no-underline transition-colors hover:text-[#c8ff00]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="min-w-0 px-6 py-10 md:px-10 md:py-14 lg:px-16">
          {/* Mobile TOC */}
          <details className="mb-10 border border-[#1a1a1a] lg:hidden">
            <summary className="cursor-pointer px-4 py-3 font-mono text-[13px] font-bold uppercase tracking-widest text-[#666]">
              Table of Contents
            </summary>
            <div className="border-t border-[#1a1a1a] px-4 py-4">
              {NAV.map((group) => (
                <div key={group.category} className="mb-4 last:mb-0">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#555]">
                    {group.category}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block py-0.5 font-mono text-[13px] text-[#777] no-underline transition-colors hover:text-[#c8ff00]"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>

          {/* Page title */}
          <div className="mb-14 border-b border-[#1a1a1a] pb-10">
            <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#c8ff00]">
              Documentation
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              ContentDrip Docs
            </h1>
            <p className="mt-3 max-w-xl font-mono text-base leading-relaxed text-[#777]">
              Everything you need to set up, customize, and deploy your own
              email drip courses.
            </p>
          </div>

          <div className="max-w-3xl space-y-20">
            {/* ══════════════════════════════════════════════════════════════
                GETTING STARTED
            ══════════════════════════════════════════════════════════════ */}

            {/* ── Introduction ── */}
            <section className="space-y-4">
              <H2 id="introduction">Introduction</H2>
              <P>
                ContentDrip is an open-source Next.js template for building
                automated email drip courses. You clone the repository, write
                your course content in markdown, define a delivery schedule, and
                deploy. ContentDrip handles everything else: subscriber
                management, scheduled delivery with timezone support, companion
                web pages, custom email branding, pause/resume, and one-click
                unsubscribe.
              </P>
              <P>
                The entire content model is based on{" "}
                <Strong>Content Packs</Strong> — self-contained folders of
                markdown files with a config and an email template. Each pack is
                an independent course that can have its own branding, schedule,
                and subscriber base. You can run one pack or many from the same
                deployment.
              </P>
              <P>
                ContentDrip is built for developers and creators who want full
                control over their email courses without relying on third-party
                platforms. There&apos;s no vendor lock-in, no monthly fees, and
                no limits on subscribers or emails beyond what your
                infrastructure supports.
              </P>
            </section>

            {/* ── Quick Start ── */}
            <section className="space-y-4">
              <H2 id="quick-start">Quick Start</H2>
              <P>Get a local development instance running in five steps.</P>

              <H3 id="qs-clone">1. Clone the repository</H3>
              <CodeBlock label="terminal">{`git clone https://github.com/petergombos/content-drip.git
cd content-drip`}</CodeBlock>

              <H3 id="qs-install">2. Install dependencies</H3>
              <CodeBlock label="terminal">{`npm install`}</CodeBlock>

              <H3 id="qs-env">3. Configure environment variables</H3>
              <P>
                Create a <Code>.env</Code> file in the project root. You need a
                Turso database, an email provider (<Strong>Resend</Strong> or{" "}
                <Strong>Postmark</Strong>), and a secret for cron
                authentication.
              </P>
              <CodeBlock label=".env">{`# Database — Turso (LibSQL)
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Email — pick ONE provider:

# Option A: Resend
RESEND_API_KEY=re_your-api-key
MAIL_FROM=you@yourdomain.com

# Option B: Postmark
# POSTMARK_SERVER_TOKEN=your-postmark-server-token
# POSTMARK_MESSAGE_STREAM=content-emails
# MAIL_FROM=you@yourdomain.com

# Cron — authenticates the /api/cron endpoint
CRON_SECRET=generate-another-random-string

# Optional — speed up delivery for local testing
# Makes 1 day = 10 minutes (24*60 / 144 = 10)
# DRIP_TIME_SCALE=144`}</CodeBlock>
              <P>
                If <Code>RESEND_API_KEY</Code> is set, ContentDrip uses Resend.
                Otherwise it falls back to Postmark. Only one provider is needed.
              </P>

              <H3 id="qs-db">4. Push the database schema</H3>
              <P>
                ContentDrip uses Drizzle ORM with SQLite (via Turso). Push the
                schema to create the required tables:
              </P>
              <CodeBlock label="terminal">{`npx drizzle-kit push`}</CodeBlock>

              <H3 id="qs-run">5. Start the dev server</H3>
              <CodeBlock label="terminal">{`npm run dev`}</CodeBlock>
              <P>
                Visit <Code>http://localhost:3000/mindful-productivity</Code> to see the
                example content pack landing page. The subscribe form is fully
                functional — try subscribing with a test email to see the full
                flow.
              </P>
            </section>

            {/* ── Project Structure ── */}
            <section className="space-y-4">
              <H2 id="project-structure">Project Structure</H2>
              <P>
                ContentDrip is a standard Next.js App Router project. Here are
                the key directories:
              </P>
              <CodeBlock label="project root">{`src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Marketing homepage
│   ├── mindful-productivity/  # Example content pack landing
│   ├── deep-work/            # Example content pack landing
│   ├── docs/page.tsx         # This documentation page
│   ├── manage/               # Subscription management
│   ├── confirm/[token]/      # Email confirmation handler
│   ├── p/[packKey]/[slug]/   # Companion pages
│   └── api/
│       ├── subscribe/        # Subscription creation
│       ├── cron/             # Dispatch: schedules email delivery
│       ├── send-batch/       # Worker: processes a batch of subscriptions
│       ├── pause/            # Pause/stop from email links
│       └── stop/             # Unsubscribe from email links
├── content-packs/            # Your courses live here
│   ├── registry.ts           # ContentPack type definitions
│   ├── index.ts              # Barrel file (imports all packs)
│   └── mindful-productivity/ # Example pack (delete or modify)
├── components/               # Shared UI components
├── domains/                  # Business logic
│   └── subscriptions/
│       ├── actions/          # Server actions
│       ├── services/         # SchedulerService, etc.
│       └── repos/            # Database queries
├── db/                       # Drizzle schema and config
└── lib/                      # Shared utilities`}</CodeBlock>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CORE CONCEPTS
            ══════════════════════════════════════════════════════════════ */}

            {/* ── Content Packs ── */}
            <section className="space-y-4">
              <H2 id="content-packs">Content Packs</H2>
              <P>
                A <Strong>Content Pack</Strong> is the core abstraction in
                ContentDrip. It&apos;s a self-contained course: a collection of
                markdown emails and optional companion pages, bundled with
                metadata and an email template. Every pack implements the{" "}
                <Code>ContentPack</Code> interface:
              </P>
              <CodeBlock label="ContentPack interface">{`interface ContentPack {
  key: string;                // Unique identifier, used in URLs and DB
  name: string;               // Display name shown to subscribers
  description: string;        // Short description for landing pages
  steps: ContentStep[];       // Ordered list of lessons
  EmailShell?: Component;     // Optional custom email template
}

interface ContentStep {
  slug: string;               // URL-safe identifier (e.g. "day-1")
  emailFile: string;          // Markdown file in emails/ directory
  pageFile?: string;          // Markdown file in pages/ (defaults to emailFile)
}`}</CodeBlock>
              <P>
                The <Code>key</Code> is used throughout the system: in database
                records, URL paths (<Code>/p/your-key/day-1</Code>), email tags,
                and the pack registry. Choose something URL-safe and
                descriptive.
              </P>
              <P>
                The <Code>steps</Code> array defines the delivery order. Step 0
                is the welcome email (sent immediately on confirmation).
                Subsequent steps are sent one per day at the subscriber&apos;s
                chosen time. Each step maps to a markdown file in your
                pack&apos;s <Code>emails/</Code> directory.
              </P>
              <P>
                The optional <Code>EmailShell</Code> is a React Email component
                that wraps every outgoing email in your pack&apos;s custom
                branding — header, footer, typography, colors. If omitted, a
                default shell is used.
              </P>
            </section>

            {/* ── Subscriber Flow ── */}
            <section className="space-y-4">
              <H2 id="subscriber-flow">Subscriber Flow</H2>
              <P>
                Every subscription follows a predictable lifecycle managed by
                status transitions in the database:
              </P>
              <CodeBlock label="subscription lifecycle">{`PENDING_CONFIRM ──→ ACTIVE ──→ COMPLETED
                      │
                      ├──→ PAUSED ──→ ACTIVE (resume)
                      │
                      └──→ STOPPED (unsubscribed)`}</CodeBlock>
              <P>
                <Strong>Subscribe:</Strong> A visitor fills in the form with
                their email and preferred delivery time. The timezone is
                auto-detected from the browser. A subscription record is created
                with status <Code>PENDING_CONFIRM</Code> and a signed
                confirmation token is emailed.
              </P>
              <P>
                <Strong>Confirm:</Strong> The subscriber clicks the confirmation
                link. The token hash is verified against the database. If valid,
                the subscription status changes to <Code>ACTIVE</Code> and the
                welcome email (step 0) is sent immediately.
              </P>
              <P>
                <Strong>Drip Delivery:</Strong> A cron job hits{" "}
                <Code>/api/cron</Code> every minute. The scheduler evaluates
                each active subscription: is the next step due based on the
                subscriber&apos;s chosen time and timezone? If yes, it loads the
                markdown, replaces placeholder variables with signed URLs,
                renders through the EmailShell, and sends via your configured email adapter.
              </P>
              <P>
                <Strong>Pause / Resume:</Strong> Subscribers can pause delivery
                at any time via a signed link in any email. The status changes to{" "}
                <Code>PAUSED</Code>. The scheduler skips paused subscriptions.
                When resumed (via the manage page), delivery continues from the
                next unsent step.
              </P>
              <P>
                <Strong>Completion:</Strong> After the final step is sent, the
                subscription status changes to <Code>COMPLETED</Code>. No
                further emails are sent.
              </P>
              <P>
                <Strong>Unsubscribe:</Strong> The one-click unsubscribe link
                sets the status to <Code>STOPPED</Code>. This is immediate and
                irreversible (the subscriber can re-subscribe manually if they
                want to start over).
              </P>
              <P>
                All action links (confirm, manage, pause, stop) use
                cryptographically signed, single-use tokens. No passwords or
                sessions are required. Tokens are hashed with SHA-256 before
                storage and verified on use.
              </P>
            </section>

            {/* ── Scheduling ── */}
            <section className="space-y-4">
              <H2 id="scheduling">Scheduling &amp; Delivery</H2>
              <P>
                Email delivery is driven by a cron job that calls the{" "}
                <Code>/api/cron</Code> endpoint. The endpoint authenticates via
                the <Code>CRON_SECRET</Code> environment variable and delegates
                to the <Code>SchedulerService</Code>.
              </P>
              <H3 id="scheduling-normal">Normal Mode</H3>
              <P>
                In production, the scheduler evaluates cron expressions. When a
                subscriber signs up and chooses &quot;8am&quot;, a cron
                expression like <Code>0 8 * * *</Code> is stored along with
                their timezone (e.g., <Code>America/New_York</Code>). Each
                minute, the scheduler parses the expression in the
                subscriber&apos;s timezone using{" "}
                <Code>cron-parser</Code> and checks if the current
                time falls within the last 60 seconds of the scheduled time.
              </P>
              <H3 id="scheduling-fast">Fast-Test Mode</H3>
              <P>
                For local development and testing, you don&apos;t want to wait
                24 hours between emails. Set{" "}
                <Code>DRIP_TIME_SCALE</Code> to speed up delivery:
              </P>
              <CodeBlock label="fast-test examples">{`# 1 day becomes 10 minutes (144x speed)
DRIP_TIME_SCALE=144

# 1 day becomes 1 minute (1440x speed)
DRIP_TIME_SCALE=1440
`}</CodeBlock>
              <P>
                In fast-test mode, the scheduler ignores cron expressions
                entirely and instead checks how many minutes have elapsed since
                the last email was sent. If enough time has passed (based on the
                scale factor), the next step is sent.
              </P>
              <H3 id="scheduling-idempotency">Idempotency</H3>
              <P>
                Every email sent is logged in the <Code>sendLog</Code> table
                with the subscription ID, pack key, and step slug. Before
                sending, the scheduler checks if the current step has already
                been logged. This prevents duplicate deliveries if the cron job
                runs multiple times within the same minute or if there are
                retries.
              </P>
              <H3 id="scheduling-fanout">Fan-Out Dispatch</H3>
              <P>
                To scale beyond what a single serverless function can handle
                within its timeout window (60s hobby / 300s pro on Vercel),
                ContentDrip uses a fan-out dispatch architecture. The cron
                endpoint acts as a lightweight dispatcher:
              </P>
              <CodeBlock label="dispatch flow">{`GET /api/cron (dispatcher)
  → queries active subscription IDs (SELECT id only)
  → ≤25 subs: processes locally (zero overhead)
  → >25 subs: chunks into batches of 25,
    fires parallel POST /api/send-batch workers,
    aggregates results via Promise.allSettled`}</CodeBlock>
              <P>
                The dispatcher captures a shared <Code>now</Code> timestamp and
                passes it to all workers. This ensures consistent cron
                due-checking across the same minute window, regardless of when
                each worker starts executing. Each worker lambda handles at most
                25 subscriptions, processing them in sub-batches of 5 with{" "}
                <Code>Promise.allSettled</Code> for failure isolation.
              </P>
              <P>
                For small deployments (up to 25 active subscribers), the
                dispatcher processes everything in-process with no self-invoke
                overhead. The fan-out path only activates when needed.
              </P>
              <H3 id="scheduling-retries">Retry Logic</H3>
              <P>
                The cron endpoint implements automatic retries for Turso database
                capacity errors (503). It will retry up to 3 times with
                exponential backoff (500ms, 1500ms). Other errors are returned
                immediately.
              </P>
            </section>

            {/* ── Email Adapters ── */}
            <section className="space-y-4">
              <H2 id="email-adapters">Email Adapters</H2>
              <P>
                ContentDrip uses a pluggable adapter pattern for sending emails.
                Two adapters ship out of the box:{" "}
                <Strong>Resend</Strong> and <Strong>Postmark</Strong>. The
                active adapter is determined automatically from your environment
                variables — if <Code>RESEND_API_KEY</Code> is set, Resend is
                used. Otherwise, it falls back to Postmark.
              </P>
              <H3 id="adapters-interface">The MailAdapter interface</H3>
              <P>
                Every adapter implements a single <Code>send</Code> method.
                This is the entire contract:
              </P>
              <CodeBlock label="src/domains/mail/ports/mail-adapter.ts">{`interface MailAdapter {
  send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    tag?: string;
    headers?: Record<string, string>;
  }): Promise<{ providerMessageId?: string }>;
}`}</CodeBlock>
              <H3 id="adapters-custom">Building a custom adapter</H3>
              <P>
                To use a different email provider (SendGrid, AWS SES,
                Mailgun, etc.), create a class that implements{" "}
                <Code>MailAdapter</Code> and wire it up in{" "}
                <Code>src/domains/mail/create-adapter.ts</Code>:
              </P>
              <CodeBlock label="example: custom adapter">{`import type { MailAdapter } from "../ports/mail-adapter";

export class MyCustomAdapter implements MailAdapter {
  async send(options) {
    // Call your provider's API here
    const result = await myProvider.sendEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { providerMessageId: result.id };
  }
}`}</CodeBlock>
              <P>
                Then update <Code>create-adapter.ts</Code> to return your
                adapter based on an environment variable. That&apos;s it — no
                other changes needed. The rest of the system (scheduler,
                send log, retry logic) works the same regardless of which
                adapter is active.
              </P>
            </section>

            {/* ── Email Templates ── */}
            <section className="space-y-4">
              <H2 id="email-templates">Email Templates</H2>
              <P>
                ContentDrip uses <Strong>React Email</Strong> for rendering
                email templates. Each content pack defines an{" "}
                <Code>EmailShell</Code> component that wraps the rendered
                markdown content. The rendering pipeline is:
              </P>
              <CodeBlock label="rendering pipeline">{`1. Load markdown file from emails/{step}.md
2. Parse YAML frontmatter → { subject, preview }
3. Replace placeholders → {{companionUrl}}, {{manageUrl}}, etc.
4. Convert markdown → HTML (via gray-matter + markdown parser)
5. Wrap HTML in pack's EmailShell (React Email component)
6. Render React Email → final HTML string
7. Send via configured email adapter (Postmark, Resend, or custom)`}</CodeBlock>
              <P>
                The <Code>EmailShell</Code> component receives{" "}
                <Code>PackEmailShellProps</Code>:
              </P>
              <CodeBlock label="PackEmailShellProps">{`interface PackEmailShellProps {
  preview?: string;           // Email preview text (inbox snippet)
  title: string;              // Email subject line
  children: React.ReactNode;  // Rendered markdown HTML content
  footer?: {
    unsubscribeUrl?: string;  // One-click unsubscribe link
    manageUrl?: string;       // Manage preferences link
    pauseUrl?: string;        // Pause delivery link
  };
}`}</CodeBlock>
              <P>
                Use <Code>@react-email/components</Code> (Html, Head, Body,
                Container, Section, Text, Link, Img, etc.) to build your shell.
                These components generate cross-client-compatible HTML. See the
                example pack&apos;s <Code>email-shell.tsx</Code> for a complete
                working implementation.
              </P>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                GUIDES
            ══════════════════════════════════════════════════════════════ */}

            {/* ── Creating a Pack ── */}
            <section className="space-y-4">
              <H2 id="creating-a-pack">Creating a Content Pack</H2>
              <P>
                Follow these steps to create a new content pack from scratch.
                You can also copy and modify the example{" "}
                <Code>mindful-productivity</Code> pack as a starting point.
              </P>

              <H3 id="cap-directory">1. Create the directory structure</H3>
              <CodeBlock label="terminal">{`mkdir -p src/content-packs/my-course/emails
mkdir -p src/content-packs/my-course/pages`}</CodeBlock>

              <H3 id="cap-pack">2. Define your pack configuration</H3>
              <CodeBlock label="src/content-packs/my-course/pack.ts">{`import { registerPack, type ContentPack } from "../registry";
import { MyEmailShell } from "./email-shell";

const pack: ContentPack = {
  key: "my-course",
  name: "My Email Course",
  description: "A 5-day course on building better habits.",
  steps: [
    { slug: "welcome", emailFile: "welcome.md" },
    { slug: "day-1",   emailFile: "day-1.md" },
    { slug: "day-2",   emailFile: "day-2.md" },
    { slug: "day-3",   emailFile: "day-3.md" },
    { slug: "day-4",   emailFile: "day-4.md" },
    { slug: "day-5",   emailFile: "day-5.md" },
  ],
  EmailShell: MyEmailShell,
};

registerPack(pack);`}</CodeBlock>

              <H3 id="cap-emails">3. Write your email content</H3>
              <P>
                Create a markdown file for each step in <Code>emails/</Code>.
                Each file needs YAML frontmatter with a <Code>subject</Code> and
                optional <Code>preview</Code>:
              </P>
              <CodeBlock label="src/content-packs/my-course/emails/welcome.md">{`---
subject: Welcome to My Email Course
preview: Your journey starts tomorrow morning
---

Hi there!

Welcome to **My Email Course**. Over the next five days, you'll receive
one lesson each morning at the time you chose.

## What to Expect

- **Day 1:** Topic one
- **Day 2:** Topic two
- **Day 3:** Topic three

[Read this lesson online →]({{companionUrl}})`}</CodeBlock>

              <H3 id="cap-pages">4. Create companion pages (optional)</H3>
              <P>
                Companion pages are web-readable versions of each email. Create
                markdown files in <Code>pages/</Code> with the same slugs. If
                you omit a page file, the email markdown is used as fallback.
                Pages can have different content (e.g., larger images, extra
                context).
              </P>

              <H3 id="cap-shell">5. Build an email template</H3>
              <P>
                Create an <Code>email-shell.tsx</Code> using React Email
                components. See the{" "}
                <a
                  href="#custom-branding"
                  className="text-[#c8ff00] no-underline hover:underline"
                >
                  Custom Email Branding
                </a>{" "}
                section below for details.
              </P>

              <H3 id="cap-register">6. Register the pack</H3>
              <P>
                Add an import to the barrel file so ContentDrip discovers your
                pack:
              </P>
              <CodeBlock label="src/content-packs/index.ts">{`import "@/content-packs/mindful-productivity/pack"; // Example pack
import "@/content-packs/my-course/pack";             // Your new pack`}</CodeBlock>
            </section>

            {/* ── Custom Branding ── */}
            <section className="space-y-4">
              <H2 id="custom-branding">Custom Email Branding</H2>
              <P>
                The <Code>EmailShell</Code> is a React Email component that
                wraps every outgoing email for a pack. It controls the header,
                footer, typography, colors, and layout. Here&apos;s a minimal
                example:
              </P>
              <CodeBlock label="email-shell.tsx (minimal)">{`import {
  Html, Head, Body, Container, Section,
  Text, Link, Hr, Preview,
} from "@react-email/components";
import type { PackEmailShellProps } from "../registry";

export function MyEmailShell(props: PackEmailShellProps) {
  return (
    <Html>
      <Head />
      {props.preview && <Preview>{props.preview}</Preview>}
      <Body style={{ background: "#f9f9f9", fontFamily: "Georgia, serif" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 40 }}>

          {/* Header */}
          <Text style={{ fontSize: 12, color: "#999", letterSpacing: 2 }}>
            MY EMAIL COURSE
          </Text>

          {/* Title */}
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {props.title}
          </Text>

          <Hr />

          {/* Content — rendered markdown HTML goes here */}
          {props.children}

          <Hr />

          {/* Footer with action links */}
          <Section style={{ fontSize: 12, color: "#999" }}>
            {props.footer?.manageUrl && (
              <Link href={props.footer.manageUrl}>Manage preferences</Link>
            )}
            {" · "}
            {props.footer?.pauseUrl && (
              <Link href={props.footer.pauseUrl}>Pause delivery</Link>
            )}
            {" · "}
            {props.footer?.unsubscribeUrl && (
              <Link href={props.footer.unsubscribeUrl}>Unsubscribe</Link>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}`}</CodeBlock>
              <P>
                The <Code>children</Code> prop contains the rendered HTML from
                your markdown email. It&apos;s injected as a React node, so it
                flows naturally within your template. Use inline styles for
                reliable cross-client rendering — most email clients strip{" "}
                <Code>&lt;style&gt;</Code> tags, though some (like Gmail) do
                support them.
              </P>
              <P>
                Refer to the{" "}
                <Code>src/content-packs/mindful-productivity/email-shell.tsx</Code> file in the
                repository for a full production example with images, branded
                colors, and responsive layout.
              </P>
            </section>

            {/* ── Markdown Format ── */}
            <section className="space-y-4">
              <H2 id="markdown-format">Markdown &amp; Frontmatter</H2>
              <P>
                Email content is written in standard markdown with YAML
                frontmatter. ContentDrip uses{" "}
                <Code>gray-matter</Code> to parse the frontmatter and a markdown
                parser to convert the body to HTML.
              </P>
              <H3 id="mf-frontmatter">Frontmatter fields</H3>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[13px]">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-left">
                      <th className="pb-2 pr-6 text-[#c8ff00]">Field</th>
                      <th className="pb-2 pr-6 text-[#c8ff00]">Required</th>
                      <th className="pb-2 text-[#c8ff00]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    <tr>
                      <td className="py-2 pr-6 text-[#e8e8e8]">subject</td>
                      <td className="py-2 pr-6 text-[#777]">Yes</td>
                      <td className="py-2 text-[#777]">
                        Email subject line
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-6 text-[#e8e8e8]">preview</td>
                      <td className="py-2 pr-6 text-[#777]">No</td>
                      <td className="py-2 text-[#777]">
                        Preview text shown in email clients (inbox snippet)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <H3 id="mf-syntax">Supported syntax</H3>
              <P>
                Standard markdown: headings, bold, italic, links, images, lists,
                blockquotes, code blocks, and horizontal rules. Images are
                rendered as <Code>&lt;img&gt;</Code> tags in emails — use full
                absolute URLs for images (relative paths won&apos;t work in
                email clients).
              </P>
            </section>

            {/* ── Placeholders ── */}
            <section className="space-y-4">
              <H2 id="placeholders">Placeholder Variables</H2>
              <P>
                Use these placeholders in your markdown content. They&apos;re
                replaced at send time with signed, subscriber-specific URLs:
              </P>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[13px]">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-left">
                      <th className="pb-2 pr-6 text-[#c8ff00]">Variable</th>
                      <th className="pb-2 text-[#c8ff00]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {[
                      ["{{companionUrl}}", "Web-readable version of this specific lesson. Points to /p/{packKey}/{stepSlug}."],
                      ["{{manageUrl}}", "Manage subscription preferences page. Uses a signed single-use token for authentication."],
                      ["{{pauseUrl}}", "One-click pause delivery. Hits /api/pause with a signed token. Subscriber can resume later."],
                      ["{{stopUrl}}", "One-click unsubscribe. Hits /api/stop with a signed token. Immediately stops all delivery."],
                    ].map(([v, desc]) => (
                      <tr key={v}>
                        <td className="py-2 pr-6 whitespace-nowrap text-[#e8e8e8]">
                          {v}
                        </td>
                        <td className="py-2 text-[#777]">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <P>
                Example usage in markdown:
              </P>
              <CodeBlock label="emails/day-1.md (excerpt)">{`Can't read this email? [View it online]({{companionUrl}}).

---

[Manage preferences]({{manageUrl}}) · [Pause delivery]({{pauseUrl}}) · [Unsubscribe]({{stopUrl}})`}</CodeBlock>
            </section>

            {/* ── Multiple Packs ── */}
            <section className="space-y-4">
              <H2 id="multiple-packs">Multiple Packs</H2>
              <P>
                ContentDrip supports running multiple content packs from a
                single deployment. Each pack is fully independent — it has its
                own key, subscriber base, email branding, and delivery schedule.
              </P>
              <P>
                To add a new pack, create a new directory under{" "}
                <Code>src/content-packs/</Code>, define the pack and register
                it, then add the import to the barrel file. The subscribe form
                automatically picks up registered packs. Companion pages are
                namespaced by pack key (<Code>/p/pack-a/day-1</Code> vs{" "}
                <Code>/p/pack-b/day-1</Code>).
              </P>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                REFERENCE
            ══════════════════════════════════════════════════════════════ */}

            {/* ── Environment Variables ── */}
            <section className="space-y-4">
              <H2 id="env-variables">Environment Variables</H2>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[13px]">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-left">
                      <th className="pb-2 pr-4 text-[#c8ff00]">Variable</th>
                      <th className="pb-2 pr-4 text-[#c8ff00]">Req</th>
                      <th className="pb-2 text-[#c8ff00]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {[
                      ["TURSO_DATABASE_URL", "Yes", "LibSQL / Turso database connection URL"],
                      ["TURSO_AUTH_TOKEN", "Yes", "Database authentication token"],
                      ["RESEND_API_KEY", "No*", "Resend API key. If set, Resend is used as the email provider"],
                      ["POSTMARK_SERVER_TOKEN", "No*", "Postmark API key. Used when RESEND_API_KEY is not set"],
                      ["POSTMARK_MESSAGE_STREAM", "No", "Postmark message stream name (e.g. content-emails)"],
                      ["MAIL_FROM", "Yes", "Sender email address (must be verified with your email provider)"],
                      ["CRON_SECRET", "Yes", "Bearer token to authenticate /api/cron requests"],
                      ["DRIP_TIME_SCALE", "No", "Speed multiplier for testing. 144 = 1 day per 10 min. 1440 = 1 day per 1 min."],
                      ["VERCEL_ENV", "No", "Set automatically by Vercel. Enables preview-mode cron auth."],
                    ].map(([name, req, desc]) => (
                      <tr key={name}>
                        <td className="py-2 pr-4 whitespace-nowrap text-[#e8e8e8]">
                          {name}
                        </td>
                        <td className="py-2 pr-4 text-[#777]">{req}</td>
                        <td className="py-2 text-[#777]">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Database Schema ── */}
            <section className="space-y-4">
              <H2 id="database-schema">Database Schema</H2>
              <P>
                ContentDrip uses three tables managed by Drizzle ORM with SQLite
                (Turso). All IDs are text (UUIDs). Timestamps are stored as
                milliseconds.
              </P>
              <H3 id="db-subscriptions">subscriptions</H3>
              <P>Stores every subscriber and their delivery state.</P>
              <CodeBlock label="subscriptions table">{`id               text     PRIMARY KEY
email            text     subscriber email address
packKey          text     which content pack they subscribed to
timezone         text     IANA timezone (e.g. "Europe/London")
cronExpression   text     delivery schedule (e.g. "0 8 * * *")
status           text     PENDING_CONFIRM | ACTIVE | PAUSED | STOPPED | COMPLETED
currentStepIndex integer  which step to send next (starts at 0)
createdAt        integer  creation timestamp (ms)
updatedAt        integer  last update timestamp (ms)`}</CodeBlock>
              <H3 id="db-tokens">tokens</H3>
              <P>
                Signed tokens for confirm, manage, pause, and stop actions.
                Tokens are hashed (SHA-256) before storage and are single-use.
              </P>
              <CodeBlock label="tokens table">{`id               text     PRIMARY KEY
subscriptionId   text     FK → subscriptions (cascade delete)
tokenHash        text     SHA-256 hash of the token
tokenType        text     CONFIRM | MANAGE | PAUSE | STOP
expiresAt        integer  expiry timestamp (ms)
usedAt           integer  when the token was consumed (nullable)
createdAt        integer  creation timestamp (ms)`}</CodeBlock>
              <H3 id="db-sendlog">sendLog</H3>
              <P>
                Audit trail of every email sent. Used for idempotency checks and
                debugging delivery issues.
              </P>
              <CodeBlock label="sendLog table">{`id                text     PRIMARY KEY
subscriptionId    text     FK → subscriptions (cascade delete)
packKey           text     content pack key
stepSlug          text     which step was sent (e.g. "day-1")
provider          text     email provider used (e.g. "postmark")
providerMessageId text     provider's message ID (nullable)
status            text     SUCCESS | FAILED
sentAt            integer  when the email was sent (ms)
error             text     error message if failed (nullable)
createdAt         integer  creation timestamp (ms)`}</CodeBlock>
            </section>

            {/* ── API Routes ── */}
            <section className="space-y-4">
              <H2 id="api-routes">API Routes</H2>

              <H3 id="api-subscribe">POST /api/subscribe</H3>
              <P>
                Creates a new subscription. Called by the subscribe form via
                server action. Requires <Code>CRON_SECRET</Code> as a Bearer
                token in the Authorization header.
              </P>
              <CodeBlock label="request body">{`{
  "email": "user@example.com",
  "packKey": "my-course",
  "timezone": "America/New_York",
  "cronExpression": "0 8 * * *"
}`}</CodeBlock>

              <H3 id="api-cron">GET /api/cron</H3>
              <P>
                Triggers the email delivery dispatcher. Should be called every
                minute by a cron job. Authenticated via{" "}
                <Code>Authorization: Bearer {"{CRON_SECRET}"}</Code> header. In
                non-production Vercel environments, also accepts{" "}
                <Code>?secret={"{CRON_SECRET}"}</Code> as a query parameter. For
                small subscriber counts (&le;25), processes locally. For larger
                counts, fans out to parallel{" "}
                <Code>/api/send-batch</Code> workers.
              </P>
              <CodeBlock label="response (local mode)">{`{
  "success": true,
  "mode": "local",
  "sent": 3,
  "skipped": 12,
  "completed": 0,
  "errors": 0,
  "total": 15,
  "timestamp": "2025-01-15T08:00:00.000Z"
}`}</CodeBlock>
              <CodeBlock label="response (fan-out mode)">{`{
  "success": true,
  "mode": "fan-out",
  "batches": 4,
  "sent": 12,
  "skipped": 78,
  "completed": 1,
  "errors": 0,
  "total": 91,
  "failures": [],
  "workerFailures": [],
  "timestamp": "2025-01-15T08:00:00.000Z"
}`}</CodeBlock>

              <H3 id="api-send-batch">POST /api/send-batch</H3>
              <P>
                Internal worker endpoint called by the cron dispatcher during
                fan-out. Authenticated via{" "}
                <Code>Authorization: Bearer {"{CRON_SECRET}"}</Code>. Receives a
                batch of subscription IDs, a shared timestamp, and the
                fast-test step interval. Not intended to be called directly.
              </P>

              <H3 id="api-pause">GET /api/pause</H3>
              <P>
                Pauses or stops a subscription via signed token. Parameters:{" "}
                <Code>?token=...&id=...&action=pause|stop</Code>. Redirects to{" "}
                <Code>{"/manage/{token}?action=paused"}</Code> or{" "}
                <Code>{"/manage/{token}?action=unsubscribed"}</Code>.
              </P>

              <H3 id="api-stop">GET /api/stop</H3>
              <P>
                Unsubscribes via signed token. Parameters:{" "}
                <Code>?token=...&id=...</Code>. Redirects to{" "}
                <Code>{"/manage/{token}?action=unsubscribed"}</Code>.
              </P>

              <H3 id="api-confirm">GET /confirm/[token]</H3>
              <P>
                Confirmation page. The token is the raw (unhashed) confirmation
                token from the email link. The page hashes it, looks up the
                matching token record, and activates the subscription.
              </P>
            </section>

            {/* ── Deployment ── */}
            <section className="space-y-4">
              <H2 id="deployment">Deployment</H2>
              <H3 id="deploy-vercel">Vercel (recommended)</H3>
              <P>
                Push your repository to GitHub and import it in Vercel. Vercel
                auto-detects the Next.js project. Set all required environment
                variables in the Vercel dashboard. Add a{" "}
                <Code>vercel.json</Code> to configure the cron job:
              </P>
              <CodeBlock label="vercel.json">{`{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"
    }
  ]
}`}</CodeBlock>
              <P>
                This calls <Code>/api/cron</Code> every minute. Vercel
                automatically injects the <Code>CRON_SECRET</Code> as a Bearer
                token in the Authorization header for cron requests.
              </P>
              <H3 id="deploy-other">Other hosts</H3>
              <P>
                ContentDrip runs on any Node.js host that supports Next.js.
                You&apos;ll need to set up your own cron job (e.g., via{" "}
                <Code>crontab</Code>, AWS EventBridge, or a service like
                cron-job.org) to call <Code>/api/cron</Code> every minute with
                the correct Authorization header.
              </P>
              <CodeBlock label="external cron example">{`# crontab entry
* * * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron`}</CodeBlock>
            </section>

            {/* ── Back to top / CTA ── */}
            <div className="mt-20 border-t border-[#1a1a1a] pt-10">
              <p className="font-mono text-base text-[#777]">
                Ready to build?
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/mindful-productivity"
                  className="group inline-flex h-9 items-center gap-2 bg-[#c8ff00] px-4 font-mono text-[13px] font-bold uppercase tracking-widest text-[#050505] no-underline transition-colors hover:bg-[#d8ff44]"
                >
                  See the Demo
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#introduction"
                  className="inline-flex h-9 items-center border border-[#333] px-4 font-mono text-[13px] font-bold uppercase tracking-widest text-[#777] no-underline transition-colors hover:border-[#555] hover:text-[#e8e8e8]"
                >
                  Back to Top
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a1a1a]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[13px] text-[#333]">
            &copy; {new Date().getFullYear()} ContentDrip
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-[13px] text-[#444] no-underline transition-colors hover:text-[#888]"
            >
              home
            </Link>
            <Link
              href="/mindful-productivity"
              className="font-mono text-[13px] text-[#444] no-underline transition-colors hover:text-[#888]"
            >
              demo
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

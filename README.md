# ContentDrip

Open-source email drip course template built with Next.js. Write your content in markdown, define a delivery schedule, deploy — subscribers receive one lesson at a time, at the hour they choose, in their timezone.

**[Live Demo](https://contentdrip.dev/example)** · **[Documentation](https://contentdrip.dev/docs)**

## What it does

- **Content Packs** — each course is a self-contained folder of markdown emails, companion web pages, and a custom email template
- **Scheduled Delivery** — subscribers choose their delivery time; a cron job sends emails at the exact minute in their local timezone
- **Companion Pages** — every email has a web-readable version at `/p/{pack}/{step}`
- **Subscriber Management** — built-in manage page for updating preferences, pausing, or unsubscribing via signed token links
- **Pause & Resume** — subscribers pause with one click; when they resume, delivery continues where it left off
- **One-Click Unsubscribe** — signed, single-use links in every email. CAN-SPAM and GDPR compliant

## Quick Start

```bash
git clone https://github.com/petergombos/content-drip.git
cd content-drip
npm install
```

Create a `.env` file with one of the two email provider configs:

```env
# Database — Turso (LibSQL)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Email — pick ONE provider:

# Option A: Resend
RESEND_API_KEY=re_your-api-key
MAIL_FROM=you@yourdomain.com

# Option B: Postmark
# POSTMARK_SERVER_TOKEN=your-postmark-token
# POSTMARK_MESSAGE_STREAM=content-emails
# MAIL_FROM=you@yourdomain.com

# Cron authentication
CRON_SECRET=generate-a-random-string
```

Push the database schema and start:

```bash
npx drizzle-kit push
npm run dev
```

Visit `http://localhost:3000/example` to see the example content pack.

## Creating a Content Pack

A content pack is a folder under `src/content-packs/`:

```
src/content-packs/my-course/
├── pack.ts           # Pack config + registration
├── email-shell.tsx   # React Email template
├── emails/
│   ├── welcome.md
│   ├── day-1.md
│   └── day-2.md
└── pages/            # Optional companion pages
    ├── welcome.md
    └── day-1.md
```

Define your pack in `pack.ts`:

```ts
import { registerPack, type ContentPack } from "../registry";
import { MyEmailShell } from "./email-shell";

const pack: ContentPack = {
  key: "my-course",
  name: "My Email Course",
  description: "A 3-day course on...",
  steps: [
    { slug: "welcome", emailFile: "welcome.md" },
    { slug: "day-1", emailFile: "day-1.md" },
    { slug: "day-2", emailFile: "day-2.md" },
  ],
  EmailShell: MyEmailShell,
};

registerPack(pack);
```

Register it in `src/content-packs/index.ts`:

```ts
import "@/content-packs/my-course/pack";
```

Email markdown supports YAML frontmatter and placeholder variables:

```md
---
subject: "Day 1: Getting Started"
preview: Your first lesson awaits
---

Welcome to the course!

[Read online →]({{companionUrl}})

---

[Manage]({{manageUrl}}) · [Pause]({{pauseUrl}}) · [Unsubscribe]({{stopUrl}})
```

## Email Dispatch Architecture

ContentDrip uses a fan-out dispatch pattern to scale email delivery beyond what a single serverless function can handle.

```
Vercel Cron (every minute)
  → GET /api/cron (dispatcher)
      → queries active subscription IDs (lightweight)
      → ≤25 subs: processes locally, no overhead
      → >25 subs: chunks into batches of 25,
        fires parallel POST /api/send-batch workers,
        aggregates results
```

**Why this matters:** Vercel functions have a 60s (hobby) / 300s (pro) timeout. A single function processing 1000+ subscriptions sequentially would exceed that. The fan-out pattern splits work across parallel lambda invocations, each handling a small batch.

**Key design decisions:**

- **Local fallback** — when there are ≤25 active subscriptions, the dispatcher processes everything in-process. Zero self-invoke overhead during early growth.
- **Shared `now` timestamp** — the dispatcher captures the current time once and passes it to all workers, ensuring consistent cron due-checking across the same minute window.
- **Idempotency** — every email send is logged to a `send_log` table with a `hasSentStep()` check. Overlapping workers or retries never send duplicates.
- **Graceful failure isolation** — `Promise.allSettled` ensures one failing subscription doesn't block others. Per-subscription and per-worker failures are tracked and returned in the response.

## Deployment

### Vercel (recommended)

Push to GitHub, import in Vercel, set environment variables. The repo includes a `vercel.json` that configures the cron:

```json
{
  "crons": [{ "path": "/api/cron", "schedule": "* * * * *" }]
}
```

### Other hosts

Any Node.js host that supports Next.js works. Set up an external cron to hit `/api/cron` every minute:

```bash
* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron
```

## Stack

- [Next.js](https://nextjs.org) — App Router, Server Actions, API Routes
- [React Email](https://react.email) — cross-client email templates
- [Drizzle ORM](https://orm.drizzle.team) — type-safe SQL
- [SQLite / Turso](https://turso.tech) — edge-ready database
- [Resend](https://resend.com) / [Postmark](https://postmarkapp.com) — transactional email (pick one)
- [Tailwind CSS](https://tailwindcss.com) — styling

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx drizzle-kit push # Push schema to database
npx vitest run       # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
```

Set `DRIP_TIME_SCALE=144` in your `.env` to speed up delivery for local testing (1 day becomes 10 minutes).

## License

MIT

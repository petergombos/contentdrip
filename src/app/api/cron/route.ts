import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SchedulerService } from "@/domains/subscriptions/services/scheduler-service";
import { NextRequest, NextResponse } from "next/server";
// Ensure packs are registered
import "@/content-packs";

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const secretQuery = url.searchParams.get("secret");
  const isAuthorized = authHeader === `Bearer ${cronSecret}`;

  // Convenience for preview testing: allow `?secret=...` to trigger cron from a browser.
  // In production, require the Authorization header.
  const vercelEnv = process.env.VERCEL_ENV;
  const isPreview = vercelEnv && vercelEnv !== "production";

  if (!isAuthorized) {
    if (!(isPreview && secretQuery === cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    // Initialize services
    const repo = new SubscriptionRepo();
    const mailAdapter = new PostmarkAdapter({
      serverToken: process.env.POSTMARK_SERVER_TOKEN!,
      fromEmail: process.env.MAIL_FROM!,
      messageStream: process.env.POSTMARK_MESSAGE_STREAM,
    });
    const emailService = new EmailService(mailAdapter);
    const scheduler = new SchedulerService(repo, emailService);

    // Send due subscriptions (retry transient Turso capacity errors)
    const maxAttempts = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await scheduler.sendDueSubscriptions();

        return NextResponse.json({
          success: true,
          sent: result.sent,
          errors: result.errors,
          attempt,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isCapacity = msg.toLowerCase().includes("capacity") || msg.toLowerCase().includes("temporarily exceeded");

        if (!isCapacity || attempt === maxAttempts) {
          throw err;
        }

        // Exponential-ish backoff: 0.5s, 1.5s
        await sleep(500 + (attempt - 1) * 1000);
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Cron job error:", error);

    const msg = error instanceof Error ? error.message : String(error);
    const isCapacity = msg.toLowerCase().includes("capacity") || msg.toLowerCase().includes("temporarily exceeded");

    return NextResponse.json(
      {
        error: isCapacity ? "Database busy" : "Internal server error",
        message: msg,
      },
      { status: isCapacity ? 503 : 500 }
    );
  }
}

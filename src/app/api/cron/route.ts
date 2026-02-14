import { createMailAdapter } from "@/domains/mail/create-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SchedulerService } from "@/domains/subscriptions/services/scheduler-service";
import { resolveBaseUrl } from "@/lib/base-url";
import { NextRequest, NextResponse } from "next/server";
import "@/content-packs";

const BATCH_SIZE = 25;

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
  const vercelEnv = process.env.VERCEL_ENV;
  const isPreview = vercelEnv && vercelEnv !== "production";

  if (!isAuthorized) {
    if (!(isPreview && secretQuery === cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    const repo = new SubscriptionRepo();
    const mailAdapter = createMailAdapter();
    const emailService = new EmailService(mailAdapter);
    const scheduler = new SchedulerService(repo, emailService);

    // Shared timestamp for consistent due-checking across all workers
    const now = new Date();
    const fastTestStepMinutes = scheduler.getFastTestStepMinutes();

    // Lightweight query: just IDs (retry transient Turso capacity errors)
    let activeIds: string[];
    const maxAttempts = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        activeIds = await repo.findActiveSubscriptionIds();
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isCapacity =
          msg.toLowerCase().includes("capacity") ||
          msg.toLowerCase().includes("temporarily exceeded");

        if (!isCapacity || attempt === maxAttempts) {
          throw err;
        }
        await sleep(500 + (attempt - 1) * 1000);
      }
    }

    if (lastError) throw lastError;
    activeIds = activeIds!;

    if (activeIds.length === 0) {
      return NextResponse.json({
        success: true,
        mode: "local",
        sent: 0,
        skipped: 0,
        completed: 0,
        errors: 0,
        total: 0,
        timestamp: now.toISOString(),
      });
    }

    // Local mode: process in-process when small enough
    if (activeIds.length <= BATCH_SIZE) {
      const result = await scheduler.processBatch(
        activeIds,
        now,
        fastTestStepMinutes
      );

      return NextResponse.json({
        success: true,
        mode: "local",
        ...result,
        total: activeIds.length,
        timestamp: now.toISOString(),
      });
    }

    // Fan-out mode: chunk and dispatch to /api/send-batch
    const baseUrl = resolveBaseUrl();
    const chunks: string[][] = [];
    for (let i = 0; i < activeIds.length; i += BATCH_SIZE) {
      chunks.push(activeIds.slice(i, i + BATCH_SIZE));
    }

    const workerResults = await Promise.allSettled(
      chunks.map((chunk) =>
        fetch(`${baseUrl}/api/send-batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cronSecret}`,
          },
          body: JSON.stringify({
            subscriptionIds: chunk,
            now: now.toISOString(),
            fastTestStepMinutes,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Worker returned ${res.status}: ${text}`);
          }
          return res.json() as Promise<{
            sent: number;
            skipped: number;
            completed: number;
            errors: number;
            failures: { subscriptionId: string; error: string }[];
          }>;
        })
      )
    );

    // Aggregate results
    let sent = 0;
    let skipped = 0;
    let completed = 0;
    let errors = 0;
    const failures: { subscriptionId: string; error: string }[] = [];
    const workerFailures: { batch: number; error: string }[] = [];

    for (let i = 0; i < workerResults.length; i++) {
      const wr = workerResults[i];
      if (wr.status === "fulfilled") {
        sent += wr.value.sent;
        skipped += wr.value.skipped;
        completed += wr.value.completed;
        errors += wr.value.errors;
        failures.push(...wr.value.failures);
      } else {
        const errorMsg =
          wr.reason instanceof Error ? wr.reason.message : String(wr.reason);
        workerFailures.push({ batch: i, error: errorMsg });
        errors += chunks[i].length;
        console.error(`Worker batch ${i} failed:`, wr.reason);
      }
    }

    return NextResponse.json({
      success: workerFailures.length === 0,
      mode: "fan-out",
      batches: chunks.length,
      sent,
      skipped,
      completed,
      errors,
      total: activeIds.length,
      failures: failures.slice(0, 20),
      workerFailures: workerFailures.slice(0, 10),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);

    const msg = error instanceof Error ? error.message : String(error);
    const isCapacity =
      msg.toLowerCase().includes("capacity") ||
      msg.toLowerCase().includes("temporarily exceeded");

    return NextResponse.json(
      {
        error: isCapacity ? "Database busy" : "Internal server error",
        message: msg,
      },
      { status: isCapacity ? 503 : 500 }
    );
  }
}

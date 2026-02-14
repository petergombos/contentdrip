import { createMailAdapter } from "@/domains/mail/create-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SchedulerService } from "@/domains/subscriptions/services/scheduler-service";
import { NextRequest, NextResponse } from "next/server";
import "@/content-packs";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscriptionIds, now, fastTestStepMinutes } = body as {
      subscriptionIds: string[];
      now: string;
      fastTestStepMinutes: number | null;
    };

    if (!Array.isArray(subscriptionIds) || !now) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const repo = new SubscriptionRepo();
    const mailAdapter = createMailAdapter();
    const emailService = new EmailService(mailAdapter);
    const scheduler = new SchedulerService(repo, emailService);

    const result = await scheduler.processBatch(
      subscriptionIds,
      new Date(now),
      fastTestStepMinutes
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("send-batch error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

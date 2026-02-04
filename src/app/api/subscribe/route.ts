import { NextRequest, NextResponse } from "next/server";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SubscriptionService } from "@/domains/subscriptions/services/subscription-service";
import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import { z } from "zod";
import "@/content-packs";

const bodySchema = z.object({
  email: z.string().email(),
  packKey: z.string().min(1),
  timezone: z.string().min(1),
  cronExpression: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // Protect this endpoint (used for automated E2E / admin tooling)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const repo = new SubscriptionRepo();
  const mailAdapter = new PostmarkAdapter({
    serverToken: process.env.POSTMARK_SERVER_TOKEN!,
    fromEmail: process.env.MAIL_FROM!,
    messageStream: process.env.POSTMARK_MESSAGE_STREAM,
  });
  const emailService = new EmailService(mailAdapter, process.env.APP_BASE_URL);
  const service = new SubscriptionService(repo, emailService);

  const result = await service.subscribe(parsed.data);
  return NextResponse.json({ success: true, subscriptionId: result.subscriptionId });
}

import Link from "next/link";
import { createHash } from "crypto";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SubscriptionService } from "@/domains/subscriptions/services/subscription-service";
import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "@/content-packs";

interface ConfirmPageProps {
  params: Promise<{ token: string }>;
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { token } = await params;

  let status: "ok" | "error" = "ok";
  let errorMessage: string | null = null;

  try {
    const repo = new SubscriptionRepo();
    const mailAdapter = new PostmarkAdapter({
      serverToken: process.env.POSTMARK_SERVER_TOKEN!,
      fromEmail: process.env.MAIL_FROM!,
      messageStream: process.env.POSTMARK_MESSAGE_STREAM,
    });
    const emailService = new EmailService(mailAdapter, process.env.APP_BASE_URL);
    const service = new SubscriptionService(repo, emailService);

    const tokenHash = createHash("sha256").update(token).digest("hex");
    await service.confirmSubscription(tokenHash);
  } catch (error: unknown) {
    status = "error";
    errorMessage = error instanceof Error ? error.message : "An error occurred";
  }

  if (status === "ok") {
    return (
      <PageShell
        title="Confirmed"
        subtitle="You’re subscribed. Your first email will arrive at your chosen time."
      >
        <Card className="p-6 md:p-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Want to change the delivery time or unsubscribe?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/manage">Manage subscription</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Confirmation failed"
      subtitle="That link may have already been used, or it expired."
    >
      <Card className="p-6 md:p-8 space-y-4">
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button asChild variant="outline">
          <Link href="/manage">Request a new manage link</Link>
        </Button>
      </Card>
    </PageShell>
  );
}


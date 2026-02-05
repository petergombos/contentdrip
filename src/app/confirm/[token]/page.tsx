import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SubscriptionService } from "@/domains/subscriptions/services/subscription-service";
import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import "@/content-packs";

interface ConfirmPageProps {
  params: Promise<{ token: string }>;
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { token } = await params;

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

    redirect("/?confirmed=true");
  } catch (error: unknown) {
    const err = error as { digest?: unknown; message?: unknown };

    // `redirect()` throws a NEXT_REDIRECT error; don't swallow it.
    if (err?.digest && String(err.digest).includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (err?.message && String(err.message).includes("NEXT_REDIRECT")) {
      throw error;
    }

    const { PageShell } = await import("@/components/page-shell");
    const { Card } = await import("@/components/ui/card");

    return (
      <PageShell
        title="Confirmation failed"
        subtitle="That link may have already been used, or it expired."
      >
        <Card className="p-6 md:p-8">
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </Card>
      </PageShell>
    );
  }
}

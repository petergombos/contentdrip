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
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }
}

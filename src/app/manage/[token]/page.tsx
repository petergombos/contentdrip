import { redirect } from "next/navigation";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
import { createHash } from "crypto";
import { ManagePreferencesForm } from "@/components/manage-preferences-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stopFromEmailAction } from "@/domains/subscriptions/actions/subscription-actions";
import { PageShell } from "@/components/page-shell";

interface ManageTokenPageProps {
  params: Promise<{ token: string }>;
}

async function getSubscriptionFromToken(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const emailService = new EmailService(
    new PostmarkAdapter({
      serverToken: process.env.POSTMARK_SERVER_TOKEN!,
      fromEmail: process.env.MAIL_FROM!,
      messageStream: process.env.POSTMARK_MESSAGE_STREAM,
    }),
    process.env.APP_BASE_URL || "http://localhost:3000"
  );

  const result = await emailService.verifyAndConsumeToken(
    tokenHash,
    "MANAGE"
  );

  if (!result) {
    return null;
  }

  const repo = new SubscriptionRepo();
  return repo.findById(result.subscriptionId);
}

export default async function ManageTokenPage({
  params,
}: ManageTokenPageProps) {
  const { token } = await params;

  const subscription = await getSubscriptionFromToken(token);

  if (!subscription) {
    return (
      <PageShell
        title="This link has expired"
        subtitle="Request a new management link and we’ll email it to you."
      >
        <Card className="p-6 md:p-8">
          <p className="text-sm text-muted-foreground">
            Invalid or expired token.
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Preferences"
      subtitle="Adjust delivery timing, timezone, or unsubscribe." 
    >
      <Card className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="font-semibold mb-1">Subscription</h2>
          <p className="text-sm text-muted-foreground">{subscription.email}</p>
          <p className="text-sm text-muted-foreground">
            {subscription.packKey} · {subscription.status} · Step {subscription.currentStepIndex + 1}
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Delivery</h2>
          <ManagePreferencesForm subscription={subscription} />
        </div>

        <div className="pt-4 border-t">
          <form
            action={async () => {
              "use server";
              const emailService = new EmailService(
                new PostmarkAdapter({
                  serverToken: process.env.POSTMARK_SERVER_TOKEN!,
                  fromEmail: process.env.MAIL_FROM!,
                  messageStream: process.env.POSTMARK_MESSAGE_STREAM,
                }),
                process.env.APP_BASE_URL || "http://localhost:3000"
              );
              const stopToken = emailService.createSignedToken(
                subscription.id,
                "STOP"
              );
              await stopFromEmailAction({
                subscriptionId: subscription.id,
                token: stopToken,
              });
              redirect("/?unsubscribed=true");
            }}
          >
            <Button type="submit" variant="destructive" className="w-full">
              Unsubscribe
            </Button>
          </form>
        </div>
      </Card>
    </PageShell>
  );
}

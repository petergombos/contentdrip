import { redirect } from "next/navigation";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
import { createHash } from "crypto";
import { ManagePreferencesForm } from "@/components/manage-preferences-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stopFromEmailAction } from "@/domains/subscriptions/actions/subscription-actions";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground">
            This management link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Subscription</h1>
          <p className="text-muted-foreground">
            Update your preferences or manage your subscription
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-1">Subscription Details</h2>
            <p className="text-sm text-muted-foreground">
              Email: {subscription.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {subscription.status}
            </p>
            <p className="text-sm text-muted-foreground">
              Current Step: {subscription.currentStepIndex + 1}
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-4">Preferences</h2>
            <ManagePreferencesForm subscription={subscription} />
          </div>

          <div className="pt-4 border-t">
            <form
              action={async () => {
                "use server";
                // Create a signed stop token
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline hover:text-foreground">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

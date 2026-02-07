import { redirect } from "next/navigation";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { createMailAdapter } from "@/domains/mail/create-adapter";
import { createHash } from "crypto";
import { ManagePreferencesForm } from "@/components/manage-preferences-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stopFromEmailAction } from "@/domains/subscriptions/actions/subscription-actions";
import { PageShell } from "@/components/page-shell";
import { getPackByKey } from "@/content-packs/registry";
import "@/content-packs";

interface ManageTokenPageProps {
  params: Promise<{ token: string }>;
}

async function getSubscriptionFromToken(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const emailService = new EmailService(
    createMailAdapter(),
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-olive/10 text-olive" },
  PAUSED: { label: "Paused", color: "bg-primary/10 text-primary" },
  PENDING_CONFIRM: {
    label: "Pending confirmation",
    color: "bg-muted text-muted-foreground",
  },
  STOPPED: {
    label: "Unsubscribed",
    color: "bg-destructive/10 text-destructive",
  },
  COMPLETED: { label: "Completed", color: "bg-olive/10 text-olive" },
};

export default async function ManageTokenPage({
  params,
}: ManageTokenPageProps) {
  const { token } = await params;

  const subscription = await getSubscriptionFromToken(token);

  if (!subscription) {
    return (
      <PageShell
        title="Link Expired"
        subtitle="This management link has already been used or has expired. Request a new one below."
      >
        <Card className="animate-fade-in-up delay-2 p-6 md:p-8">
          <p className="text-sm text-muted-foreground">
            Management links are single-use for security. You can request a
            fresh one at any time.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <a href="/manage">Request a new link</a>
          </Button>
        </Card>
      </PageShell>
    );
  }

  const pack = getPackByKey(subscription.packKey);
  const packName = pack?.name ?? subscription.packKey;
  const totalSteps = pack?.steps.length ?? 0;
  const currentStep = subscription.currentStepIndex;
  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const statusInfo = STATUS_LABELS[subscription.status] ?? {
    label: subscription.status,
    color: "bg-muted text-muted-foreground",
  };

  return (
    <PageShell
      title="Your Subscription"
      subtitle="Manage your delivery preferences, pause, or unsubscribe."
      warm
    >
      {/* ── Overview card ── */}
      <Card className="animate-fade-in-up delay-2 p-6 md:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Course
            </p>
            <h2 className="mt-1 font-serif text-lg font-semibold text-foreground">
              {packName}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {subscription.email}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Progress */}
        {totalSteps > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {currentStep} of {totalSteps} lessons
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(progressPct, 2)}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* ── Delivery preferences ── */}
      <Card className="animate-fade-in-up delay-3 mt-6 p-6 md:p-8 space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Delivery Preferences
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust when and how often you receive lessons.
          </p>
        </div>

        <ManagePreferencesForm subscription={subscription} />
      </Card>

      {/* ── Danger zone ── */}
      <Card className="animate-fade-in-up delay-4 mt-6 border-destructive/20 p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-destructive/60">
          Unsubscribe
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Stop all future emails from this course. You can always re-subscribe
          later to start fresh.
        </p>
        <form
          action={async () => {
            "use server";
            const emailService = new EmailService(
              createMailAdapter(),
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
          <Button
            type="submit"
            variant="destructive"
            className="mt-4"
            size="sm"
          >
            Unsubscribe from course
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}

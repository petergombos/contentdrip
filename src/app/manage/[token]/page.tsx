import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { createMailAdapter } from "@/domains/mail/create-adapter";
import { createHash } from "crypto";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { getPackByKey } from "@/content-packs/registry";
import { SubscriptionCard } from "@/components/subscription-card";
import { Mail } from "lucide-react";
import "@/content-packs";

interface ManageTokenPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string; sid?: string }>;
}

async function getSubscriptionsFromToken(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const emailService = new EmailService(
    createMailAdapter(),
    process.env.APP_BASE_URL || "http://localhost:3000"
  );

  const result = await emailService.verifyToken(tokenHash, "MANAGE");

  if (!result) {
    return null;
  }

  const repo = new SubscriptionRepo();

  // Find the anchor subscription to get the email
  const anchor = await repo.findById(result.subscriptionId);
  if (!anchor) {
    return null;
  }

  // Load ALL subscriptions for this email
  const allSubscriptions = await repo.findByEmail(anchor.email);

  return { email: anchor.email, subscriptions: allSubscriptions };
}

export default async function ManageTokenPage({
  params,
  searchParams,
}: ManageTokenPageProps) {
  const { token } = await params;
  const { action, sid } = await searchParams;

  const data = await getSubscriptionsFromToken(token);

  if (!data) {
    return (
      <PageShell
        title="Link Expired"
        subtitle="This management link has already been used or has expired. Request a new one below."
      >
        <Card
          size="lg"
          className="animate-fade-in-up delay-2"
          data-testid="manage-link-expired"
        >
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Management links are single-use for security. You can request a
              fresh one at any time.
            </p>
            <Button asChild>
              <a href="/manage">Request a new link</a>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const { email, subscriptions } = data;

  // Determine which subscription is targeted by the action
  const targetedSid = sid || undefined;

  // Sort: active first, then paused, then others
  const statusOrder: Record<string, number> = {
    ACTIVE: 0,
    PAUSED: 1,
    PENDING_CONFIRM: 2,
    STOPPED: 3,
    COMPLETED: 4,
  };
  const sorted = [...subscriptions].sort(
    (a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
  );

  return (
    <PageShell
      title="Your Subscriptions"
      subtitle="Manage your delivery preferences, pause, or unsubscribe."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3" data-testid="manage-email">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm text-foreground">{email}</span>
        </div>
        {sorted.map((subscription) => {
          const pack = getPackByKey(subscription.packKey);
          const packName = pack?.name ?? subscription.packKey;
          const totalSteps = pack?.steps.length ?? 0;
          const isTargeted = targetedSid === subscription.id;
          // Default expand: targeted subscription, or active/paused ones when there's only one
          const defaultExpanded =
            isTargeted ||
            (sorted.length === 1 &&
              (subscription.status === "ACTIVE" ||
                subscription.status === "PAUSED" ||
                subscription.status === "STOPPED"));

          return (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              packName={packName}
              totalSteps={totalSteps}
              token={token}
              action={isTargeted ? action : undefined}
              defaultExpanded={defaultExpanded}
              frequency={pack?.frequency}
            />
          );
        })}
      </div>
    </PageShell>
  );
}

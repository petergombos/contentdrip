import Link from "next/link";
import { createHash } from "crypto";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SubscriptionService } from "@/domains/subscriptions/services/subscription-service";
import { createMailAdapter } from "@/domains/mail/create-adapter";
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
    const mailAdapter = createMailAdapter();
    const emailService = new EmailService(mailAdapter);
    const service = new SubscriptionService(repo, emailService);

    const tokenHash = createHash("sha256").update(token).digest("hex");
    await service.confirmSubscription(tokenHash);
  } catch (error: unknown) {
    status = "error";
    errorMessage =
      error instanceof Error ? error.message : "An error occurred";
  }

  if (status === "ok") {
    return (
      <PageShell warm>
        <div className="mx-auto max-w-md text-center">
          {/* Celebratory icon */}
          <div className="animate-scale-in mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-olive/10">
            <svg
              className="h-10 w-10 text-olive"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="animate-fade-in-up delay-1 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            You&apos;re In
          </h1>
          <p className="animate-fade-in-up delay-2 mt-3 text-muted-foreground">
            Your subscription is confirmed. Your first lesson will arrive at
            your chosen time tomorrow morning.
          </p>

          <Card className="animate-fade-in-up delay-3 mt-8 p-6 text-left">
            <h2 className="text-sm font-semibold text-foreground">
              What happens next?
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[10px] font-bold text-primary">
                  1
                </span>
                <span>
                  Your <strong className="text-foreground">welcome email</strong>{" "}
                  arrives at your chosen delivery time
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[10px] font-bold text-primary">
                  2
                </span>
                <span>
                  One lesson per day for{" "}
                  <strong className="text-foreground">five days</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[10px] font-bold text-primary">
                  3
                </span>
                <span>
                  Pause, resume, or adjust anytime via the{" "}
                  <strong className="text-foreground">manage link</strong> in
                  each email
                </span>
              </li>
            </ul>
          </Card>

          <div className="animate-fade-in-up delay-4 mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/manage">Manage subscription</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Confirmation failed"
      subtitle="That link may have already been used, or it has expired."
    >
      <Card className="p-6 md:p-8 space-y-4 animate-fade-in-up">
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/manage">Request a new link</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}

import Link from "next/link";
import { createHash } from "crypto";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { SubscriptionService } from "@/domains/subscriptions/services/subscription-service";
import { createMailAdapter } from "@/domains/mail/create-adapter";
import { EmailService } from "@/domains/mail/services/email-service";
import { PageShell } from "@/components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
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
      <PageShell>
        <div
          className="mx-auto max-w-md text-center"
          data-testid="confirm-success"
        >
          {/* Celebratory icon */}
          <div className="animate-scale-in mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" strokeWidth={2} />
          </div>

          <h1
            className="animate-fade-in-up delay-1 font-serif text-3xl font-semibold tracking-tight md:text-4xl"
            data-testid="confirm-success-title"
          >
            You&apos;re In
          </h1>
          <p className="animate-fade-in-up delay-2 mt-3 text-muted-foreground">
            Your subscription is confirmed. Your first lesson is on its
            way — check your inbox shortly.
          </p>

          <Card size="lg" className="animate-fade-in-up delay-3 mt-8 text-left">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                What happens next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[10px] font-bold text-primary">
                    1
                  </span>
                  <span>
                    Your <strong className="text-foreground">first lesson</strong>{" "}
                    arrives right away
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[10px] font-bold text-primary">
                    2
                  </span>
                  <span>
                    Following lessons deliver on{" "}
                    <strong className="text-foreground">your chosen schedule</strong>
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
            </CardContent>
          </Card>

          <div className="animate-fade-in-up delay-4 mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/manage">Manage subscription</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
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
      <Card size="lg" className="animate-fade-in-up" data-testid="confirm-error">
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/manage">Request a new link</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

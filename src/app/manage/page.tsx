import { ManageRequestForm } from "@/components/manage-request-form";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Subscription",
  description: "Manage your ContentDrip email course subscription preferences.",
  openGraph: {
    title: "Manage Subscription — ContentDrip",
    description: "Manage your email course subscription preferences.",
    images: [
      {
        url: "/api/og?type=default&title=Manage+Subscription&label=ContentDrip",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    title: "Manage Subscription — ContentDrip",
    images: [
      "/api/og?type=default&title=Manage+Subscription&label=ContentDrip",
    ],
  },
};

export default function ManagePage() {
  return (
    <PageShell
      title="Manage Your Subscriptions"
      subtitle="Enter your email below and we'll send you a secure one-time link to manage your delivery preferences."
      warm
    >
      <Card className="animate-fade-in-up delay-2 p-6 md:p-8">
        <ManageRequestForm />
      </Card>

      <div className="animate-fade-in-up delay-3 mt-8 rounded-lg border border-border/60 bg-(--surface-warm) px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Why a one-time link?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          For your security, we don&apos;t use passwords. Instead, we email you
          a secure link that expires after 24 hours. It&apos;s the same
          approach used by many modern apps — simple and safe.
        </p>
      </div>
    </PageShell>
  );
}

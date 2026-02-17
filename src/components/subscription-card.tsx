"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManagePreferencesForm } from "@/components/manage-preferences-form";
import { ActionNotification } from "@/components/action-notification";
import { ChevronRight } from "lucide-react";
import type { Subscription } from "@/domains/subscriptions/model/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-primary/10 text-primary" },
  PAUSED: { label: "Paused", color: "bg-primary/10 text-primary" },
  PENDING_CONFIRM: {
    label: "Pending confirmation",
    color: "bg-muted text-muted-foreground",
  },
  STOPPED: {
    label: "Unsubscribed",
    color: "bg-destructive/10 text-destructive",
  },
  COMPLETED: { label: "Completed", color: "bg-primary/10 text-primary" },
};

interface SubscriptionCardProps {
  subscription: Subscription;
  packName: string;
  totalSteps: number;
  token: string;
  action?: string;
  defaultExpanded?: boolean;
  onUnsubscribe: (subscriptionId: string) => Promise<void>;
  cadence?: string;
}

export function SubscriptionCard({
  subscription,
  packName,
  totalSteps,
  token,
  action,
  defaultExpanded = false,
  onUnsubscribe,
  cadence,
}: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const currentStep = subscription.currentStepIndex;
  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const statusInfo = STATUS_LABELS[subscription.status] ?? {
    label: subscription.status,
    color: "bg-muted text-muted-foreground",
  };

  return (
    <div data-testid={`subscription-card-${subscription.packKey}`}>
      {/* Action notification for this card */}
      {action && (
        <ActionNotification
          action={action}
          subscription={subscription}
          packName={packName}
        />
      )}

      <Card className="p-6 md:p-8 space-y-5" data-testid="manage-overview-card">
        {/* Header: pack name + status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2
              className="font-serif text-lg font-semibold text-foreground"
              data-testid="manage-pack-name"
            >
              {packName}
            </h2>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${statusInfo.color}`}
            data-testid="manage-status-badge"
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

        {/* Expand/collapse toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-1.5 px-0 text-muted-foreground hover:text-foreground"
          data-testid="subscription-card-toggle"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
          {expanded ? "Hide preferences" : "Manage preferences"}
        </Button>

        {/* Expandable: preferences + danger zone */}
        {expanded && (
          <div className="space-y-6 pt-2 animate-fade-in-up">
            {/* Delivery preferences */}
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                  Delivery Preferences
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust when and how often you receive lessons.
                </p>
              </div>
              <ManagePreferencesForm
                key={subscription.status}
                subscription={subscription}
                cadence={cadence}
              />
            </div>

            {/* Danger zone */}
            {subscription.status !== "STOPPED" && (
              <div
                className="rounded-lg border border-destructive/20 p-4"
                data-testid="manage-danger-zone"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive/60">
                  Unsubscribe
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stop all future emails from this course.
                </p>
                <form action={async () => { await onUnsubscribe(subscription.id); }}>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="mt-3"
                    size="sm"
                    data-testid="manage-unsubscribe-button"
                  >
                    Unsubscribe from {packName}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

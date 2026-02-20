"use client";

import { ActionNotification } from "@/components/action-notification";
import { ManagePreferencesForm } from "@/components/manage-preferences-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { unsubscribeFromManageAction } from "@/domains/subscriptions/actions/subscription-actions";
import type { Subscription } from "@/domains/subscriptions/model/types";
import { ChevronRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-emerald-500/10 text-emerald-600" },
  PAUSED: { label: "Paused", color: "bg-amber-500/10 text-amber-600" },
  PENDING_CONFIRM: {
    label: "Pending confirmation",
    color: "bg-muted text-muted-foreground",
  },
  STOPPED: {
    label: "Unsubscribed",
    color: "bg-destructive/10 text-destructive",
  },
  COMPLETED: { label: "Completed", color: "bg-blue-500/10 text-blue-600" },
};

interface SubscriptionCardProps {
  subscription: Subscription;
  packName: string;
  totalSteps: number;
  token: string;
  action?: string;
  defaultExpanded?: boolean;
  frequency?: string;
}

export function SubscriptionCard({
  subscription,
  packName,
  totalSteps,
  token,
  action,
  defaultExpanded = false,
  frequency,
}: SubscriptionCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { execute: executeUnsubscribe, isPending: isUnsubscribing } = useAction(
    unsubscribeFromManageAction,
    {
      onSuccess: () => {
        router.push(`/manage/${token}?action=unsubscribed&sid=${subscription.id}`);
      },
      onError: ({ error }) => {
        const message = error.serverError ?? "An error occurred";
        toast.error("Failed to unsubscribe", { description: message });
      },
    },
  );

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

      <Card size="lg" data-testid="manage-overview-card">
        <CardHeader>
          <CardTitle
            className="font-serif text-lg font-semibold"
            data-testid="manage-pack-name"
          >
            {packName}
          </CardTitle>
          <CardAction>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${statusInfo.color}`}
              data-testid="manage-status-badge"
            >
              {statusInfo.label}
            </span>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-5">
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
                <ManagePreferencesForm
                  key={subscription.status}
                  subscription={subscription}
                  frequency={frequency}
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
                  <Button
                    variant="destructive"
                    className="mt-3"
                    size="sm"
                    disabled={isUnsubscribing}
                    onClick={() => executeUnsubscribe({ subscriptionId: subscription.id })}
                    data-testid="manage-unsubscribe-button"
                  >
                    Unsubscribe
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

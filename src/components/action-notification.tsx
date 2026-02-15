"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resumeSubscriptionAction } from "@/domains/subscriptions/actions/subscription-actions";
import { Pause, Check, CircleX } from "lucide-react";
import type { Subscription } from "@/domains/subscriptions/model/types";

interface ActionNotificationProps {
  action: string;
  subscription: Subscription;
  packName?: string;
}

const NOTIFICATIONS: Record<
  string,
  {
    icon: "pause" | "stop" | "check";
    title: string;
    description: string;
    undoLabel: string;
    borderColor: string;
    bgColor: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  paused: {
    icon: "pause",
    title: "Subscription paused",
    description:
      "You won't receive any more lessons until you resume. Your progress is saved.",
    undoLabel: "Resume delivery",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  unsubscribed: {
    icon: "stop",
    title: "You've unsubscribed",
    description:
      "You won't receive any more emails from this course. If this was a mistake, you can resubscribe below.",
    undoLabel: "Resubscribe",
    borderColor: "border-destructive/30",
    bgColor: "bg-destructive/5",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  resumed: {
    icon: "check",
    title: "Welcome back! Your subscription is active again.",
    description: "You'll continue receiving lessons where you left off.",
    undoLabel: "",
    borderColor: "border-olive/30",
    bgColor: "bg-olive/5",
    iconBg: "bg-olive/10",
    iconColor: "text-olive",
  },
};

const ICON_MAP = {
  pause: Pause,
  check: Check,
  stop: CircleX,
} as const;

export function ActionNotification({
  action,
  subscription,
  packName,
}: ActionNotificationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notification = NOTIFICATIONS[action];
  if (!notification) return null;

  const canResume =
    (action === "paused" && subscription.status === "PAUSED") ||
    (action === "unsubscribed" && subscription.status === "STOPPED");

  const handleResume = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resumeSubscriptionAction({
        subscriptionId: subscription.id,
      });

      if (result?.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "Something went wrong. Please try again."
        );
        setIsLoading(false);
      } else {
        router.replace(`${pathname}?action=resumed`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const Icon = ICON_MAP[notification.icon];

  return (
    <div
      className={`mb-6 animate-fade-in-up rounded-lg border ${notification.borderColor} ${notification.bgColor} p-4`}
      data-testid={`action-notification-${action}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.iconBg}`}
        >
          <Icon className={`h-4 w-4 ${notification.iconColor}`} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {packName ? `${packName} — ${notification.title}` : notification.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {notification.description}
          </p>
          {error && (
            <p className="mt-2 text-xs text-destructive">{error}</p>
          )}
          {canResume && (
            <Button
              onClick={handleResume}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="mt-3"
              data-testid="action-notification-undo"
            >
              {isLoading ? "Resuming..." : notification.undoLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

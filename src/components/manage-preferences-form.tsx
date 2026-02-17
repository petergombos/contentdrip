"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SuccessState } from "@/components/success-state";
import { IntervalSelector, intervalToCron, cronToInterval } from "@/components/interval-selector";
import { TimezoneSelector } from "@/components/timezone-selector";
import { SendTimeSelector, mergeHourIntoCron } from "@/components/send-time-selector";
import {
  updateSubscriptionAction,
  pauseSubscriptionAction,
  resumeSubscriptionAction,
} from "@/domains/subscriptions/actions/subscription-actions";
import { Loader2, Play, Pause, CircleX } from "lucide-react";
import { useState } from "react";
import type { Subscription } from "@/domains/subscriptions/model/types";

const updateSubscriptionSchema = z.object({
  timezone: z.string().min(1, "Please select a timezone"),
  interval: z.string().min(1, "Please select an interval"),
  sendTime: z.number().min(0).max(23),
});

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>;

interface ManagePreferencesFormProps {
  subscription: Subscription;
  onUpdate?: () => void;
  /** When set, locks the cadence — hides the interval selector. */
  cadence?: string;
}

export function ManagePreferencesForm({
  subscription,
  onUpdate,
  cadence,
}: ManagePreferencesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasFixedCadence = !!cadence;

  // Parse cron to get interval and hour
  const cronParts = subscription.cronExpression.split(" ");
  const sendTime = parseInt(cronParts[1] || "8", 10);

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdateSubscriptionFormData>({
    resolver: zodResolver(updateSubscriptionSchema),
    defaultValues: {
      timezone: subscription.timezone,
      interval: cronToInterval(subscription.cronExpression),
      sendTime,
    },
  });

  const onSubmit = async (data: UpdateSubscriptionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const cronExpression = hasFixedCadence
        ? mergeHourIntoCron(cadence!, data.sendTime)
        : mergeHourIntoCron(intervalToCron(data.interval), data.sendTime);

      const result = await updateSubscriptionAction({
        subscriptionId: subscription.id,
        timezone: data.timezone,
        cronExpression,
      });

      if (result?.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "An error occurred"
        );
      } else if (result?.data) {
        setSuccess(true);
        onUpdate?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await pauseSubscriptionAction({
        subscriptionId: subscription.id,
      });

      if (result?.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "An error occurred"
        );
        setIsSubmitting(false);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  const handleResume = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await resumeSubscriptionAction({
        subscriptionId: subscription.id,
      });

      if (result?.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "An error occurred"
        );
        setIsSubmitting(false);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div data-testid="manage-preferences-success">
        <SuccessState
          icon="check"
          title="Preferences updated"
          description="Your changes take effect starting with your next delivery."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {subscription.status === "ACTIVE" && (
        <div
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4"
          data-testid="manage-active-banner"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Play className="h-4 w-4 text-primary" fill="currentColor" strokeWidth={0} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Your subscription is active
              </p>
              <p className="text-xs text-muted-foreground">
                Pause to temporarily stop receiving lessons.
              </p>
            </div>
            <Button
              onClick={handlePause}
              disabled={isSubmitting}
              size="sm"
              variant="outline"
              data-testid="manage-pause-button"
            >
              Pause
            </Button>
          </div>
        </div>
      )}

      {subscription.status === "PAUSED" && (
        <div
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4"
          data-testid="manage-paused-banner"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Pause className="h-4 w-4 text-primary" fill="currentColor" strokeWidth={0} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Your subscription is paused
              </p>
              <p className="text-xs text-muted-foreground">
                Resume to continue receiving lessons where you left off.
              </p>
            </div>
            <Button
              onClick={handleResume}
              disabled={isSubmitting}
              size="sm"
              data-testid="manage-resume-button"
            >
              Resume
            </Button>
          </div>
        </div>
      )}

      {subscription.status === "STOPPED" && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4"
          data-testid="manage-stopped-banner"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <CircleX className="h-4 w-4 text-destructive" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                You&apos;re unsubscribed
              </p>
              <p className="text-xs text-muted-foreground">
                Resubscribe to continue receiving lessons where you left off.
              </p>
            </div>
            <Button
              onClick={handleResume}
              disabled={isSubmitting}
              size="sm"
              data-testid="manage-resubscribe-button"
            >
              Resubscribe
            </Button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        data-testid="manage-preferences-form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="timezone" className="text-xs font-medium">
            Timezone
          </Label>
          <TimezoneSelector
            value={watch("timezone")}
            onValueChange={(value) => setValue("timezone", value)}
          />
          {errors.timezone && (
            <p className="text-xs text-destructive">
              {errors.timezone.message}
            </p>
          )}
        </div>

        {!hasFixedCadence && (
          <div className="space-y-1.5">
            <Label htmlFor="interval" className="text-xs font-medium">
              Frequency
            </Label>
            <IntervalSelector
              value={watch("interval")}
              onValueChange={(value) => setValue("interval", value)}
            />
            {errors.interval && (
              <p className="text-xs text-destructive">
                {errors.interval.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="sendTime" className="text-xs font-medium">
            Delivery time
          </Label>
          <SendTimeSelector
            value={watch("sendTime")}
            onValueChange={(value) => setValue("sendTime", value)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
          data-testid="manage-preferences-submit"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </span>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </form>
    </div>
  );
}

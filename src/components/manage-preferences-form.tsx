"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IntervalSelector } from "@/components/interval-selector";
import { TimezoneSelector } from "@/components/timezone-selector";
import { SendTimeSelector, hourToCron } from "@/components/send-time-selector";
import {
  updateSubscriptionAction,
  resumeSubscriptionAction,
} from "@/domains/subscriptions/actions/subscription-actions";
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
}

export function ManagePreferencesForm({
  subscription,
  onUpdate,
}: ManagePreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      interval: "Daily",
      sendTime,
    },
  });

  const onSubmit = async (data: UpdateSubscriptionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const cronExpression = hourToCron(data.sendTime);

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

  if (success) {
    return (
      <div className="rounded-lg border border-olive/20 bg-olive/5 px-4 py-4 text-center animate-scale-in">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-olive/10">
          <svg
            className="h-5 w-5 text-olive"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2.5}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-olive">
          Preferences updated successfully
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your changes take effect starting with your next delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {subscription.status === "PAUSED" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-4 w-4 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
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
            >
              Resume
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" disabled={isSubmitting} className="w-full h-10">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
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

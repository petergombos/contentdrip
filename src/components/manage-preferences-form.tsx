"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IntervalSelector, intervalToCron } from "@/components/interval-selector";
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
      interval: "Daily", // Default, could be improved to parse from cron
      sendTime,
    },
  });

  const onSubmit = async (data: UpdateSubscriptionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const baseCron = intervalToCron(data.interval);
      const cronExpression = hourToCron(data.sendTime, baseCron);

      const result = await updateSubscriptionAction({
        subscriptionId: subscription.id,
        timezone: data.timezone,
        cronExpression,
      });

      if (result?.serverError) {
        setError(typeof result.serverError === 'string' ? result.serverError : 'An error occurred');
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
        setError(typeof result.serverError === 'string' ? result.serverError : 'An error occurred');
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
      <div className="rounded-lg border p-4 text-center bg-green-50 dark:bg-green-900/20">
        <p className="text-sm text-green-700 dark:text-green-400">
          Preferences updated successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscription.status === "PAUSED" && (
        <div className="rounded-lg border p-4">
          <p className="text-sm mb-3">Your subscription is currently paused.</p>
          <Button onClick={handleResume} disabled={isSubmitting} size="sm">
            Resume Subscription
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <TimezoneSelector
            value={watch("timezone")}
            onValueChange={(value) => setValue("timezone", value)}
          />
          {errors.timezone && (
            <p className="text-sm text-destructive">{errors.timezone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Frequency</Label>
          <IntervalSelector
            value={watch("interval")}
            onValueChange={(value) => setValue("interval", value)}
          />
          {errors.interval && (
            <p className="text-sm text-destructive">{errors.interval.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sendTime">Preferred Send Time</Label>
          <SendTimeSelector
            value={watch("sendTime")}
            onValueChange={(value) => setValue("sendTime", value)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Updating..." : "Update Preferences"}
        </Button>
      </form>
    </div>
  );
}

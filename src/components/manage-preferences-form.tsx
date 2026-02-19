"use client";

import {
  FrequencySelector,
  cronToFrequency,
  frequencyToCron,
} from "@/components/frequency-selector";
import {
  SendTimeSelector,
  mergeHourIntoCron,
} from "@/components/send-time-selector";
import { TimezoneSelector } from "@/components/timezone-selector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  pauseSubscriptionAction,
  restartSubscriptionAction,
  resumeSubscriptionAction,
  updateSubscriptionAction,
} from "@/domains/subscriptions/actions/subscription-actions";
import type { Subscription } from "@/domains/subscriptions/model/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, Loader2, Pause, Play, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  timezone: z.string().min(1, "Please select a timezone"),
  frequency: z.string().min(1, "Please select a frequency"),
  sendTime: z.number().min(0).max(23),
});

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>;

interface ManagePreferencesFormProps {
  subscription: Subscription;
  onUpdate?: () => void;
  /** When set, locks the frequency — hides the frequency selector. */
  frequency?: string;
}

export function ManagePreferencesForm({
  subscription,
  onUpdate,
  frequency,
}: ManagePreferencesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const hasFixedFrequency = !!frequency;

  // Parse cron to get frequency and hour
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
      frequency: cronToFrequency(subscription.cronExpression),
      sendTime,
    },
  });

  const onSubmit = async (data: UpdateSubscriptionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const cronExpression = hasFixedFrequency
        ? mergeHourIntoCron(frequency!, data.sendTime)
        : mergeHourIntoCron(frequencyToCron(data.frequency), data.sendTime);

      const result = await updateSubscriptionAction({
        subscriptionId: subscription.id,
        timezone: data.timezone,
        cronExpression,
      });

      if (result?.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "An error occurred",
        );
      } else if (result?.data) {
        toast.success("Preferences updated", {
          description:
            "Your changes take effect starting with your next delivery.",
        });
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
            : "An error occurred",
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
            : "An error occurred",
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

  const handleRestart = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await restartSubscriptionAction({
        subscriptionId: subscription.id,
      });

      if (result?.serverError) {
        const message =
          typeof result.serverError === "string"
            ? result.serverError
            : "An error occurred";
        setError(message);
        toast.error("Failed to restart course", { description: message });
      } else {
        setShowRestartConfirm(false);
        toast.success("Course restarted", {
          description: "You'll start again from lesson 1.",
        });
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error("Failed to restart course", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRestart =
    subscription.status === "ACTIVE" ||
    subscription.status === "PAUSED" ||
    subscription.status === "COMPLETED";

  return (
    <div className="space-y-5">
      {subscription.status === "ACTIVE" && (
        <div
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-4"
          data-testid="manage-active-banner"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Play
                className="h-4 w-4 text-emerald-600"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
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
        </div>
      )}

      {subscription.status === "PAUSED" && (
        <div
          className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-4"
          data-testid="manage-paused-banner"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <Pause
                className="h-4 w-4 text-amber-600"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
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
        </div>
      )}

      {subscription.status === "STOPPED" && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4"
          data-testid="manage-stopped-banner"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <CircleX className="h-4 w-4 text-destructive" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                You&apos;re unsubscribed
              </p>
              <p className="text-xs text-muted-foreground">
                Sign up again to restart this course.
              </p>
            </div>
          </div>
        </div>
      )}

      {canRestart && (
        <div
          className="rounded-lg border border-border/50 px-4 py-4"
          data-testid="manage-restart-section"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Restart course
                </p>
                <p className="text-xs text-muted-foreground">
                  Go back to lesson 1 and start over from the beginning.
                </p>
              </div>
              {!showRestartConfirm ? (
                <Button
                  onClick={() => setShowRestartConfirm(true)}
                  disabled={isSubmitting}
                  size="sm"
                  variant="outline"
                  data-testid="manage-restart-button"
                >
                  Restart
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowRestartConfirm(false)}
                    disabled={isSubmitting}
                    size="sm"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRestart}
                    disabled={isSubmitting}
                    size="sm"
                    variant="destructive"
                    data-testid="manage-restart-confirm"
                  >
                    {isSubmitting ? "Restarting..." : "Yes, restart"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subscription.status === "STOPPED" ? null : (
        <div>
          <div className="mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Delivery Preferences
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust when and how often you receive lessons.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-lg border border-border/50 p-4"
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

            {!hasFixedFrequency && (
              <div className="space-y-1.5">
                <Label htmlFor="frequency" className="text-xs font-medium">
                  Frequency
                </Label>
                <FrequencySelector
                  value={watch("frequency")}
                  onValueChange={(value) => setValue("frequency", value)}
                />
                {errors.frequency && (
                  <p className="text-xs text-destructive">
                    {errors.frequency.message}
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
      )}
    </div>
  );
}

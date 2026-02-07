"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SendTimeSelector, hourToCron } from "@/components/send-time-selector";
import { subscribeAction } from "@/domains/subscriptions/actions/subscription-actions";
import { useEffect, useMemo, useState } from "react";
import { getAllPacks } from "@/content-packs/registry";
import "@/content-packs"; // Register all packs

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  sendTime: z.number().min(0).max(23),
  timezone: z.string().min(1, "Missing timezone"),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export function SubscribeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packs = getAllPacks();
  const defaultPackKey = useMemo(() => packs[0]?.key || "", [packs]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      sendTime: 8,
      timezone: "",
    },
  });

  const sendTime = watch("sendTime");
  const timezone = watch("timezone");

  useEffect(() => {
    // Detect timezone from the browser
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      setValue("timezone", tz, { shouldValidate: true });
    }
  }, [setValue]);

  const onSubmit = async (data: SubscribeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Daily cadence for the base template: run at the selected hour.
      const cronExpression = hourToCron(data.sendTime);

      const result = await subscribeAction({
        email: data.email,
        packKey: defaultPackKey,
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-3 text-center animate-scale-in">
        {/* Animated check */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-olive/10">
          <svg
            className="h-7 w-7 text-olive"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2.5}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 0,
                animation: "check-draw 0.4s ease-out 0.2s both",
              }}
            />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We&apos;ve sent a confirmation email.
          <br />
          Click the link inside to start your journey.
        </p>
      </div>
    );
  }

  if (!defaultPackKey) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold">No content pack found</h2>
        <p className="text-muted-foreground">
          Add a pack in <code>src/content-packs</code> and register it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* timezone is auto-detected; keep it in the form payload */}
      <input type="hidden" {...register("timezone")} />

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          autoComplete="email"
          className="h-10"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sendTime" className="text-xs font-medium">
          Preferred delivery time
        </Label>
        <SendTimeSelector
          value={sendTime}
          onValueChange={(value) => setValue("sendTime", value)}
        />
        <p className="text-[11px] text-muted-foreground/70">
          {timezone ? (
            <>
              Delivering to{" "}
              <span className="font-medium text-muted-foreground">
                {timezone.replace(/_/g, " ")}
              </span>
            </>
          ) : (
            "Detecting your timezone…"
          )}
        </p>
        {errors.timezone && (
          <p className="text-xs text-destructive">{errors.timezone.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !timezone}
        className="w-full h-10"
        size="lg"
      >
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
            Subscribing…
          </span>
        ) : (
          "Start My Free Course"
        )}
      </Button>
    </form>
  );
}

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
        setError(typeof result.serverError === 'string' ? result.serverError : 'An error occurred');
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
      <div className="rounded-lg border p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Check your email!</h2>
        <p className="text-muted-foreground">
          We&apos;ve sent you a confirmation email. Click the link to activate your subscription.
        </p>
      </div>
    );
  }

  if (!defaultPackKey) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No content pack found</h2>
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

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sendTime">Delivery time</Label>
        <SendTimeSelector
          value={sendTime}
          onValueChange={(value) => setValue("sendTime", value)}
        />
        <p className="text-sm text-muted-foreground">
          Timezone: <span className="font-mono">{timezone || "Detecting…"}</span>
        </p>
        {errors.timezone && (
          <p className="text-sm text-destructive">{errors.timezone.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || !timezone} className="w-full">
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}

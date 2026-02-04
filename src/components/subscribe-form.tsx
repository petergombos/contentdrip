"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IntervalSelector, intervalToCron } from "@/components/interval-selector";
import { TimezoneSelector } from "@/components/timezone-selector";
import { SendTimeSelector, hourToCron } from "@/components/send-time-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subscribeAction } from "@/domains/subscriptions/actions/subscription-actions";
import { useState } from "react";
import { getAllPacks } from "@/content-packs/registry";
import "@/content-packs"; // Register all packs

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  packKey: z.string().min(1, "Please select a content pack"),
  timezone: z.string().min(1, "Please select a timezone"),
  interval: z.string().min(1, "Please select an interval"),
  sendTime: z.number().min(0).max(23),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export function SubscribeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packs = getAllPacks();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      packKey: packs[0]?.key || "",
      interval: "Daily",
      sendTime: 8,
    },
  });

  const interval = watch("interval");
  const sendTime = watch("sendTime");

  const onSubmit = async (data: SubscribeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert interval and send time to cron expression
      const baseCron = intervalToCron(data.interval);
      const cronExpression = hourToCron(data.sendTime, baseCron);

      const result = await subscribeAction({
        email: data.email,
        packKey: data.packKey,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="packKey">Content Pack</Label>
        <Select
          value={watch("packKey")}
          onValueChange={(value) => setValue("packKey", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a content pack" />
          </SelectTrigger>
          <SelectContent>
            {packs.map((pack) => (
              <SelectItem key={pack.key} value={pack.key}>
                {pack.name} - {pack.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.packKey && (
          <p className="text-sm text-destructive">{errors.packKey.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

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
          value={interval}
          onValueChange={(value) => setValue("interval", value)}
        />
        {errors.interval && (
          <p className="text-sm text-destructive">{errors.interval.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sendTime">Preferred Send Time</Label>
        <SendTimeSelector
          value={sendTime}
          onValueChange={(value) => setValue("sendTime", value)}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}

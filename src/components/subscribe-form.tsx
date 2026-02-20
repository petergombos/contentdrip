"use client";

import { FrequencySelector } from "@/components/frequency-selector";
import { SendTimeSelector } from "@/components/send-time-selector";
import { SuccessState } from "@/components/success-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllPacks } from "@/content-packs/registry";
import { subscribeAction } from "@/domains/subscriptions/actions/subscription-actions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { z } from "zod";

/* ── Schema ── */

const subscribeSchema = z.object({
  email: z.email("Please enter a valid email address"),
  packKey: z.string(),
  timezone: z.string().min(1, "Missing timezone"),
  frequency: z.string(),
  sendTime: z.number().int().min(0).max(23),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;
type FieldName = keyof SubscribeFormData;

/* ── Form Context ── */

interface SubscribeFormContextValue {
  form: UseFormReturn<SubscribeFormData>;
  isSubmitting: boolean;
  hasFixedFrequency: boolean;
  frequency: string | undefined;
  timezone: string;
  packKey: string;
}

const SubscribeFormContext = createContext<SubscribeFormContextValue | null>(
  null,
);

export function useSubscribeForm() {
  const ctx = useContext(SubscribeFormContext);
  if (!ctx)
    throw new Error(
      "SubscribeForm sub-components must be used within <SubscribeForm>",
    );
  return ctx;
}

/* ── Field Context ── */

const FieldContext = createContext<FieldName | null>(null);

function useFieldName() {
  return useContext(FieldContext);
}

/* ── Root ── */

interface SubscribeFormProps extends React.ComponentProps<"form"> {
  packKey?: string;
  frequency?: string;
}

export function SubscribeForm({
  packKey,
  frequency,
  children,
  className,
  ...props
}: SubscribeFormProps) {
  const [success, setSuccess] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const packs = getAllPacks();
  const defaultPackKey = useMemo(
    () => packKey || packs[0]?.key || "",
    [packKey, packs],
  );
  const hasFixedFrequency = !!frequency;

  const { form, handleSubmitWithAction } = useHookFormAction(
    subscribeAction,
    zodResolver(subscribeSchema),
    {
      formProps: {
        defaultValues: {
          packKey: defaultPackKey,
          sendTime: 8,
          timezone: "",
          frequency: frequency ?? "Daily",
        },
      },
      actionProps: {
        onSuccess: ({ data }) => {
          if (data?.alreadySubscribed) {
            setAlreadySubscribed(true);
          } else {
            setSuccess(true);
          }
        },
      },
    },
  );

  const timezone = form.watch("timezone");

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      form.setValue("timezone", tz, { shouldValidate: true });
    }
  }, [form]);

  if (alreadySubscribed) {
    return (
      <div data-testid="subscribe-already-subscribed">
        <SuccessState
          icon="mail"
          title="You're already subscribed"
          description="We've sent a management link to your email. Use it to view your subscription status, update preferences, or resume delivery."
        />
      </div>
    );
  }

  if (success) {
    return (
      <div data-testid="subscribe-success">
        <SuccessState
          icon="check"
          title="Check your inbox"
          description="We've sent a confirmation email. Click the link inside to start your journey."
        />
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

  const ctx: SubscribeFormContextValue = {
    form,
    isSubmitting: form.formState.isSubmitting,
    hasFixedFrequency,
    frequency,
    timezone,
    packKey: defaultPackKey,
  };

  return (
    <SubscribeFormContext.Provider value={ctx}>
      <form
        onSubmit={handleSubmitWithAction}
        className={cn("space-y-4", className)}
        data-testid="subscribe-form"
        {...props}
      >
        {/* timezone and packKey are auto-set; keep them in the form payload */}
        <input type="hidden" {...form.register("timezone")} />
        <input type="hidden" {...form.register("packKey")} />

        {children ?? (
          <>
            <SubscribeFormEmailField />
            <SubscribeFormFrequencyField />
            <SubscribeFormDeliveryTimeField />
            <SubscribeFormSubmit />
          </>
        )}
      </form>
    </SubscribeFormContext.Provider>
  );
}

/* ── Generic field primitives ── */

const FIELD_IDS: Record<FieldName, string> = {
  email: "email",
  packKey: "packKey",
  sendTime: "sendTime",
  timezone: "timezone",
  frequency: "frequency",
};

interface SubscribeFormFieldProps extends React.ComponentProps<"div"> {
  name: FieldName;
}

export function SubscribeFormField({
  name,
  className,
  ...props
}: SubscribeFormFieldProps) {
  return (
    <FieldContext.Provider value={name}>
      <div className={cn("space-y-1.5", className)} {...props} />
    </FieldContext.Provider>
  );
}

export function SubscribeFormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const fieldName = useFieldName();
  const htmlFor = fieldName ? FIELD_IDS[fieldName] : undefined;

  return (
    <Label
      htmlFor={htmlFor}
      className={cn("text-xs font-medium", className)}
      {...props}
    />
  );
}

export function SubscribeFormDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

export function SubscribeFormFieldError({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const fieldName = useFieldName();
  const { form } = useSubscribeForm();
  const { errors } = form.formState;

  const fieldError = fieldName ? errors[fieldName] : null;
  if (!fieldError) return null;

  return (
    <p className={cn("text-xs text-destructive", className)} {...props}>
      {props.children ?? fieldError.message}
    </p>
  );
}

/* ── Email input ── */

export function SubscribeFormEmailInput(
  props: React.ComponentProps<typeof Input>,
) {
  const { form } = useSubscribeForm();

  return (
    <Input
      id="email"
      type="email"
      placeholder="you@example.com"
      autoComplete="email"
      {...form.register("email")}
      data-testid="subscribe-email-input"
      {...props}
    />
  );
}

/* ── Frequency input ── */

export function SubscribeFormFrequencyInput({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children">) {
  const { form } = useSubscribeForm();

  return (
    <div className={className} {...props}>
      <FrequencySelector
        value={form.watch("frequency") || "Daily"}
        onValueChange={(value) => form.setValue("frequency", value)}
      />
    </div>
  );
}

/* ── Delivery time input ── */

export function SubscribeFormDeliveryTimeInput({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children">) {
  const { form } = useSubscribeForm();
  const sendTime = form.watch("sendTime");

  return (
    <div className={className} {...props}>
      <SendTimeSelector
        value={sendTime}
        onValueChange={(value) => form.setValue("sendTime", value)}
      />
    </div>
  );
}

/* ── Timezone display (useful inside delivery time label) ── */

export function SubscribeFormTimezone({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { timezone } = useSubscribeForm();

  if (!timezone)
    return (
      <span className={className} {...props}>
        Detecting your timezone…
      </span>
    );

  return (
    <span
      className={cn("font-medium text-muted-foreground", className)}
      {...props}
    >
      {props.children ?? `(${timezone.replace(/_/g, " ")})`}
    </span>
  );
}

/* ── Convenience field composites (default assembled fields) ── */

export function SubscribeFormEmailField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <SubscribeFormField name="email" className={className} {...props}>
      <SubscribeFormLabel>Email address</SubscribeFormLabel>
      <SubscribeFormEmailInput />
      <SubscribeFormFieldError />
    </SubscribeFormField>
  );
}

export function SubscribeFormFrequencyField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { hasFixedFrequency } = useSubscribeForm();

  if (hasFixedFrequency) return null;

  return (
    <SubscribeFormField name="frequency" className={className} {...props}>
      <SubscribeFormLabel>Frequency</SubscribeFormLabel>
      <SubscribeFormFrequencyInput />
    </SubscribeFormField>
  );
}

export function SubscribeFormDeliveryTimeField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <SubscribeFormField name="sendTime" className={className} {...props}>
      <SubscribeFormLabel>
        Preferred delivery time <SubscribeFormTimezone />
      </SubscribeFormLabel>
      <SubscribeFormDeliveryTimeInput />
      <SubscribeFormFieldError />
    </SubscribeFormField>
  );
}

/* ── Submit ── */

export function SubscribeFormSubmit({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isSubmitting, timezone } = useSubscribeForm();

  return (
    <Button
      type="submit"
      disabled={isSubmitting || !timezone}
      size="lg"
      className={cn("w-full", className)}
      data-testid="subscribe-submit"
      {...props}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Subscribing…
        </span>
      ) : (
        (children ?? "Start My Free Course")
      )}
    </Button>
  );
}

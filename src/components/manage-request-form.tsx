"use client";

import { SuccessState } from "@/components/success-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { requestManageLinkAction } from "@/domains/subscriptions/actions/subscription-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const requestManageLinkSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export function ManageRequestForm() {
  const [success, setSuccess] = useState(false);

  const { form, handleSubmitWithAction } = useHookFormAction(
    requestManageLinkAction,
    zodResolver(requestManageLinkSchema),
    {
      actionProps: {
        onSuccess: () => setSuccess(true),
      },
    },
  );

  if (success) {
    return (
      <div data-testid="manage-request-success">
        <SuccessState
          icon="mail"
          title="Check your email"
          description="If an active subscription exists for that address, we've sent a management link. It expires in 24 hours."
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitWithAction}
      className="space-y-4"
      data-testid="manage-request-form"
    >
      <Field>
        <FieldLabel htmlFor="email">Email address</FieldLabel>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          data-testid="manage-request-email-input"
          placeholder="you@example.com"
        />
        <FieldError errors={[form.formState.errors.email]} />
      </Field>

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full"
        size="lg"
        data-testid="manage-request-submit"
      >
        {form.formState.isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Sending…
          </span>
        ) : (
          "Send Management Link"
        )}
      </Button>
    </form>
  );
}

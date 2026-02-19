"use client";

import { SuccessState } from "@/components/success-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestManageLinkAction } from "@/domains/subscriptions/actions/subscription-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const requestManageLinkSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type RequestManageLinkFormData = z.infer<typeof requestManageLinkSchema>;

export function ManageRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestManageLinkFormData>({
    resolver: zodResolver(requestManageLinkSchema),
  });

  const onSubmit = async (data: RequestManageLinkFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await requestManageLinkAction({
        email: data.email,
      });

      if (result?.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "An error occurred",
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
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      data-testid="manage-request-form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          data-testid="manage-request-email-input"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
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
        data-testid="manage-request-submit"
      >
        {isSubmitting ? (
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

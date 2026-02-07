"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestManageLinkAction } from "@/domains/subscriptions/actions/subscription-actions";
import { useState } from "react";
import { getAllPacks } from "@/content-packs/registry";
import "@/content-packs"; // Register all packs

const requestManageLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  packKey: z.string().min(1, "Please select a content pack"),
});

type RequestManageLinkFormData = z.infer<typeof requestManageLinkSchema>;

export function ManageRequestForm() {
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
  } = useForm<RequestManageLinkFormData>({
    resolver: zodResolver(requestManageLinkSchema),
    defaultValues: {
      packKey: packs[0]?.key || "",
    },
  });

  const onSubmit = async (data: RequestManageLinkFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await requestManageLinkAction({
        email: data.email,
        packKey: data.packKey,
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
      <div className="py-4 text-center animate-scale-in">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-olive/10">
          <svg
            className="h-7 w-7 text-olive"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <polyline points="3 7 12 13 21 7" />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If an active subscription exists for that address, we&apos;ve sent a
          management link. It expires in 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          className="h-10"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {packs.length > 1 && (
        <div className="space-y-1.5">
          <Label htmlFor="packKey" className="text-xs font-medium">
            Course
          </Label>
          <Select
            value={watch("packKey")}
            onValueChange={(value) => setValue("packKey", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {packs.map((pack) => (
                <SelectItem key={pack.key} value={pack.key}>
                  {pack.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.packKey && (
            <p className="text-xs text-destructive">
              {errors.packKey.message}
            </p>
          )}
        </div>
      )}

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
            Sending…
          </span>
        ) : (
          "Send Management Link"
        )}
      </Button>
    </form>
  );
}

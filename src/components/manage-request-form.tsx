"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          We've sent you a link to manage your subscription.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {pack.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.packKey && (
          <p className="text-sm text-destructive">{errors.packKey.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Send Manage Link"}
      </Button>
    </form>
  );
}

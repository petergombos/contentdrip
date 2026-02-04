"use server";

import { actionClient } from "@/lib/actions/client";
import { z } from "zod";
import { createHash } from "crypto";
import { SubscriptionService } from "@/domains/subscriptions/services/subscription-service";
import { SubscriptionRepo } from "@/domains/subscriptions/repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { PostmarkAdapter } from "@/domains/mail/adapters/postmark/postmark-adapter";
// Ensure packs are registered
import "@/content-packs";

// Initialize services (singleton pattern)
const getSubscriptionService = () => {
  const repo = new SubscriptionRepo();
  const mailAdapter = new PostmarkAdapter({
    serverToken: process.env.POSTMARK_SERVER_TOKEN!,
    fromEmail: process.env.MAIL_FROM!,
    messageStream: process.env.POSTMARK_MESSAGE_STREAM,
  });
  const emailService = new EmailService(mailAdapter, process.env.APP_BASE_URL);
  return new SubscriptionService(repo, emailService);
};

const subscribeSchema = z.object({
  email: z.string().email(),
  packKey: z.string(),
  timezone: z.string(),
  cronExpression: z.string(),
});

export const subscribeAction = actionClient
  .schema(subscribeSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    const result = await service.subscribe(parsedInput);
    return { success: true, subscriptionId: result.subscriptionId };
  });

const confirmSchema = z.object({
  token: z.string(),
});

export const confirmSubscriptionAction = actionClient
  .schema(confirmSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    const tokenHash = createHash("sha256")
      .update(parsedInput.token)
      .digest("hex");
    await service.confirmSubscription(tokenHash);
    return { success: true };
  });

const requestManageLinkSchema = z.object({
  email: z.string().email(),
  packKey: z.string(),
});

export const requestManageLinkAction = actionClient
  .schema(requestManageLinkSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    await service.requestManageLink(parsedInput.email, parsedInput.packKey);
    return { success: true };
  });

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  timezone: z.string().optional(),
  cronExpression: z.string().optional(),
});

export const updateSubscriptionAction = actionClient
  .schema(updateSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    await service.updateSubscription(parsedInput.subscriptionId, {
      timezone: parsedInput.timezone,
      cronExpression: parsedInput.cronExpression,
    });
    return { success: true };
  });

const pauseFromEmailSchema = z.object({
  subscriptionId: z.string(),
  token: z.string(),
});

export const pauseFromEmailAction = actionClient
  .schema(pauseFromEmailSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    await service.pauseFromEmail(
      parsedInput.subscriptionId,
      parsedInput.token
    );
    return { success: true };
  });

const stopFromEmailSchema = z.object({
  subscriptionId: z.string(),
  token: z.string(),
});

export const stopFromEmailAction = actionClient
  .schema(stopFromEmailSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    await service.stopFromEmail(parsedInput.subscriptionId, parsedInput.token);
    return { success: true };
  });

const resumeSubscriptionSchema = z.object({
  subscriptionId: z.string(),
});

export const resumeSubscriptionAction = actionClient
  .schema(resumeSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    const service = getSubscriptionService();
    await service.resumeSubscription(parsedInput.subscriptionId);
    return { success: true };
  });

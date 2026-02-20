import CronExpressionParser from "cron-parser";
import { SubscriptionRepo } from "../repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { getPackByKey, getNextStep } from "@/content-packs/registry";
import { readFileSync } from "fs";
import { join } from "path";
import React from "react";
import { parseMarkdown } from "@/lib/markdown/renderer";
import { ContentMarkdownEmail } from "@/emails/components/content-markdown-email";
import { renderEmail } from "@/emails/render";
import { SubscriptionStatus } from "../model/types";
import { TokenType } from "../model/types";
import type { Subscription } from "../model/types";
// Ensure packs are registered
import "@/content-packs";

const DEFAULT_BATCH_SIZE = 5;

export class SchedulerService {
  constructor(
    private repo: SubscriptionRepo,
    private emailService: EmailService
  ) {}

  /**
   * Send emails for all due subscriptions, processing in parallel batches.
   */
  async sendDueSubscriptions(options?: {
    batchSize?: number;
  }): Promise<{
    sent: number;
    errors: number;
  }> {
    const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    const activeSubscriptions = await this.repo.findActiveSubscriptions();
    const now = new Date();
    const fastTestStepMinutes = this.getFastTestStepMinutes();
    let sent = 0;
    let errors = 0;

    // Process in batches
    for (let i = 0; i < activeSubscriptions.length; i += batchSize) {
      const batch = activeSubscriptions.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map((sub) =>
          this.processSubscription(sub, now, fastTestStepMinutes)
        )
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          if (result.value === "sent") sent++;
        } else {
          errors++;
          const subscription = batch[j];
          console.error(
            `Error sending email for subscription ${subscription.id}:`,
            result.reason
          );

          await this.repo.logSend({
            subscriptionId: subscription.id,
            packKey: subscription.packKey,
            stepSlug:
              getNextStep(subscription.packKey, subscription.currentStepIndex)
                ?.slug || "unknown",
            provider: "postmark",
            status: "FAILED",
            error:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason),
          });
        }
      }
    }

    return { sent, errors };
  }

  /**
   * Process a batch of subscriptions by ID. Used by the fan-out worker endpoint.
   * Loads full subscriptions, then processes in sub-batches of 5.
   */
  async processBatch(
    subscriptionIds: string[],
    now: Date,
    fastTestStepMinutes: number | null
  ): Promise<{
    sent: number;
    skipped: number;
    completed: number;
    errors: number;
    failures: { subscriptionId: string; error: string }[];
  }> {
    if (subscriptionIds.length === 0) {
      return { sent: 0, skipped: 0, completed: 0, errors: 0, failures: [] };
    }

    const subs = await this.repo.findByIds(subscriptionIds);
    let sent = 0;
    let skipped = 0;
    let completed = 0;
    let errors = 0;
    const failures: { subscriptionId: string; error: string }[] = [];

    for (let i = 0; i < subs.length; i += DEFAULT_BATCH_SIZE) {
      const batch = subs.slice(i, i + DEFAULT_BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((sub) =>
          this.processSubscription(sub, now, fastTestStepMinutes)
        )
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          switch (result.value) {
            case "sent":
              sent++;
              break;
            case "skipped":
              skipped++;
              break;
            case "completed":
              completed++;
              break;
          }
        } else {
          errors++;
          const sub = batch[j];
          const errorMsg =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);

          console.error(
            `Error processing subscription ${sub.id}:`,
            result.reason
          );
          failures.push({ subscriptionId: sub.id, error: errorMsg });

          await this.repo.logSend({
            subscriptionId: sub.id,
            packKey: sub.packKey,
            stepSlug:
              getNextStep(sub.packKey, sub.currentStepIndex)?.slug ||
              "unknown",
            provider: "postmark",
            status: "FAILED",
            error: errorMsg,
          });
        }
      }
    }

    return { sent, skipped, completed, errors, failures };
  }

  /**
   * Process a single subscription: check if due, check idempotency, send email.
   */
  async processSubscription(
    subscription: Subscription,
    now: Date,
    fastTestStepMinutes: number | null
  ): Promise<"sent" | "skipped" | "completed"> {
    const isDue = fastTestStepMinutes
      ? await this.isDueByElapsedMinutes(
          subscription.id,
          subscription.updatedAt,
          now,
          fastTestStepMinutes
        )
      : await this.isDueByCron(
          subscription.id,
          subscription.cronExpression,
          subscription.timezone,
          subscription.updatedAt,
          now
        );

    if (!isDue) {
      return "skipped";
    }

    const nextStep = getNextStep(
      subscription.packKey,
      subscription.currentStepIndex
    );
    if (!nextStep) {
      await this.repo.update(subscription.id, {
        status: SubscriptionStatus.COMPLETED,
      });
      return "completed";
    }

    // Check if already sent (idempotency)
    const alreadySent = await this.repo.hasSentStep(
      subscription.id,
      nextStep.slug
    );
    if (alreadySent) {
      await this.repo.update(subscription.id, {
        currentStepIndex: subscription.currentStepIndex + 1,
      });
      return "skipped";
    }

    // Send the email
    await this.sendStepEmail(subscription, nextStep);
    return "sent";
  }

  /**
   * Check if a cron occurrence has passed since the last email was sent.
   *
   * Instead of a fragile 1-minute window, we compare the most recent cron
   * match against the last successful send time. This means a missed 8:00 AM
   * window is retried at 8:01, 8:02, … until the email goes out.
   */
  private async isDueByCron(
    subscriptionId: string,
    cronExpression: string,
    timezone: string,
    fallbackAnchor: Date,
    now: Date
  ): Promise<boolean> {
    try {
      const interval = CronExpressionParser.parse(cronExpression, {
        currentDate: now,
        tz: timezone,
      });

      const prevMatchTime = interval.prev().getTime();

      const lastSentAt =
        await this.repo.getLastSuccessfulSendAt(subscriptionId);
      const anchor = lastSentAt ?? fallbackAnchor;

      // Due if a cron match occurred after the last send (or activation)
      return prevMatchTime > anchor.getTime();
    } catch (error) {
      console.error(`Error parsing cron expression ${cronExpression}:`, error);
      return false;
    }
  }

  /**
   * Fast test mode: move forward once enough minutes have elapsed.
   */
  private async isDueByElapsedMinutes(
    subscriptionId: string,
    fallbackLastUpdatedAt: Date,
    now: Date,
    stepMinutes: number
  ): Promise<boolean> {
    const lastSentAt =
      await this.repo.getLastSuccessfulSendAt(subscriptionId);
    const anchor = lastSentAt ?? fallbackLastUpdatedAt;

    const elapsedMs = now.getTime() - anchor.getTime();
    return elapsedMs >= stepMinutes * 60 * 1000;
  }

  /**
   * Fast-test scheduling.
   *
   * DRIP_TIME_SCALE is the multiplier vs real time.
   * Example: 144 means 1 day (1440 minutes) becomes 10 minutes.
   */
  getFastTestStepMinutes(): number | null {
    const scaleRaw = process.env.DRIP_TIME_SCALE;
    if (scaleRaw !== undefined) {
      const scale = Number.parseFloat(scaleRaw);
      const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 144;
      const minutesPerDay = 24 * 60;
      const minutes = minutesPerDay / safeScale;
      return Math.max(1, Math.round(minutes));
    }

    return null;
  }

  /**
   * Send email for a specific step
   */
  private async sendStepEmail(
    subscription: {
      id: string;
      email: string;
      packKey: string;
      currentStepIndex: number;
    },
    step: { slug: string; emailFile: string }
  ): Promise<void> {
    const pack = getPackByKey(subscription.packKey);
    if (!pack) {
      throw new Error(`Pack ${subscription.packKey} not found`);
    }

    // Load email markdown
    const emailPath = join(
      process.cwd(),
      "src/content-packs",
      subscription.packKey,
      "emails",
      step.emailFile
    );
    let markdown = readFileSync(emailPath, "utf-8");

    // Build URLs
    const pauseToken = this.emailService.createSignedToken(
      subscription.id,
      TokenType.PAUSE
    );
    const stopToken = this.emailService.createSignedToken(
      subscription.id,
      TokenType.STOP
    );
    const { token: manageToken } = await this.emailService.createToken(
      subscription.id,
      TokenType.MANAGE
    );

    const companionUrl = this.emailService.buildCompanionPageUrl(
      subscription.packKey,
      step.slug
    );
    const manageUrl = this.emailService.buildManageUrl(manageToken);
    const pauseUrl = this.emailService.buildPauseUrl(
      subscription.id,
      pauseToken
    );
    const stopUrl = this.emailService.buildStopUrl(
      subscription.id,
      stopToken
    );

    // Replace placeholders BEFORE parsing markdown to HTML
    markdown = markdown.replace("{{companionUrl}}", companionUrl);
    markdown = markdown.replace("{{manageUrl}}", manageUrl);
    markdown = markdown.replace("{{pauseUrl}}", pauseUrl);
    markdown = markdown.replace("{{stopUrl}}", stopUrl);
    markdown = markdown.replaceAll("{{assetUrl}}", this.emailService.buildAssetUrl(subscription.packKey));

    const parsed = parseMarkdown(markdown);

    const rendered = await renderEmail(
      React.createElement(ContentMarkdownEmail, {
        title: parsed.frontmatter.subject || "Your daily message",
        preview: parsed.frontmatter.preview,
        html: parsed.html,
        footer: { unsubscribeUrl: stopUrl, manageUrl, pauseUrl },
        EmailShell: pack.EmailShell,
        stepIndex: subscription.currentStepIndex,
        totalSteps: pack.steps.length,
      })
    );

    // Send email
    const result = await this.emailService.sendEmail({
      to: subscription.email,
      subject: parsed.frontmatter.subject || "Your daily message",
      html: rendered.html,
      text: rendered.text,
      tag: `content-${subscription.packKey}-${step.slug}`,
      unsubscribeUrl: stopUrl,
      pauseUrl,
    });

    // Log successful send
    await this.repo.logSend({
      subscriptionId: subscription.id,
      packKey: subscription.packKey,
      stepSlug: step.slug,
      provider: "postmark",
      providerMessageId: result.providerMessageId,
      status: "SUCCESS",
    });

    // Advance step index
    await this.repo.update(subscription.id, {
      currentStepIndex: subscription.currentStepIndex + 1,
    });
  }
}

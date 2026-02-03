import CronExpressionParser from "cron-parser";
import { toZonedTime } from "date-fns-tz";
import { SubscriptionRepo } from "../repo/subscription-repo";
import { EmailService } from "@/domains/mail/services/email-service";
import { getPackByKey, getNextStep } from "@/content-packs/registry";
import { readFileSync } from "fs";
import { join } from "path";
import { parseMarkdown } from "@/lib/markdown/renderer";
import { SubscriptionStatus } from "../model/types";
import { TokenType } from "../model/types";
// Ensure packs are registered
import "@/content-packs";

export class SchedulerService {
  constructor(
    private repo: SubscriptionRepo,
    private emailService: EmailService
  ) {}

  /**
   * Send emails for all due subscriptions
   */
  async sendDueSubscriptions(): Promise<{
    sent: number;
    errors: number;
  }> {
    const activeSubscriptions = await this.repo.findActiveSubscriptions();
    const now = new Date();
    let sent = 0;
    let errors = 0;

    for (const subscription of activeSubscriptions) {
      try {
        const isDue = await this.isDue(subscription.cronExpression, subscription.timezone, now);
        
        if (!isDue) {
          continue;
        }

        // Check idempotency - has this step already been sent?
        const nextStep = getNextStep(subscription.packKey, subscription.currentStepIndex);
        if (!nextStep) {
          // All steps completed
          await this.repo.update(subscription.id, {
            status: SubscriptionStatus.COMPLETED,
          });
          continue;
        }

        // Check if already sent (idempotency)
        const alreadySent = await this.repo.hasSentStep(
          subscription.id,
          nextStep.slug
        );
        if (alreadySent) {
          // Already sent, advance step index
          await this.repo.update(subscription.id, {
            currentStepIndex: subscription.currentStepIndex + 1,
          });
          continue;
        }

        // Send the email
        await this.sendStepEmail(subscription, nextStep);
        sent++;
      } catch (error) {
        console.error(
          `Error sending email for subscription ${subscription.id}:`,
          error
        );
        errors++;

        // Log the error
        await this.repo.logSend({
          subscriptionId: subscription.id,
          packKey: subscription.packKey,
          stepSlug: getNextStep(subscription.packKey, subscription.currentStepIndex)?.slug || "unknown",
          provider: "postmark",
          status: "FAILED",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { sent, errors };
  }

  /**
   * Check if a cron expression matches the current time in the given timezone
   */
  private async isDue(
    cronExpression: string,
    timezone: string,
    now: Date
  ): Promise<boolean> {
    try {
      // Get current time in subscription's timezone
      const zonedNow = toZonedTime(now, timezone);

      // Parse cron expression with timezone
      // @ts-expect-error - cron-parser types don't match runtime
      const interval = CronExpressionParser.parseExpression(cronExpression, {
        tz: timezone,
      });

      // Get the previous scheduled time
      const prev = interval.prev();
      const prevTime = prev.getTime();

      // Check if the previous scheduled time is within the last minute
      // (allowing for cron job running every minute)
      const diff = zonedNow.getTime() - prevTime;
      const oneMinute = 60 * 1000;

      return diff >= 0 && diff < oneMinute;
    } catch (error) {
      console.error(`Error parsing cron expression ${cronExpression}:`, error);
      return false;
    }
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
    const pauseUrl = this.emailService.buildPauseUrl(subscription.id, pauseToken);
    const stopUrl = this.emailService.buildStopUrl(subscription.id, stopToken);

    // Replace placeholders BEFORE parsing markdown to HTML
    markdown = markdown.replace("{{companionUrl}}", companionUrl);
    markdown = markdown.replace("{{manageUrl}}", manageUrl);
    markdown = markdown.replace("{{pauseUrl}}", pauseUrl);
    markdown = markdown.replace("{{stopUrl}}", stopUrl);

    const parsed = parseMarkdown(markdown);

    // Send email
    const result = await this.emailService.sendEmail({
      to: subscription.email,
      subject: parsed.frontmatter.subject || "Your daily message",
      html: parsed.html,
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

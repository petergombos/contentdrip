import React from "react";
import { getPackByKey } from "@/content-packs/registry";
import { EmailService } from "@/domains/mail/services/email-service";
import { parseMarkdown } from "@/lib/markdown/renderer";
import { ContentMarkdownEmail } from "@/emails/content-markdown-email";
import { renderEmail } from "@/emails/render";
import { readFileSync } from "fs";
import { join } from "path";
import { SubscriptionStatus, TokenType } from "../model/types";
import { SubscriptionRepo } from "../repo/subscription-repo";
// Ensure packs are registered
import "@/content-packs";

export class SubscriptionService {
  constructor(
    private repo: SubscriptionRepo,
    private emailService: EmailService
  ) {}

  /**
   * Create a new subscription and send confirmation email
   */
  async subscribe(data: {
    email: string;
    packKey: string;
    timezone: string;
    cronExpression: string;
  }): Promise<{ subscriptionId: string; confirmToken: string }> {
    // Check if pack exists
    const pack = getPackByKey(data.packKey);
    if (!pack) {
      throw new Error(`Content pack "${data.packKey}" not found`);
    }

    // Check for existing subscription
    const existing = await this.repo.findByEmailAndPack(
      data.email,
      data.packKey
    );

    if (existing) {
      // Resend confirmation if pending
      if (existing.status === SubscriptionStatus.PENDING_CONFIRM) {
        const { token } = await this.emailService.createToken(
          existing.id,
          TokenType.CONFIRM
        );
        await this.sendConfirmationEmail(existing.id, data.email, data.packKey, token);
        return { subscriptionId: existing.id, confirmToken: token };
      }
      throw new Error("Subscription already exists");
    }

    // Create subscription
    const subscription = await this.repo.create(data);

    // Create confirmation token
    const { token } = await this.emailService.createToken(
      subscription.id,
      TokenType.CONFIRM
    );

    // Send confirmation email (pass the token we just created)
    await this.sendConfirmationEmail(subscription.id, data.email, data.packKey, token);

    return { subscriptionId: subscription.id, confirmToken: token };
  }

  /**
   * Confirm subscription and send welcome email
   */
  async confirmSubscription(tokenHash: string): Promise<void> {
    const result = await this.emailService.verifyAndConsumeToken(
      tokenHash,
      TokenType.CONFIRM
    );

    if (!result) {
      throw new Error("Invalid or expired confirmation token");
    }

    const subscription = await this.repo.findById(result.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.PENDING_CONFIRM) {
      throw new Error("Subscription already confirmed");
    }

    // Activate subscription
    await this.repo.update(subscription.id, {
      status: SubscriptionStatus.ACTIVE,
    });

    // Send welcome email
    await this.sendWelcomeEmail(subscription.id, subscription.email, subscription.packKey);
  }

  /**
   * Pause subscription (from email link, no verification needed)
   */
  async pauseFromEmail(
    subscriptionId: string,
    signedToken: string
  ): Promise<void> {
    const subscription = await this.repo.findById(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Verify signed token
    const isValid = this.emailService.verifySignedToken(
      signedToken,
      subscriptionId,
      TokenType.PAUSE
    );

    if (!isValid) {
      throw new Error("Invalid token");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("Subscription is not active");
    }

    await this.repo.update(subscription.id, {
      status: SubscriptionStatus.PAUSED,
    });
  }

  /**
   * Stop/unsubscribe (from email link, no verification needed)
   */
  async stopFromEmail(
    subscriptionId: string,
    signedToken: string
  ): Promise<void> {
    const subscription = await this.repo.findById(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Verify signed token
    const isValid = this.emailService.verifySignedToken(
      signedToken,
      subscriptionId,
      TokenType.STOP
    );

    if (!isValid) {
      throw new Error("Invalid token");
    }

    await this.repo.update(subscription.id, {
      status: SubscriptionStatus.STOPPED,
    });
  }

  /**
   * Request manage link
   */
  async requestManageLink(
    email: string,
    packKey: string
  ): Promise<{ manageToken: string }> {
    const subscription = await this.repo.findByEmailAndPack(email, packKey);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const { token } = await this.emailService.createToken(
      subscription.id,
      TokenType.MANAGE
    );

    const manageUrl = this.emailService.buildManageUrl(token);
    await this.sendManageLinkEmail(subscription.email, manageUrl);

    return { manageToken: token };
  }

  /**
   * Update subscription preferences
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      timezone?: string;
      cronExpression?: string;
    }
  ): Promise<void> {
    const subscription = await this.repo.findById(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await this.repo.update(subscription.id, updates);
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.repo.findById(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error("Subscription is not paused");
    }

    await this.repo.update(subscription.id, {
      status: SubscriptionStatus.ACTIVE,
    });
  }

  /**
   * Send confirmation email
   */
  private async sendConfirmationEmail(
    subscriptionId: string,
    email: string,
    packKey: string,
    token: string // Use the token passed in instead of creating a new one
  ): Promise<void> {
    const pack = getPackByKey(packKey);
    if (!pack) {
      throw new Error(`Pack ${packKey} not found`);
    }

    // Load confirm email markdown
    const emailPath = join(
      process.cwd(),
      "src/content-packs",
      packKey,
      "emails/confirm.md"
    );
    let markdown = readFileSync(emailPath, "utf-8");

    // Use the token passed in (don't create a new one)
    const confirmUrl = this.emailService.buildConfirmUrl(token);

    // Replace placeholders BEFORE parsing markdown to HTML
    markdown = markdown.replace("{{confirmUrl}}", confirmUrl);

    const parsed = parseMarkdown(markdown);

    const rendered = await renderEmail(
      React.createElement(ContentMarkdownEmail, {
        title: parsed.frontmatter.subject || "Confirm your subscription",
        preview: parsed.frontmatter.preview,
        html: parsed.html,
        EmailShell: pack.EmailShell,
      })
    );

    await this.emailService.sendEmail({
      to: email,
      subject: parsed.frontmatter.subject || "Confirm your subscription",
      html: rendered.html,
      text: rendered.text,
      tag: `confirm-${packKey}`,
    });
  }

  /**
   * Send welcome email
   */
  private async sendWelcomeEmail(
    subscriptionId: string,
    email: string,
    packKey: string
  ): Promise<void> {
    const pack = getPackByKey(packKey);
    if (!pack) {
      throw new Error(`Pack ${packKey} not found`);
    }

    const step = pack.steps[0]; // Welcome is first step
    if (!step) {
      throw new Error("Welcome step not found");
    }

    // Load welcome email markdown
    const emailPath = join(
      process.cwd(),
      "src/content-packs",
      packKey,
      "emails",
      step.emailFile
    );
    let markdown = readFileSync(emailPath, "utf-8");

    // Build URLs
    const pauseToken = this.emailService.createSignedToken(
      subscriptionId,
      TokenType.PAUSE
    );
    const stopToken = this.emailService.createSignedToken(
      subscriptionId,
      TokenType.STOP
    );
    const { token: manageToken } = await this.emailService.createToken(
      subscriptionId,
      TokenType.MANAGE
    );

    const companionUrl = this.emailService.buildCompanionPageUrl(
      packKey,
      step.slug
    );
    const manageUrl = this.emailService.buildManageUrl(manageToken);
    const pauseUrl = this.emailService.buildPauseUrl(subscriptionId, pauseToken);
    const stopUrl = this.emailService.buildStopUrl(subscriptionId, stopToken);

    // Replace placeholders BEFORE parsing markdown to HTML
    markdown = markdown.replace("{{companionUrl}}", companionUrl);
    markdown = markdown.replace("{{manageUrl}}", manageUrl);
    markdown = markdown.replace("{{pauseUrl}}", pauseUrl);
    markdown = markdown.replace("{{stopUrl}}", stopUrl);

    const parsed = parseMarkdown(markdown);

    const rendered = await renderEmail(
      React.createElement(ContentMarkdownEmail, {
        title: parsed.frontmatter.subject || "Welcome",
        preview: parsed.frontmatter.preview,
        html: parsed.html,
        footer: { unsubscribeUrl: stopUrl, manageUrl, pauseUrl },
        EmailShell: pack.EmailShell,
      })
    );

    const result = await this.emailService.sendEmail({
      to: email,
      subject: parsed.frontmatter.subject || "Welcome",
      html: rendered.html,
      text: rendered.text,
      tag: `welcome-${packKey}`,
      unsubscribeUrl: stopUrl,
      pauseUrl,
    });

    // Persist the welcome send + advance step index.
    // Welcome is sent immediately on confirmation and should not be re-sent by the scheduler.
    await this.repo.logSend({
      subscriptionId,
      packKey,
      stepSlug: step.slug,
      provider: "postmark",
      providerMessageId: result.providerMessageId,
      status: "SUCCESS",
    });

    await this.repo.update(subscriptionId, {
      currentStepIndex: 1,
    });
  }

  /**
   * Send manage link email
   */
  private async sendManageLinkEmail(
    email: string,
    manageUrl: string
  ): Promise<void> {
    const { ManageLinkEmail } = await import("@/emails/manage-link");
    const { renderEmail } = await import("@/emails/render");

    const rendered = await renderEmail(
      React.createElement(ManageLinkEmail, { manageUrl })
    );

    await this.emailService.sendEmail({
      to: email,
      subject: "Manage your subscription",
      html: rendered.html,
      text: rendered.text,
      tag: "manage-link",
    });
  }
}

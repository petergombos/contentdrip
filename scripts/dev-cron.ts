#!/usr/bin/env node

/**
 * Local development cron script
 * Run this to test the scheduler without Vercel Cron
 * Usage: bun run scripts/dev-cron.ts
 */

import { config } from "dotenv";
import { PostmarkAdapter } from "../src/domains/mail/adapters/postmark/postmark-adapter";
import { EmailService } from "../src/domains/mail/services/email-service";
import { SubscriptionRepo } from "../src/domains/subscriptions/repo/subscription-repo";
import { SchedulerService } from "../src/domains/subscriptions/services/scheduler-service";
// Ensure packs are registered
import "../src/content-packs";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const CRON_SECRET = process.env.CRON_SECRET || "dev-secret";

async function runCron() {
  console.log("Running cron job...");
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    // Initialize services
    const repo = new SubscriptionRepo();
    const mailAdapter = new PostmarkAdapter({
      serverToken: process.env.POSTMARK_SERVER_TOKEN!,
      fromEmail: process.env.MAIL_FROM!,
      messageStream: process.env.POSTMARK_MESSAGE_STREAM,
    });
    const emailService = new EmailService(
      mailAdapter,
      process.env.APP_BASE_URL || "http://localhost:3000"
    );
    const scheduler = new SchedulerService(repo, emailService);

    // Send due subscriptions
    const result = await scheduler.sendDueSubscriptions();

    console.log(`✅ Sent: ${result.sent}, Errors: ${result.errors}`);
  } catch (error) {
    console.error("❌ Error running cron:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCron();
}

export { runCron };

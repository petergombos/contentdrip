import type { MailAdapter } from "./ports/mail-adapter";
import { PostmarkAdapter } from "./adapters/postmark/postmark-adapter";
import { ResendAdapter } from "./adapters/resend/resend-adapter";
import { TestMailAdapter } from "./adapters/test/test-adapter";

/**
 * Create the appropriate mail adapter based on environment.
 *
 * Priority:
 *   1. E2E_TEST=true → TestMailAdapter (captures emails to file)
 *   2. RESEND_API_KEY set → ResendAdapter
 *   3. POSTMARK_SERVER_TOKEN set → PostmarkAdapter (default)
 */
export function createMailAdapter(config?: {
  serverToken?: string;
  fromEmail?: string;
  messageStream?: string;
  resendApiKey?: string;
}): MailAdapter {
  if (process.env.E2E_TEST === "true") {
    return new TestMailAdapter();
  }

  const resendApiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
  if (resendApiKey) {
    return new ResendAdapter({
      apiKey: resendApiKey,
      fromEmail: config?.fromEmail || process.env.MAIL_FROM!,
    });
  }

  return new PostmarkAdapter({
    serverToken: config?.serverToken || process.env.POSTMARK_SERVER_TOKEN!,
    fromEmail: config?.fromEmail || process.env.MAIL_FROM!,
    messageStream: config?.messageStream || process.env.POSTMARK_MESSAGE_STREAM,
  });
}

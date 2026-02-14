import { Resend } from "resend";
import type { MailAdapter } from "../../ports/mail-adapter";

export class ResendAdapter implements MailAdapter {
  private client: Resend;
  private fromEmail: string;

  constructor(config: { apiKey: string; fromEmail: string }) {
    this.client = new Resend(config.apiKey);
    this.fromEmail = config.fromEmail;
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    tag?: string;
    headers?: Record<string, string>;
  }): Promise<{ providerMessageId?: string }> {
    try {
      const { data, error } = await this.client.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        tags: options.tag ? [{ name: "category", value: options.tag }] : undefined,
        headers: options.headers,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        providerMessageId: data?.id,
      };
    } catch (error) {
      throw new Error(
        `Failed to send email via Resend: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

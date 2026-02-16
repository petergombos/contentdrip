import { ServerClient, Models } from "postmark";
import type { MailAdapter } from "../../ports/mail-adapter";

export class PostmarkAdapter implements MailAdapter {
  private client: ServerClient;
  private fromEmail: string;
  private messageStream?: string;

  constructor(config: {
    serverToken: string;
    fromEmail: string;
    messageStream?: string;
  }) {
    this.client = new ServerClient(config.serverToken);
    this.fromEmail = config.fromEmail;
    this.messageStream = config.messageStream;
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
      const emailOptions = {
        From: this.fromEmail,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text,
        Tag: options.tag,
        MessageStream: this.messageStream,
      };

      if (options.headers) {
        (emailOptions as Record<string, unknown>).Headers =
          Object.entries(options.headers).map(
            ([name, value]) => new Models.Header(name, value)
          );
      }

      const response = await this.client.sendEmail(emailOptions);

      return {
        providerMessageId: response.MessageID,
      };
    } catch (error) {
      throw new Error(
        `Failed to send email via Postmark: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

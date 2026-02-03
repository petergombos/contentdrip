export interface MailAdapter {
  send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    tag?: string;
    headers?: Record<string, string>;
  }): Promise<{ providerMessageId?: string }>;
}

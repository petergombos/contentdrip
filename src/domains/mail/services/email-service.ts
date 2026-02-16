import { createHash, randomBytes } from "crypto";
import { db } from "@/db";
import { tokens } from "@/db/subscription-schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import type { MailAdapter } from "../ports/mail-adapter";
import type { TokenType } from "@/domains/subscriptions/model/types";
import { generateUUID } from "@/lib/uuid";
import { resolveBaseUrl } from "@/lib/base-url";

export class EmailService {
  private baseUrl: string;

  constructor(private mailAdapter: MailAdapter, baseUrl?: string) {
    // Prefer explicit baseUrl (if provided), otherwise derive from Vercel env.
    // Avoid defaulting to APP_BASE_URL because it can accidentally be set to the prod domain in preview.
    this.baseUrl = resolveBaseUrl(baseUrl);
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Hash a token for storage
   */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * Create a signed token for email links (no DB lookup needed)
   * Format: base64(token:timestamp:signature)
   */
  createSignedToken(
    subscriptionId: string,
    tokenType: TokenType,
    expiresInMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
  ): string {
    const token = this.generateToken();
    const expiresAt = Date.now() + expiresInMs;
    const signature = createHash("sha256")
      .update(`${token}:${subscriptionId}:${tokenType}:${expiresAt}`)
      .digest("hex");

    const payload = `${token}:${expiresAt}:${signature}`;
    return Buffer.from(payload).toString("base64url");
  }

  /**
   * Verify a signed token
   */
  verifySignedToken(
    signedToken: string,
    subscriptionId: string,
    tokenType: TokenType
  ): boolean {
    try {
      const payload = Buffer.from(signedToken, "base64url").toString("utf-8");
      const [token, expiresAtStr, signature] = payload.split(":");

      const expiresAt = parseInt(expiresAtStr, 10);
      if (Date.now() > expiresAt) {
        return false;
      }

      const expectedSignature = createHash("sha256")
        .update(`${token}:${subscriptionId}:${tokenType}:${expiresAt}`)
        .digest("hex");

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Create a database-stored token (for manage links that need verification)
   */
  async createToken(
    subscriptionId: string,
    tokenType: TokenType,
    expiresInMs: number = 24 * 60 * 60 * 1000 // 24 hours default
  ): Promise<{ token: string; tokenHash: string }> {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await db.insert(tokens).values({
      id: generateUUID(),
      subscriptionId,
      tokenHash,
      tokenType,
      expiresAt,
    });

    return { token, tokenHash };
  }

  /**
   * Verify a database token without consuming it.
   * Used for pages that may re-render (e.g. manage page).
   */
  async verifyToken(
    tokenHash: string,
    tokenType: TokenType
  ): Promise<{ subscriptionId: string } | null> {
    const tokenRecord = await db.query.tokens.findFirst({
      where: and(
        eq(tokens.tokenHash, tokenHash),
        eq(tokens.tokenType, tokenType),
        gt(tokens.expiresAt, new Date())
      ),
    });

    if (!tokenRecord) {
      return null;
    }

    return { subscriptionId: tokenRecord.subscriptionId };
  }

  /**
   * Verify and consume a database token
   */
  async verifyAndConsumeToken(
    tokenHash: string,
    tokenType: TokenType
  ): Promise<{ subscriptionId: string } | null> {
    const tokenRecord = await db.query.tokens.findFirst({
      where: and(
        eq(tokens.tokenHash, tokenHash),
        eq(tokens.tokenType, tokenType),
        gt(tokens.expiresAt, new Date()),
        isNull(tokens.usedAt)
      ),
    });

    if (!tokenRecord) {
      return null;
    }

    // Mark as used
    await db
      .update(tokens)
      .set({ usedAt: new Date() })
      .where(eq(tokens.id, tokenRecord.id));

    return { subscriptionId: tokenRecord.subscriptionId };
  }

  /**
   * Build confirmation URL
   */
  buildConfirmUrl(token: string): string {
    return `${this.baseUrl}/confirm/${token}`;
  }

  /**
   * Build manage URL
   */
  buildManageUrl(token: string): string {
    return `${this.baseUrl}/manage/${token}`;
  }

  /**
   * Build pause URL (signed token)
   */
  buildPauseUrl(subscriptionId: string, signedToken: string): string {
    return `${this.baseUrl}/api/pause?token=${signedToken}&id=${subscriptionId}`;
  }

  /**
   * Build stop/unsubscribe URL (signed token)
   */
  buildStopUrl(subscriptionId: string, signedToken: string): string {
    return `${this.baseUrl}/api/stop?token=${signedToken}&id=${subscriptionId}`;
  }

  /**
   * Build companion page URL
   */
  buildCompanionPageUrl(packKey: string, slug: string): string {
    return `${this.baseUrl}/p/${packKey}/${slug}`;
  }

  /**
   * Build asset base URL for a content pack
   */
  buildAssetUrl(packKey: string): string {
    return `${this.baseUrl}/api/content-assets/${packKey}`;
  }

  /**
   * Send email with unsubscribe headers
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    tag?: string;
    unsubscribeUrl?: string;
    pauseUrl?: string;
  }): Promise<{ providerMessageId?: string }> {
    const headers: Record<string, string> = {};

    if (options.unsubscribeUrl) {
      headers["List-Unsubscribe"] = `<${options.unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    return this.mailAdapter.send({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      tag: options.tag,
      headers,
    });
  }
}

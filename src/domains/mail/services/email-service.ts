import { createHash, randomBytes } from "crypto";
import { db } from "@/db";
import { tokens } from "@/db/subscription-schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import type { MailAdapter } from "../ports/mail-adapter";
import type { TokenType } from "@/domains/subscriptions/model/types";
import { generateUUID } from "@/lib/uuid";

function resolveBaseUrl(explicit?: string): string {
  // Prefer explicit config, but support Vercel preview/prod without hardcoding.
  // Note: Vercel does not interpolate "$VARS" inside env var values.
  if (explicit && explicit.includes("$VERCEL_URL")) {
    explicit = undefined;
  }
  if (explicit && explicit.includes("${VERCEL_URL}")) {
    explicit = undefined;
  }
  if (explicit) return explicit.replace(/\/$/, "");

  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodUrl) return `https://${prodUrl}`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  const branchUrl = process.env.VERCEL_BRANCH_URL;
  if (branchUrl) return `https://${branchUrl}`;

  return "http://localhost:3000";
}

export class EmailService {
  private baseUrl: string;

  constructor(private mailAdapter: MailAdapter, baseUrl?: string) {
    // Default to APP_BASE_URL when callers don't pass a baseUrl explicitly.
    this.baseUrl = resolveBaseUrl(baseUrl ?? process.env.APP_BASE_URL);
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

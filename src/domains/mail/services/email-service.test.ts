import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./email-service";
import type { MailAdapter } from "../ports/mail-adapter";
import { TokenType } from "@/domains/subscriptions/model/types";

// Mock the DB-dependent methods (createToken, verifyAndConsumeToken)
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn() })) })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn() })) })),
    })),
    query: { tokens: { findFirst: vi.fn() } },
  },
}));

vi.mock("@/db/subscription-schema", () => ({
  tokens: { tokenHash: "tokenHash", tokenType: "tokenType", expiresAt: "expiresAt", usedAt: "usedAt", id: "id" },
}));

vi.mock("@/lib/uuid", () => ({
  generateUUID: vi.fn(() => "mock-uuid"),
}));

vi.mock("@/lib/base-url", () => ({
  resolveBaseUrl: vi.fn((explicit?: string) => explicit ?? "http://localhost:3000"),
}));

// ---------- helpers ----------

function makeMailAdapter(overrides: Partial<MailAdapter> = {}): MailAdapter {
  return {
    send: vi.fn(async () => ({ providerMessageId: "msg-123" })),
    ...overrides,
  };
}

// ---------- tests ----------

describe("EmailService", () => {
  let adapter: MailAdapter;
  let service: EmailService;

  beforeEach(() => {
    vi.restoreAllMocks();
    adapter = makeMailAdapter();
    service = new EmailService(adapter, "https://example.com");
  });

  // ==========================================
  // Constructor / baseUrl
  // ==========================================
  describe("constructor", () => {
    it("uses explicit baseUrl when provided", () => {
      const s = new EmailService(adapter, "https://custom.com");
      expect(s.buildConfirmUrl("tok")).toBe("https://custom.com/confirm/tok");
    });

    it("falls back to resolveBaseUrl when no explicit url", () => {
      const s = new EmailService(adapter);
      expect(s.buildConfirmUrl("tok")).toBe(
        "http://localhost:3000/confirm/tok"
      );
    });
  });

  // ==========================================
  // Signed tokens (stateless)
  // ==========================================
  describe("createSignedToken / verifySignedToken", () => {
    it("creates a token that verifies with correct params", () => {
      const token = service.createSignedToken("sub-1", TokenType.PAUSE);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      const isValid = service.verifySignedToken(token, "sub-1", TokenType.PAUSE);
      expect(isValid).toBe(true);
    });

    it("rejects token with wrong subscriptionId", () => {
      const token = service.createSignedToken("sub-1", TokenType.PAUSE);
      expect(service.verifySignedToken(token, "sub-WRONG", TokenType.PAUSE)).toBe(false);
    });

    it("rejects token with wrong tokenType", () => {
      const token = service.createSignedToken("sub-1", TokenType.PAUSE);
      expect(service.verifySignedToken(token, "sub-1", TokenType.STOP)).toBe(false);
    });

    it("rejects expired token", () => {
      // Create a token that expires in -1ms (already expired)
      const token = service.createSignedToken("sub-1", TokenType.PAUSE, -1);
      expect(service.verifySignedToken(token, "sub-1", TokenType.PAUSE)).toBe(false);
    });

    it("rejects garbage input", () => {
      expect(service.verifySignedToken("not-a-token", "sub-1", TokenType.PAUSE)).toBe(false);
    });

    it("rejects empty string", () => {
      expect(service.verifySignedToken("", "sub-1", TokenType.PAUSE)).toBe(false);
    });

    it("rejects tampered payload", () => {
      const token = service.createSignedToken("sub-1", TokenType.PAUSE);
      // Decode, tamper, re-encode
      const payload = Buffer.from(token, "base64url").toString("utf-8");
      const parts = payload.split(":");
      parts[1] = String(Date.now() + 999999999); // tamper with expiry
      const tampered = Buffer.from(parts.join(":")).toString("base64url");
      expect(service.verifySignedToken(tampered, "sub-1", TokenType.PAUSE)).toBe(false);
    });
  });

  // ==========================================
  // URL builders
  // ==========================================
  describe("URL builders", () => {
    it("buildConfirmUrl", () => {
      expect(service.buildConfirmUrl("abc")).toBe(
        "https://example.com/confirm/abc"
      );
    });

    it("buildManageUrl", () => {
      expect(service.buildManageUrl("abc")).toBe(
        "https://example.com/manage/abc"
      );
    });

    it("buildPauseUrl", () => {
      expect(service.buildPauseUrl("sub-1", "tok")).toBe(
        "https://example.com/api/pause?token=tok&id=sub-1"
      );
    });

    it("buildStopUrl", () => {
      expect(service.buildStopUrl("sub-1", "tok")).toBe(
        "https://example.com/api/stop?token=tok&id=sub-1"
      );
    });

    it("buildCompanionPageUrl", () => {
      expect(service.buildCompanionPageUrl("my-pack", "day-1")).toBe(
        "https://example.com/p/my-pack/day-1"
      );
    });
  });

  // ==========================================
  // sendEmail
  // ==========================================
  describe("sendEmail", () => {
    it("delegates to mail adapter and returns result", async () => {
      const result = await service.sendEmail({
        to: "user@test.com",
        subject: "Test",
        html: "<p>hi</p>",
      });

      expect(adapter.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Test",
          html: "<p>hi</p>",
        })
      );
      expect(result).toEqual({ providerMessageId: "msg-123" });
    });

    it("sets List-Unsubscribe headers when unsubscribeUrl is provided", async () => {
      await service.sendEmail({
        to: "user@test.com",
        subject: "Test",
        html: "<p>hi</p>",
        unsubscribeUrl: "https://example.com/unsub",
      });

      const call = adapter.send.mock.calls[0][0];
      expect(call.headers["List-Unsubscribe"]).toBe("<https://example.com/unsub>");
      expect(call.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
      expect(call.headers["X-Entity-Ref-ID"]).toBeDefined();
    });

    it("always includes X-Entity-Ref-ID to prevent threading", async () => {
      await service.sendEmail({
        to: "user@test.com",
        subject: "Test",
        html: "<p>hi</p>",
      });

      const call = adapter.send.mock.calls[0][0];
      expect(call.headers["X-Entity-Ref-ID"]).toBeDefined();
      expect(call.headers["List-Unsubscribe"]).toBeUndefined();
    });

    it("passes through optional tag and text fields", async () => {
      await service.sendEmail({
        to: "user@test.com",
        subject: "Test",
        html: "<p>hi</p>",
        text: "hi",
        tag: "my-tag",
      });

      expect(adapter.send).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "hi",
          tag: "my-tag",
        })
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionService } from "./subscription-service";
import type { SubscriptionRepo } from "../repo/subscription-repo";
import type { EmailService } from "@/domains/mail/services/email-service";
import type { Subscription } from "../model/types";
import { SubscriptionStatus, TokenType } from "../model/types";

// ---------- module mocks ----------

vi.mock("@/content-packs/registry", () => ({
  getPackByKey: vi.fn(),
}));

vi.mock("fs", () => ({
  readFileSync: vi.fn(() => "---\nsubject: Hello\n---\nBody {{confirmUrl}} {{companionUrl}} {{manageUrl}} {{pauseUrl}} {{stopUrl}}"),
}));

vi.mock("@/lib/markdown/renderer", () => ({
  parseMarkdown: vi.fn(() => ({
    frontmatter: { subject: "Hello", preview: "Preview" },
    html: "<p>Body</p>",
  })),
}));

vi.mock("@/emails/render", () => ({
  renderEmail: vi.fn(() =>
    Promise.resolve({ html: "<html>rendered</html>", text: "rendered" })
  ),
}));

vi.mock("@/emails/components/content-markdown-email", () => ({
  ContentMarkdownEmail: vi.fn(),
}));

vi.mock("@/content-packs", () => ({}));

import { getPackByKey } from "@/content-packs/registry";
const mockGetPackByKey = getPackByKey as ReturnType<typeof vi.fn>;

// ---------- helpers ----------

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    email: "test@example.com",
    packKey: "my-pack",
    timezone: "UTC",
    cronExpression: "0 8 * * *",
    status: SubscriptionStatus.ACTIVE,
    currentStepIndex: 0,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    create: vi.fn(async (data: Record<string, unknown>) =>
      makeSub({ id: "new-sub", ...data } as Partial<Subscription>)
    ),
    findById: vi.fn(async () => makeSub()),
    findByEmailAndPack: vi.fn(async () => null),
    findByEmail: vi.fn(async () => []),
    update: vi.fn(async () => makeSub()),
    logSend: vi.fn(async () => {}),
    ...overrides,
  } as unknown as SubscriptionRepo;
}

function makeEmailService(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    createToken: vi.fn(async () => ({ token: "confirm-tok", tokenHash: "hash" })),
    createSignedToken: vi.fn(() => "signed-tok"),
    verifyAndConsumeToken: vi.fn(async () => ({ subscriptionId: "sub-1" })),
    verifySignedToken: vi.fn(() => true),
    buildConfirmUrl: vi.fn(() => "https://example.com/confirm/tok"),
    buildManageUrl: vi.fn(() => "https://example.com/manage/tok"),
    buildPauseUrl: vi.fn(() => "https://example.com/pause"),
    buildStopUrl: vi.fn(() => "https://example.com/stop"),
    buildCompanionPageUrl: vi.fn(() => "https://example.com/companion"),
    buildAssetUrl: vi.fn(() => "https://example.com/api/content-assets/test-pack"),
    sendEmail: vi.fn(async () => ({ providerMessageId: "msg-1" })),
    ...overrides,
  } as unknown as EmailService;
}

// ---------- tests ----------

describe("SubscriptionService", () => {
  let repo: ReturnType<typeof makeRepo>;
  let emailService: ReturnType<typeof makeEmailService>;
  let service: SubscriptionService;

  beforeEach(() => {
    vi.restoreAllMocks();

    repo = makeRepo();
    emailService = makeEmailService();
    service = new SubscriptionService(
      repo as unknown as SubscriptionRepo,
      emailService as unknown as EmailService
    );

    mockGetPackByKey.mockReturnValue({
      key: "my-pack",
      name: "My Pack",
      description: "desc",
      steps: [{ slug: "welcome", emailFile: "welcome.md" }],
    });
  });

  // ==========================================
  // subscribe
  // ==========================================
  describe("subscribe", () => {
    it("creates a subscription and sends confirmation email", async () => {
      const result = await service.subscribe({
        email: "test@example.com",
        packKey: "my-pack",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          packKey: "my-pack",
        })
      );
      expect(emailService.createToken).toHaveBeenCalledWith(
        "new-sub",
        TokenType.CONFIRM
      );
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(result.subscriptionId).toBe("new-sub");
      expect(result.confirmToken).toBe("confirm-tok");
    });

    it("throws when pack does not exist", async () => {
      mockGetPackByKey.mockReturnValue(undefined);

      await expect(
        service.subscribe({
          email: "test@example.com",
          packKey: "nonexistent",
          timezone: "UTC",
          cronExpression: "0 8 * * *",
        })
      ).rejects.toThrow('Content pack "nonexistent" not found');
    });

    it("resends confirmation for pending duplicate", async () => {
      const pending = makeSub({
        id: "existing-sub",
        status: SubscriptionStatus.PENDING_CONFIRM,
      });
      (repo.findByEmailAndPack as ReturnType<typeof vi.fn>).mockResolvedValue(
        pending
      );

      const result = await service.subscribe({
        email: "test@example.com",
        packKey: "my-pack",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      expect(repo.create).not.toHaveBeenCalled();
      expect(emailService.createToken).toHaveBeenCalledWith(
        "existing-sub",
        TokenType.CONFIRM
      );
      expect(result.subscriptionId).toBe("existing-sub");
    });

    it("sends manage link for active duplicate subscription", async () => {
      (repo.findByEmailAndPack as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.ACTIVE })
      );
      (repo.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeSub({ status: SubscriptionStatus.ACTIVE }),
      ]);

      const result = await service.subscribe({
        email: "test@example.com",
        packKey: "my-pack",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      expect(result.alreadySubscribed).toBe(true);
      expect(repo.create).not.toHaveBeenCalled();
      // A manage link email should have been sent
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // confirmSubscription
  // ==========================================
  describe("confirmSubscription", () => {
    it("verifies token, activates subscription, and sends welcome email", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.PENDING_CONFIRM })
      );

      await service.confirmSubscription("token-hash");

      expect(emailService.verifyAndConsumeToken).toHaveBeenCalledWith(
        "token-hash",
        TokenType.CONFIRM
      );
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.ACTIVE,
      });
      // Welcome email sent
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
      // Step index advanced after welcome
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        currentStepIndex: 1,
      });
    });

    it("throws when token is invalid", async () => {
      (emailService.verifyAndConsumeToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(service.confirmSubscription("bad-hash")).rejects.toThrow(
        "Invalid or expired confirmation token"
      );
    });

    it("throws when subscription not found", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(service.confirmSubscription("hash")).rejects.toThrow(
        "Subscription not found"
      );
    });

    it("throws when already confirmed", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.ACTIVE })
      );

      await expect(service.confirmSubscription("hash")).rejects.toThrow(
        "Subscription already confirmed"
      );
    });
  });

  // ==========================================
  // pauseFromEmail
  // ==========================================
  describe("pauseFromEmail", () => {
    it("pauses an active subscription with valid token", async () => {
      await service.pauseFromEmail("sub-1", "signed-tok");

      expect(emailService.verifySignedToken).toHaveBeenCalledWith(
        "signed-tok",
        "sub-1",
        TokenType.PAUSE
      );
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.PAUSED,
      });
    });

    it("throws when subscription not found", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        service.pauseFromEmail("sub-1", "tok")
      ).rejects.toThrow("Subscription not found");
    });

    it("throws when token is invalid", async () => {
      (emailService.verifySignedToken as ReturnType<typeof vi.fn>).mockReturnValue(false);

      await expect(
        service.pauseFromEmail("sub-1", "bad-tok")
      ).rejects.toThrow("Invalid token");
    });

    it("throws when subscription is not active", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.PAUSED })
      );

      await expect(
        service.pauseFromEmail("sub-1", "tok")
      ).rejects.toThrow("Subscription is not active");
    });
  });

  // ==========================================
  // stopFromEmail
  // ==========================================
  describe("stopFromEmail", () => {
    it("stops a subscription with valid token", async () => {
      await service.stopFromEmail("sub-1", "signed-tok");

      expect(emailService.verifySignedToken).toHaveBeenCalledWith(
        "signed-tok",
        "sub-1",
        TokenType.STOP
      );
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.STOPPED,
      });
    });

    it("throws when token is invalid", async () => {
      (emailService.verifySignedToken as ReturnType<typeof vi.fn>).mockReturnValue(false);

      await expect(
        service.stopFromEmail("sub-1", "bad-tok")
      ).rejects.toThrow("Invalid token");
    });

    it("throws when subscription not found", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        service.stopFromEmail("missing", "tok")
      ).rejects.toThrow("Subscription not found");
    });
  });

  // ==========================================
  // pauseSubscription (from manage page)
  // ==========================================
  describe("pauseSubscription", () => {
    it("pauses an active subscription", async () => {
      await service.pauseSubscription("sub-1");

      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.PAUSED,
      });
    });

    it("throws when subscription not found", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(service.pauseSubscription("missing")).rejects.toThrow(
        "Subscription not found"
      );
    });

    it("throws when subscription is not active", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.COMPLETED })
      );

      await expect(service.pauseSubscription("sub-1")).rejects.toThrow(
        "Subscription is not active"
      );
    });
  });

  // ==========================================
  // resumeSubscription
  // ==========================================
  describe("resumeSubscription", () => {
    it("resumes a paused subscription", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.PAUSED })
      );

      await service.resumeSubscription("sub-1");

      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.ACTIVE,
      });
    });

    it("throws when subscription not found", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(service.resumeSubscription("missing")).rejects.toThrow(
        "Subscription not found"
      );
    });

    it("resumes a stopped subscription", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.STOPPED })
      );

      await service.resumeSubscription("sub-1");

      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.ACTIVE,
      });
    });

    it("throws when subscription is not paused or stopped", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        makeSub({ status: SubscriptionStatus.ACTIVE })
      );

      await expect(service.resumeSubscription("sub-1")).rejects.toThrow(
        "Subscription is not paused or stopped"
      );
    });
  });

  // ==========================================
  // requestManageLink
  // ==========================================
  describe("requestManageLink", () => {
    it("creates a manage token and sends email", async () => {
      (repo.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeSub(),
      ]);

      const result = await service.requestManageLink("test@example.com");

      expect(emailService.createToken).toHaveBeenCalledWith(
        "sub-1",
        TokenType.MANAGE
      );
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(result.manageToken).toBe("confirm-tok");
    });

    it("throws when no subscriptions found", async () => {
      (repo.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await expect(
        service.requestManageLink("unknown@test.com")
      ).rejects.toThrow("Subscription not found");
    });
  });

  // ==========================================
  // updateSubscription
  // ==========================================
  describe("updateSubscription", () => {
    it("updates timezone and cronExpression", async () => {
      await service.updateSubscription("sub-1", {
        timezone: "America/New_York",
        cronExpression: "0 9 * * *",
      });

      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        timezone: "America/New_York",
        cronExpression: "0 9 * * *",
      });
    });

    it("throws when subscription not found", async () => {
      (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        service.updateSubscription("missing", { timezone: "UTC" })
      ).rejects.toThrow("Subscription not found");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SchedulerService } from "./scheduler-service";
import type { SubscriptionRepo } from "../repo/subscription-repo";
import type { EmailService } from "@/domains/mail/services/email-service";
import type { Subscription } from "../model/types";
import { SubscriptionStatus } from "../model/types";

// ---------- module mocks ----------

vi.mock("@/content-packs/registry", () => ({
  getPackByKey: vi.fn(),
  getNextStep: vi.fn(),
}));

vi.mock("fs", () => ({
  readFileSync: vi.fn(() => "---\nsubject: Hello\n---\nBody"),
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

vi.mock("@/emails/content-markdown-email", () => ({
  ContentMarkdownEmail: vi.fn(),
}));

vi.mock("@/content-packs", () => ({}));

// Pull in the mocked functions so tests can configure them
import { getPackByKey, getNextStep } from "@/content-packs/registry";
const mockGetPackByKey = getPackByKey as ReturnType<typeof vi.fn>;
const mockGetNextStep = getNextStep as ReturnType<typeof vi.fn>;

// ---------- helpers ----------

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    email: "test@example.com",
    packKey: "my-pack",
    timezone: "UTC",
    cronExpression: "* * * * *", // every minute
    status: SubscriptionStatus.ACTIVE,
    currentStepIndex: 0,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<SubscriptionRepo> = {}) {
  return {
    findActiveSubscriptions: vi.fn(async () => []),
    findActiveSubscriptionIds: vi.fn(async () => []),
    findByIds: vi.fn(async () => []),
    update: vi.fn(async () => makeSub()),
    logSend: vi.fn(async () => {}),
    hasSentStep: vi.fn(async () => false),
    getLastSuccessfulSendAt: vi.fn(async () => null),
    ...overrides,
  } as unknown as SubscriptionRepo;
}

function makeEmailService(overrides: Partial<EmailService> = {}) {
  return {
    createSignedToken: vi.fn(() => "signed-token"),
    createToken: vi.fn(async () => ({ token: "manage-tok", tokenHash: "h" })),
    buildCompanionPageUrl: vi.fn(() => "https://example.com/companion"),
    buildManageUrl: vi.fn(() => "https://example.com/manage"),
    buildPauseUrl: vi.fn(() => "https://example.com/pause"),
    buildStopUrl: vi.fn(() => "https://example.com/stop"),
    sendEmail: vi.fn(async () => ({ providerMessageId: "msg-1" })),
    ...overrides,
  } as unknown as EmailService;
}

// ---------- tests ----------

describe("SchedulerService", () => {
  let repo: ReturnType<typeof makeRepo>;
  let emailService: ReturnType<typeof makeEmailService>;
  let service: SchedulerService;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.DRIP_TIME_SCALE;

    repo = makeRepo();
    emailService = makeEmailService();
    service = new SchedulerService(
      repo as unknown as SubscriptionRepo,
      emailService as unknown as EmailService
    );

    // Default: pack exists with one step
    mockGetPackByKey.mockReturnValue({
      key: "my-pack",
      name: "My Pack",
      description: "desc",
      steps: [{ slug: "day-1", emailFile: "day-1.md" }],
    });
    mockGetNextStep.mockReturnValue({ slug: "day-1", emailFile: "day-1.md" });
  });

  // ==========================================
  // sendDueSubscriptions
  // ==========================================
  describe("sendDueSubscriptions", () => {
    it("returns zero counts when there are no subscriptions", async () => {
      const result = await service.sendDueSubscriptions();
      expect(result).toEqual({ sent: 0, errors: 0 });
    });

    it("skips subscriptions that are not due (cron)", async () => {
      const sub = makeSub({
        cronExpression: "0 0 1 1 *", // once a year on Jan 1
      });
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue([sub]);

      const result = await service.sendDueSubscriptions();
      expect(result).toEqual({ sent: 0, errors: 0 });
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it("sends due subscriptions and tallies sent count", async () => {
      const now = new Date();
      const sub = makeSub();
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue([sub]);
      // Make cron always match by using every-minute cron (default)

      const result = await service.sendDueSubscriptions();
      expect(result.sent).toBe(1);
      expect(result.errors).toBe(0);
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it("marks subscriptions as completed when no more steps", async () => {
      const sub = makeSub();
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue([sub]);
      mockGetNextStep.mockReturnValue(null);

      const result = await service.sendDueSubscriptions();
      expect(result).toEqual({ sent: 0, errors: 0 });
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.COMPLETED,
      });
    });

    it("handles idempotency — skips already-sent steps", async () => {
      const sub = makeSub();
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue([sub]);
      (repo.hasSentStep as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.sendDueSubscriptions();
      expect(result).toEqual({ sent: 0, errors: 0 });
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        currentStepIndex: 1,
      });
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it("logs errors to DB and increments error count on failure", async () => {
      const sub = makeSub();
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue([sub]);
      (emailService.sendEmail as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("SMTP down")
      );

      const result = await service.sendDueSubscriptions();
      expect(result).toEqual({ sent: 0, errors: 1 });
      expect(repo.logSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: "sub-1",
          status: "FAILED",
          error: "SMTP down",
        })
      );
    });

    it("processes subscriptions in batches of batchSize", async () => {
      const subs = Array.from({ length: 7 }, (_, i) =>
        makeSub({ id: `sub-${i}` })
      );
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue(subs);

      // Track the order of Promise.allSettled calls by spying on sendEmail
      const callOrder: string[] = [];
      (emailService.sendEmail as ReturnType<typeof vi.fn>).mockImplementation(
        async (opts: { to: string; tag?: string }) => {
          callOrder.push(opts.tag || "");
          return { providerMessageId: "msg" };
        }
      );

      const result = await service.sendDueSubscriptions({ batchSize: 3 });
      expect(result.sent).toBe(7);
      // All 7 sent
      expect(emailService.sendEmail).toHaveBeenCalledTimes(7);
    });

    it("isolates failures — one rejection does not block others in the batch", async () => {
      const subs = [makeSub({ id: "ok-1" }), makeSub({ id: "fail-1" }), makeSub({ id: "ok-2" })];
      (repo.findActiveSubscriptions as ReturnType<typeof vi.fn>).mockResolvedValue(subs);

      let callCount = 0;
      (emailService.sendEmail as ReturnType<typeof vi.fn>).mockImplementation(async () => {
        callCount++;
        if (callCount === 2) throw new Error("boom");
        return { providerMessageId: "msg" };
      });

      const result = await service.sendDueSubscriptions({ batchSize: 10 });
      expect(result.sent).toBe(2);
      expect(result.errors).toBe(1);
    });
  });

  // ==========================================
  // processSubscription
  // ==========================================
  describe("processSubscription", () => {
    it('returns "skipped" when not due (cron)', async () => {
      const sub = makeSub({ cronExpression: "0 0 1 1 *" });
      const result = await service.processSubscription(sub, new Date(), null);
      expect(result).toBe("skipped");
    });

    it('returns "sent" when due and email succeeds', async () => {
      const sub = makeSub();
      const result = await service.processSubscription(sub, new Date(), null);
      expect(result).toBe("sent");
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it('returns "completed" when no next step', async () => {
      const sub = makeSub();
      mockGetNextStep.mockReturnValue(null);
      const result = await service.processSubscription(sub, new Date(), null);
      expect(result).toBe("completed");
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        status: SubscriptionStatus.COMPLETED,
      });
    });

    it('returns "skipped" when step already sent (idempotency)', async () => {
      const sub = makeSub();
      (repo.hasSentStep as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      const result = await service.processSubscription(sub, new Date(), null);
      expect(result).toBe("skipped");
    });

    it("throws when sendStepEmail fails", async () => {
      const sub = makeSub();
      (emailService.sendEmail as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("fail")
      );
      await expect(
        service.processSubscription(sub, new Date(), null)
      ).rejects.toThrow("fail");
    });

    it("uses elapsed-minutes mode when fastTestStepMinutes is provided", async () => {
      const now = new Date("2025-06-01T12:00:00Z");
      const sub = makeSub({
        updatedAt: new Date("2025-06-01T11:00:00Z"), // 60 min ago
      });
      // 30 minute step interval — 60 min elapsed >= 30, so due
      const result = await service.processSubscription(sub, now, 30);
      expect(result).toBe("sent");
    });

    it("skips when elapsed minutes not met", async () => {
      const now = new Date("2025-06-01T12:00:00Z");
      const sub = makeSub({
        updatedAt: new Date("2025-06-01T11:50:00Z"), // 10 min ago
      });
      // 30 minute step interval — 10 min elapsed < 30, so not due
      const result = await service.processSubscription(sub, now, 30);
      expect(result).toBe("skipped");
    });
  });

  // ==========================================
  // sendStepEmail (tested via processSubscription)
  // ==========================================
  describe("sendStepEmail (via processSubscription)", () => {
    it("throws when pack is not found", async () => {
      const sub = makeSub();
      mockGetPackByKey.mockReturnValue(undefined);

      await expect(
        service.processSubscription(sub, new Date(), null)
      ).rejects.toThrow("Pack my-pack not found");
    });

    it("creates tokens and sends email with correct params", async () => {
      const sub = makeSub();

      await service.processSubscription(sub, new Date(), null);

      expect(emailService.createSignedToken).toHaveBeenCalledTimes(2);
      expect(emailService.createToken).toHaveBeenCalledTimes(1);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Hello",
        })
      );
    });

    it("logs successful send and advances step index", async () => {
      const sub = makeSub();

      await service.processSubscription(sub, new Date(), null);

      expect(repo.logSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: "sub-1",
          status: "SUCCESS",
          providerMessageId: "msg-1",
        })
      );
      expect(repo.update).toHaveBeenCalledWith("sub-1", {
        currentStepIndex: 1,
      });
    });
  });

  // ==========================================
  // processBatch
  // ==========================================
  describe("processBatch", () => {
    it("returns zeroes for empty ID list", async () => {
      const result = await service.processBatch([], new Date(), null);
      expect(result).toEqual({
        sent: 0,
        skipped: 0,
        completed: 0,
        errors: 0,
        failures: [],
      });
      expect(repo.findByIds).not.toHaveBeenCalled();
    });

    it("loads subscriptions by ID and processes them", async () => {
      const subs = [makeSub({ id: "sub-1" }), makeSub({ id: "sub-2" })];
      (repo.findByIds as ReturnType<typeof vi.fn>).mockResolvedValue(subs);

      const result = await service.processBatch(
        ["sub-1", "sub-2"],
        new Date(),
        null
      );

      expect(repo.findByIds).toHaveBeenCalledWith(["sub-1", "sub-2"]);
      expect(result.sent).toBe(2);
      expect(result.errors).toBe(0);
      expect(emailService.sendEmail).toHaveBeenCalledTimes(2);
    });

    it("processes in sub-batches of 5", async () => {
      const subs = Array.from({ length: 12 }, (_, i) =>
        makeSub({ id: `sub-${i}` })
      );
      (repo.findByIds as ReturnType<typeof vi.fn>).mockResolvedValue(subs);

      const result = await service.processBatch(
        subs.map((s) => s.id),
        new Date(),
        null
      );

      expect(result.sent).toBe(12);
      expect(emailService.sendEmail).toHaveBeenCalledTimes(12);
    });

    it("aggregates mixed results (sent, skipped, completed)", async () => {
      const subs = [
        makeSub({ id: "sent-1" }),
        makeSub({ id: "skipped-1", cronExpression: "0 0 1 1 *" }), // not due
        makeSub({ id: "completed-1" }),
      ];
      (repo.findByIds as ReturnType<typeof vi.fn>).mockResolvedValue(subs);

      // completed-1 has no next step
      mockGetNextStep.mockImplementation(
        (packKey: string, stepIndex: number) => {
          // For the "completed" sub, return null
          return packKey === "my-pack" ? { slug: "day-1", emailFile: "day-1.md" } : null;
        }
      );
      // Override: make completed-1 use a different pack
      subs[2].packKey = "done-pack";
      mockGetPackByKey.mockImplementation((key: string) =>
        key === "done-pack"
          ? { key: "done-pack", name: "Done", description: "", steps: [] }
          : { key: "my-pack", name: "My Pack", description: "desc", steps: [{ slug: "day-1", emailFile: "day-1.md" }] }
      );
      mockGetNextStep.mockImplementation((packKey: string) =>
        packKey === "done-pack" ? null : { slug: "day-1", emailFile: "day-1.md" }
      );

      const result = await service.processBatch(
        ["sent-1", "skipped-1", "completed-1"],
        new Date(),
        null
      );

      expect(result.sent).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.completed).toBe(1);
      expect(result.errors).toBe(0);
    });

    it("captures failures and logs them", async () => {
      const subs = [makeSub({ id: "ok-1" }), makeSub({ id: "fail-1" })];
      (repo.findByIds as ReturnType<typeof vi.fn>).mockResolvedValue(subs);

      let callCount = 0;
      (emailService.sendEmail as ReturnType<typeof vi.fn>).mockImplementation(
        async () => {
          callCount++;
          if (callCount === 2) throw new Error("SMTP down");
          return { providerMessageId: "msg" };
        }
      );

      const result = await service.processBatch(
        ["ok-1", "fail-1"],
        new Date(),
        null
      );

      expect(result.sent).toBe(1);
      expect(result.errors).toBe(1);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toEqual({
        subscriptionId: "fail-1",
        error: "SMTP down",
      });
      expect(repo.logSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: "fail-1",
          status: "FAILED",
          error: "SMTP down",
        })
      );
    });

    it("passes fastTestStepMinutes through to processSubscription", async () => {
      const now = new Date("2025-06-01T12:00:00Z");
      const sub = makeSub({
        id: "sub-1",
        updatedAt: new Date("2025-06-01T11:00:00Z"), // 60 min ago
      });
      (repo.findByIds as ReturnType<typeof vi.fn>).mockResolvedValue([sub]);

      // 30 min step — 60 min elapsed, so due
      const result = await service.processBatch(["sub-1"], now, 30);
      expect(result.sent).toBe(1);
    });
  });
});

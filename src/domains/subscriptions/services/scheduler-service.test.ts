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
    cronExpression: "0 8 * * *", // daily at 8 AM
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
        cronExpression: "0 8 * * *", // daily at 8 AM
      });
      // Simulate: already sent after today's 8 AM match
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(new Date());
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
      const sub = makeSub({ cronExpression: "0 8 * * *" });
      // Simulate: already sent after today's 8 AM match
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(new Date());
      const result = await service.processSubscription(sub, new Date(), null);
      expect(result).toBe("skipped");
    });

    it('returns "sent" when due and email succeeds', async () => {
      const sub = makeSub();
      const result = await service.processSubscription(sub, new Date(), null);
      expect(result).toBe("sent");
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it("catches up on the next invocation when cron fires at exact match instant", async () => {
      // cron-parser v5 treats currentDate as exclusive for prev(), so at
      // exactly 8:00:00.000 prev() returns yesterday's match. The retry
      // logic means the next invocation (8:01) picks it up.
      const sub = makeSub({
        cronExpression: "0 8 * * *",
        timezone: "America/New_York",
      });
      const lastSend = new Date("2025-06-14T12:00:00.000Z"); // yesterday
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(lastSend);

      // At exactly 8:00:00.000 — prev() returns yesterday, which is NOT > lastSend
      const exactMatch = new Date("2025-06-15T12:00:00.000Z");
      const result1 = await service.processSubscription(sub, exactMatch, null);
      expect(result1).toBe("skipped");

      // At 8:01:00 — prev() returns today's 8:00, which IS > lastSend
      const oneMinuteLater = new Date("2025-06-15T12:01:00.000Z");
      const result2 = await service.processSubscription(sub, oneMinuteLater, null);
      expect(result2).toBe("sent");
    });

    it("is due hours after the cron match when the window was missed", async () => {
      const sub = makeSub({
        cronExpression: "0 8 * * *",
        timezone: "Europe/Budapest",
      });
      // It's 2 PM Budapest — the 8 AM match was 6 hours ago
      const now = new Date("2026-02-16T13:00:00.000Z"); // 2 PM Budapest (CET, UTC+1)
      // Last send was yesterday (welcome email)
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2026-02-15T16:57:00.000Z")
      );
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("sent");
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
  // isDueByCron (tested via processSubscription)
  // ==========================================
  describe("isDueByCron (via processSubscription)", () => {
    it("daily cron — due when prev match is after last send", async () => {
      const sub = makeSub({
        cronExpression: "0 8 * * *",
        timezone: "UTC",
      });
      // Last send was yesterday morning
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-06-14T08:01:00.000Z")
      );
      // Now is today at 9 AM UTC — prev match is today 8:00 > yesterday's send
      const now = new Date("2025-06-15T09:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("sent");
    });

    it("daily cron — not due when already sent after today's match", async () => {
      const sub = makeSub({
        cronExpression: "0 8 * * *",
        timezone: "UTC",
      });
      // Sent today at 8:01
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-06-15T08:01:00.000Z")
      );
      // Now is today at 9 AM — prev match is 8:00 which is NOT > 8:01 send
      const now = new Date("2025-06-15T09:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("skipped");
    });

    it("weekly cron (Monday only) — skips on Saturday", async () => {
      const sub = makeSub({
        cronExpression: "0 8 * * 1", // Monday at 8 AM
        timezone: "UTC",
      });
      // Last send was last Monday
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-06-09T08:01:00.000Z") // Monday
      );
      // Now is Saturday June 14 — prev match is still Monday June 9 which is NOT > last send
      const now = new Date("2025-06-14T10:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("skipped");
    });

    it("weekly cron (Monday only) — due on Monday", async () => {
      const sub = makeSub({
        cronExpression: "0 8 * * 1", // Monday at 8 AM
        timezone: "UTC",
      });
      // Last send was last Monday
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-06-09T08:01:00.000Z") // Monday
      );
      // Now is next Monday June 16 at 9 AM — prev match is today 8:00 > last send
      const now = new Date("2025-06-16T09:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("sent");
    });

    it("DST spring-forward — cron at 2:30 AM handles gap (Europe/Berlin)", async () => {
      // On March 30 2025, Europe/Berlin springs forward: 2:00→3:00 AM
      // A cron at 2:30 AM local doesn't exist that day
      const sub = makeSub({
        cronExpression: "30 2 * * *",
        timezone: "Europe/Berlin",
      });
      // Last send was March 29 (before DST)
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-03-29T01:31:00.000Z") // 2:31 AM CET = UTC+1
      );
      // Now is March 30 at 10:00 AM Berlin (08:00 UTC, CEST = UTC+2)
      const now = new Date("2025-03-30T08:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      // cron-parser should handle the DST gap — either skip or resolve to 3:00
      // The key thing is it doesn't throw
      expect(["sent", "skipped"]).toContain(result);
    });

    it("DST fall-back — handles repeated hour (America/New_York)", async () => {
      // On Nov 2 2025, America/New_York falls back: 2:00→1:00 AM
      const sub = makeSub({
        cronExpression: "30 1 * * *", // 1:30 AM
        timezone: "America/New_York",
      });
      // Last send was Nov 1 at 1:31 AM ET (05:31 UTC, EDT)
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-11-01T05:31:00.000Z")
      );
      // Now is Nov 2 at 3:00 PM ET (20:00 UTC, EST = UTC-5)
      const now = new Date("2025-11-02T20:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      // Should be due — a 1:30 AM match occurred on Nov 2
      expect(result).toBe("sent");
    });

    it("invalid cron expression — returns skipped, does not throw", async () => {
      const sub = makeSub({
        cronExpression: "not-a-cron",
        timezone: "UTC",
      });
      const now = new Date("2025-06-15T09:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("skipped");
    });

    it("different timezones — Budapest vs UTC", async () => {
      // 0 8 * * * in Europe/Budapest (CET = UTC+1 in winter)
      const sub = makeSub({
        cronExpression: "0 8 * * *",
        timezone: "Europe/Budapest",
      });
      // Last send was yesterday
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-01-14T07:01:00.000Z") // yesterday 8:01 CET
      );
      // Now is 7:30 UTC = 8:30 CET — prev match is today 8:00 CET (07:00 UTC) > last send
      const now = new Date("2025-01-15T07:30:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("sent");
    });

    it("US timezone — America/Los_Angeles", async () => {
      const sub = makeSub({
        cronExpression: "0 8 * * *",
        timezone: "America/Los_Angeles",
      });
      // Last send was yesterday 8:01 AM PST (16:01 UTC)
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Date("2025-01-14T16:01:00.000Z")
      );
      // Now is today 5:00 PM UTC = 9:00 AM PST — prev match is 8:00 AM PST (16:00 UTC) > last send
      const now = new Date("2025-01-15T17:00:00.000Z");
      const result = await service.processSubscription(sub, now, null);
      expect(result).toBe("sent");
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
        makeSub({ id: "skipped-1", cronExpression: "0 8 * * *" }), // not due (already sent)
        makeSub({ id: "completed-1" }),
      ];
      (repo.findByIds as ReturnType<typeof vi.fn>).mockResolvedValue(subs);
      // skipped-1: simulate already sent after today's match
      (repo.getLastSuccessfulSendAt as ReturnType<typeof vi.fn>).mockImplementation(
        async (id: string) => (id === "skipped-1" ? new Date() : null)
      );

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

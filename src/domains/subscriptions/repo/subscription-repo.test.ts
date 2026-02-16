import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// vi.hoisted runs before vi.mock, making _client available to mock factories
const { _client, _uuidState } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@libsql/client");
  return {
    _client: createClient({ url: "file::memory:" }),
    _uuidState: { counter: 0 },
  };
});

vi.mock("@/db", async () => {
  const { drizzle } = await import("drizzle-orm/libsql");
  const schema = await import("@/db/schema");
  return { db: drizzle(_client, { schema }) };
});

vi.mock("@/lib/uuid", () => ({
  generateUUID: () => `test-uuid-${++_uuidState.counter}`,
}));

import { SubscriptionRepo } from "./subscription-repo";

// ---------- setup ----------

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  pack_key text NOT NULL,
  timezone text NOT NULL,
  cron_expression text NOT NULL,
  status text DEFAULT 'PENDING_CONFIRM' NOT NULL,
  current_step_index integer DEFAULT 0 NOT NULL,
  created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  updated_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
CREATE TABLE IF NOT EXISTS send_log (
  id text PRIMARY KEY NOT NULL,
  subscription_id text NOT NULL,
  pack_key text NOT NULL,
  step_slug text NOT NULL,
  provider text NOT NULL,
  provider_message_id text,
  status text NOT NULL,
  sent_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  error text,
  created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tokens (
  id text PRIMARY KEY NOT NULL,
  subscription_id text NOT NULL,
  token_hash text NOT NULL,
  token_type text NOT NULL,
  expires_at integer NOT NULL,
  used_at integer,
  created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);
`;

beforeAll(async () => {
  // Create schema in in-memory database
  for (const stmt of CREATE_SQL.split(";").filter((s) => s.trim())) {
    await _client.execute(stmt);
  }
});

beforeEach(async () => {
  _uuidState.counter = 0;
  // Clear all tables between tests
  await _client.execute("DELETE FROM send_log");
  await _client.execute("DELETE FROM tokens");
  await _client.execute("DELETE FROM subscriptions");
});

// ---------- tests ----------

describe("SubscriptionRepo (integration)", () => {
  const repo = new SubscriptionRepo();

  describe("create + findById", () => {
    it("round-trips a subscription", async () => {
      const sub = await repo.create({
        email: "alice@example.com",
        packKey: "my-pack",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      expect(sub.id).toBe("test-uuid-1");
      expect(sub.email).toBe("alice@example.com");
      expect(sub.packKey).toBe("my-pack");
      expect(sub.status).toBe("PENDING_CONFIRM");
      expect(sub.currentStepIndex).toBe(0);

      const found = await repo.findById(sub.id);
      expect(found).not.toBeNull();
      expect(found!.email).toBe("alice@example.com");
    });

    it("returns null for non-existent ID", async () => {
      const found = await repo.findById("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("findActiveSubscriptionIds", () => {
    it("only returns ACTIVE status", async () => {
      // Create three subs, activate only one
      const sub1 = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      const sub2 = await repo.create({
        email: "b@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      const sub3 = await repo.create({
        email: "c@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      // Activate sub2 only
      await repo.update(sub2.id, { status: "ACTIVE" as never });

      const ids = await repo.findActiveSubscriptionIds();
      expect(ids).toEqual([sub2.id]);
    });
  });

  describe("findByIds", () => {
    it("returns matching subscriptions, ignores missing IDs", async () => {
      const sub1 = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      const sub2 = await repo.create({
        email: "b@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      const results = await repo.findByIds([sub1.id, "missing-id", sub2.id]);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id).sort()).toEqual(
        [sub1.id, sub2.id].sort()
      );
    });

    it("returns empty array for empty input", async () => {
      const results = await repo.findByIds([]);
      expect(results).toEqual([]);
    });
  });

  describe("hasSentStep", () => {
    it("returns false before any log, true after SUCCESS log", async () => {
      const sub = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      expect(await repo.hasSentStep(sub.id, "day-1")).toBe(false);

      await repo.logSend({
        subscriptionId: sub.id,
        packKey: "p",
        stepSlug: "day-1",
        provider: "postmark",
        status: "SUCCESS",
        providerMessageId: "msg-1",
      });

      expect(await repo.hasSentStep(sub.id, "day-1")).toBe(true);
    });

    it("returns false for FAILED logs", async () => {
      const sub = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      await repo.logSend({
        subscriptionId: sub.id,
        packKey: "p",
        stepSlug: "day-1",
        provider: "postmark",
        status: "FAILED",
        error: "SMTP down",
      });

      expect(await repo.hasSentStep(sub.id, "day-1")).toBe(false);
    });
  });

  describe("getLastSuccessfulSendAt", () => {
    it("returns null when no sends", async () => {
      const sub = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      expect(await repo.getLastSuccessfulSendAt(sub.id)).toBeNull();
    });

    it("returns most recent SUCCESS, ignores FAILED", async () => {
      const sub = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      // Log a success
      await repo.logSend({
        subscriptionId: sub.id,
        packKey: "p",
        stepSlug: "day-1",
        provider: "postmark",
        status: "SUCCESS",
        providerMessageId: "msg-1",
      });

      // Log a failure (later)
      await repo.logSend({
        subscriptionId: sub.id,
        packKey: "p",
        stepSlug: "day-2",
        provider: "postmark",
        status: "FAILED",
        error: "timeout",
      });

      const lastSend = await repo.getLastSuccessfulSendAt(sub.id);
      expect(lastSend).toBeInstanceOf(Date);
      // Should be roughly "now" since we just inserted it
      expect(lastSend!.getTime()).toBeGreaterThan(Date.now() - 5000);
    });
  });

  describe("update", () => {
    it("updates fields and sets updatedAt", async () => {
      const sub = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      const originalUpdatedAt = sub.updatedAt;

      // Small delay to ensure updatedAt changes
      await new Promise((r) => setTimeout(r, 10));

      const updated = await repo.update(sub.id, {
        timezone: "America/New_York",
        currentStepIndex: 3,
      });

      expect(updated.timezone).toBe("America/New_York");
      expect(updated.currentStepIndex).toBe(3);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });

    it("throws for non-existent subscription", async () => {
      await expect(
        repo.update("nonexistent", { timezone: "UTC" })
      ).rejects.toThrow("Subscription nonexistent not found");
    });
  });

  describe("logSend", () => {
    it("writes to send_log correctly", async () => {
      const sub = await repo.create({
        email: "a@test.com",
        packKey: "p",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      await repo.logSend({
        subscriptionId: sub.id,
        packKey: "p",
        stepSlug: "day-1",
        provider: "postmark",
        providerMessageId: "pm-123",
        status: "SUCCESS",
      });

      // Verify by checking hasSentStep
      expect(await repo.hasSentStep(sub.id, "day-1")).toBe(true);

      // Also verify via getLastSuccessfulSendAt
      const lastSend = await repo.getLastSuccessfulSendAt(sub.id);
      expect(lastSend).not.toBeNull();
    });
  });

  describe("findByEmailAndPack", () => {
    it("finds subscription matching both email and pack", async () => {
      await repo.create({
        email: "a@test.com",
        packKey: "pack-a",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      await repo.create({
        email: "a@test.com",
        packKey: "pack-b",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      const found = await repo.findByEmailAndPack("a@test.com", "pack-b");
      expect(found).not.toBeNull();
      expect(found!.packKey).toBe("pack-b");
    });

    it("returns null when no match", async () => {
      const found = await repo.findByEmailAndPack("x@test.com", "pack-z");
      expect(found).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("returns all subscriptions for an email", async () => {
      await repo.create({
        email: "multi@test.com",
        packKey: "pack-a",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      await repo.create({
        email: "multi@test.com",
        packKey: "pack-b",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });
      await repo.create({
        email: "other@test.com",
        packKey: "pack-a",
        timezone: "UTC",
        cronExpression: "0 8 * * *",
      });

      const results = await repo.findByEmail("multi@test.com");
      expect(results).toHaveLength(2);
    });
  });
});

import { db } from "@/db";
import { subscriptions, sendLog } from "@/db/subscription-schema";
import { eq, and, inArray } from "drizzle-orm";
import type { Subscription, SubscriptionStatus } from "../model/types";
import { SubscriptionStatus as StatusEnum } from "../model/types";
import { generateUUID } from "@/lib/uuid";

export class SubscriptionRepo {
  async create(data: {
    email: string;
    packKey: string;
    timezone: string;
    cronExpression: string;
  }): Promise<Subscription> {
    const id = generateUUID();
    const now = new Date();

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        id,
        email: data.email,
        packKey: data.packKey,
        timezone: data.timezone,
        cronExpression: data.cronExpression,
        status: StatusEnum.PENDING_CONFIRM,
        currentStepIndex: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.mapToDomain(subscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    const result = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByEmailAndPack(
    email: string,
    packKey: string
  ): Promise<Subscription | null> {
    const result = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.email, email),
        eq(subscriptions.packKey, packKey)
      ),
    });

    return result ? this.mapToDomain(result) : null;
  }

  async update(
    id: string,
    updates: Partial<{
      status: SubscriptionStatus;
      timezone: string;
      cronExpression: string;
      currentStepIndex: number;
    }>
  ): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Subscription ${id} not found`);
    }

    return this.mapToDomain(updated);
  }

  async findActiveSubscriptions(): Promise<Subscription[]> {
    const results = await db.query.subscriptions.findMany({
      where: eq(subscriptions.status, StatusEnum.ACTIVE),
    });

    return results.map((r: typeof results[0]) => this.mapToDomain(r));
  }

  async findDueSubscriptions(
    currentTime: Date,
    timezone: string
  ): Promise<Subscription[]> {
    // This will be filtered by the scheduler service using cron-parser
    // For now, return all active subscriptions
    const results = await db.query.subscriptions.findMany({
      where: eq(subscriptions.status, StatusEnum.ACTIVE),
    });

    return results.map((r: typeof results[0]) => this.mapToDomain(r));
  }

  async logSend(data: {
    subscriptionId: string;
    packKey: string;
    stepSlug: string;
    provider: string;
    providerMessageId?: string;
    status: "SUCCESS" | "FAILED";
    error?: string;
  }): Promise<void> {
    await db.insert(sendLog).values({
      id: generateUUID(),
      subscriptionId: data.subscriptionId,
      packKey: data.packKey,
      stepSlug: data.stepSlug,
      provider: data.provider,
      providerMessageId: data.providerMessageId || null,
      status: data.status,
      sentAt: new Date(),
      error: data.error || null,
      createdAt: new Date(),
    });
  }

  async hasSentStep(
    subscriptionId: string,
    stepSlug: string
  ): Promise<boolean> {
    const result = await db.query.sendLog.findFirst({
      where: and(
        eq(sendLog.subscriptionId, subscriptionId),
        eq(sendLog.stepSlug, stepSlug),
        eq(sendLog.status, "SUCCESS")
      ),
    });

    return !!result;
  }

  private mapToDomain(row: {
    id: string;
    email: string;
    packKey: string;
    timezone: string;
    cronExpression: string;
    status: string;
    currentStepIndex: number;
    createdAt: Date;
    updatedAt: Date;
  }): Subscription {
    return {
      id: row.id,
      email: row.email,
      packKey: row.packKey,
      timezone: row.timezone,
      cronExpression: row.cronExpression,
      status: row.status as SubscriptionStatus,
      currentStepIndex: row.currentStepIndex,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

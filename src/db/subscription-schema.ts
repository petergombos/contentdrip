import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    packKey: text("pack_key").notNull(),
    timezone: text("timezone").notNull(),
    cronExpression: text("cron_expression").notNull(),
    status: text("status", {
      enum: ["PENDING_CONFIRM", "ACTIVE", "PAUSED", "STOPPED", "COMPLETED"],
    })
      .notNull()
      .default("PENDING_CONFIRM"),
    currentStepIndex: integer("current_step_index").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscriptions_email_idx").on(table.email),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_pack_key_idx").on(table.packKey),
  ]
);

export const tokens = sqliteTable(
  "tokens",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    tokenType: text("token_type", {
      enum: ["CONFIRM", "MANAGE", "PAUSE", "STOP"],
    }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("tokens_subscription_id_idx").on(table.subscriptionId),
    index("tokens_token_hash_idx").on(table.tokenHash),
    index("tokens_token_type_idx").on(table.tokenType),
  ]
);

export const sendLog = sqliteTable(
  "send_log",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    packKey: text("pack_key").notNull(),
    stepSlug: text("step_slug").notNull(),
    provider: text("provider").notNull(),
    providerMessageId: text("provider_message_id"),
    status: text("status", {
      enum: ["SUCCESS", "FAILED"],
    }).notNull(),
    sentAt: integer("sent_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    error: text("error"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("send_log_subscription_id_idx").on(table.subscriptionId),
    index("send_log_pack_key_idx").on(table.packKey),
    index("send_log_sent_at_idx").on(table.sentAt),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ many }) => ({
  tokens: many(tokens),
  sendLogs: many(sendLog),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [tokens.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const sendLogRelations = relations(sendLog, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [sendLog.subscriptionId],
    references: [subscriptions.id],
  }),
}));

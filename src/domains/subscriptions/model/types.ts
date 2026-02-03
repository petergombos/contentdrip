export const SubscriptionStatus = {
  PENDING_CONFIRM: "PENDING_CONFIRM",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  STOPPED: "STOPPED",
  COMPLETED: "COMPLETED",
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const TokenType = {
  CONFIRM: "CONFIRM",
  MANAGE: "MANAGE",
  PAUSE: "PAUSE",
  STOP: "STOP",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export const SendLogStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

export type SendLogStatus = (typeof SendLogStatus)[keyof typeof SendLogStatus];

export interface Subscription {
  id: string;
  email: string;
  packKey: string;
  timezone: string;
  cronExpression: string;
  status: SubscriptionStatus;
  currentStepIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: string;
  subscriptionId: string;
  tokenHash: string;
  tokenType: TokenType;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface SendLog {
  id: string;
  subscriptionId: string;
  packKey: string;
  stepSlug: string;
  provider: string;
  providerMessageId: string | null;
  status: SendLogStatus;
  sentAt: Date;
  error: string | null;
  createdAt: Date;
}

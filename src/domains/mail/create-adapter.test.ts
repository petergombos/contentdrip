import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock adapters before importing the factory — must use class syntax for `new`
vi.mock("./adapters/postmark/postmark-adapter", () => {
  const PostmarkAdapter = vi.fn(function (this: any) { this.type = "postmark"; });
  return { PostmarkAdapter };
});

vi.mock("./adapters/resend/resend-adapter", () => {
  const ResendAdapter = vi.fn(function (this: any) { this.type = "resend"; });
  return { ResendAdapter };
});

vi.mock("./adapters/test/test-adapter", () => {
  const TestMailAdapter = vi.fn(function (this: any) { this.type = "test"; });
  return { TestMailAdapter };
});

import { createMailAdapter } from "./create-adapter";
import { PostmarkAdapter } from "./adapters/postmark/postmark-adapter";
import { ResendAdapter } from "./adapters/resend/resend-adapter";
import { TestMailAdapter } from "./adapters/test/test-adapter";

describe("createMailAdapter", () => {
  const savedEnv: Record<string, string | undefined> = {};
  const ENV_KEYS = [
    "E2E_TEST",
    "RESEND_API_KEY",
    "POSTMARK_SERVER_TOKEN",
    "POSTMARK_MESSAGE_STREAM",
    "MAIL_FROM",
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] !== undefined) {
        process.env[key] = savedEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  it("returns TestMailAdapter when E2E_TEST=true", () => {
    process.env.E2E_TEST = "true";
    const adapter = createMailAdapter();

    expect(TestMailAdapter).toHaveBeenCalled();
    expect(adapter).toEqual({ type: "test" });
  });

  it("returns ResendAdapter when RESEND_API_KEY is set", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.MAIL_FROM = "test@example.com";
    const adapter = createMailAdapter();

    expect(ResendAdapter).toHaveBeenCalledWith({
      apiKey: "re_test_key",
      fromEmail: "test@example.com",
    });
    expect(adapter).toEqual({ type: "resend" });
  });

  it("returns ResendAdapter via config override", () => {
    const adapter = createMailAdapter({
      resendApiKey: "re_config_key",
      fromEmail: "config@example.com",
    });

    expect(ResendAdapter).toHaveBeenCalledWith({
      apiKey: "re_config_key",
      fromEmail: "config@example.com",
    });
    expect(adapter).toEqual({ type: "resend" });
  });

  it("returns PostmarkAdapter when no RESEND_API_KEY", () => {
    process.env.POSTMARK_SERVER_TOKEN = "pm_token";
    process.env.MAIL_FROM = "test@example.com";
    process.env.POSTMARK_MESSAGE_STREAM = "content-emails";
    const adapter = createMailAdapter();

    expect(PostmarkAdapter).toHaveBeenCalledWith({
      serverToken: "pm_token",
      fromEmail: "test@example.com",
      messageStream: "content-emails",
    });
    expect(adapter).toEqual({ type: "postmark" });
  });

  it("prefers Resend over Postmark when both are set", () => {
    process.env.RESEND_API_KEY = "re_key";
    process.env.POSTMARK_SERVER_TOKEN = "pm_token";
    process.env.MAIL_FROM = "test@example.com";
    const adapter = createMailAdapter();

    expect(ResendAdapter).toHaveBeenCalled();
    expect(PostmarkAdapter).not.toHaveBeenCalled();
    expect(adapter).toEqual({ type: "resend" });
  });

  it("E2E_TEST takes highest priority over all providers", () => {
    process.env.E2E_TEST = "true";
    process.env.RESEND_API_KEY = "re_key";
    process.env.POSTMARK_SERVER_TOKEN = "pm_token";
    const adapter = createMailAdapter();

    expect(TestMailAdapter).toHaveBeenCalled();
    expect(ResendAdapter).not.toHaveBeenCalled();
    expect(PostmarkAdapter).not.toHaveBeenCalled();
    expect(adapter).toEqual({ type: "test" });
  });
});

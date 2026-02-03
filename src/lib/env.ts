/**
 * Validate required environment variables at startup
 */
export function validateEnv() {
  const required = [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "APP_BASE_URL",
    "MAIL_FROM",
    "POSTMARK_SERVER_TOKEN",
    "CRON_SECRET",
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Validate on import in server contexts
if (typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error) {
    // Only log in development, don't crash in production
    if (process.env.NODE_ENV === "development") {
      console.warn("Environment validation warning:", error);
    }
  }
}

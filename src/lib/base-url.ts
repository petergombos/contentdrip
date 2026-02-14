export function resolveBaseUrl(explicit?: string): string {
  // Prefer explicit config, but support Vercel preview/prod without hardcoding.
  // Note: Vercel does not interpolate "$VARS" inside env var values.
  if (explicit && explicit.includes("$VERCEL_URL")) {
    explicit = undefined;
  }
  if (explicit && explicit.includes("${VERCEL_URL}")) {
    explicit = undefined;
  }
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelEnv = process.env.VERCEL_ENV; // production|preview|development

  // In production, prefer the stable production domain.
  // In preview/development, prefer the deployment URL so tokens link back to the same env/DB.
  if (vercelEnv === "production") {
    const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (prodUrl) return `https://${prodUrl}`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  const branchUrl = process.env.VERCEL_BRANCH_URL;
  if (branchUrl) return `https://${branchUrl}`;

  // Fall back to APP_BASE_URL or localhost default
  const appBaseUrl = process.env.APP_BASE_URL;
  if (appBaseUrl) return appBaseUrl.replace(/\/$/, "");

  return "http://localhost:3000";
}

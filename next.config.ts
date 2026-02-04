import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Markdown content-pack files are included in serverless output file tracing
  // so runtime readFileSync() calls work on Vercel.
  outputFileTracingIncludes: {
    "/*": ["./src/content-packs/**/*"],
  },
};

export default nextConfig;

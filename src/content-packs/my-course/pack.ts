import { StarterEmailShell } from "@/content-packs/my-course/email-shell";
import type { ContentPack } from "@/content-packs/registry";
import { registerPack } from "@/content-packs/registry";

const pack: ContentPack = {
  key: "my-course",
  name: "The Art of Doing Absolutely Nothing",
  description:
    "A 4-day email course on the lost art of rest, delivered straight to your inbox.",
  steps: [
    { slug: "welcome", emailFile: "welcome.md" },
    { slug: "day-1", emailFile: "day-1.md" },
    { slug: "day-2", emailFile: "day-2.md" },
    { slug: "day-3", emailFile: "day-3.md" },
  ],
  EmailShell: StarterEmailShell,
  // frequency: "0 10 * * *",
};

registerPack(pack);

import type { ContentPack } from "@/content-packs/registry";
import { registerPack } from "@/content-packs/registry";
import { DefaultEmailShell } from "@/content-packs/mindful-productivity/email-shell";

const pack: ContentPack = {
  key: "mindful-productivity",
  name: "The Art of Mindful Productivity",
  description:
    "A free 5-day email course on building sustainable focus and productivity habits.",
  steps: [
    { slug: "welcome", emailFile: "welcome.md" },
    { slug: "day-1", emailFile: "day-1.md" },
    { slug: "day-2", emailFile: "day-2.md" },
    { slug: "day-3", emailFile: "day-3.md" },
    { slug: "day-4", emailFile: "day-4.md" },
    { slug: "day-5", emailFile: "day-5.md" },
  ],
  EmailShell: DefaultEmailShell,
  cadence: "0 8 * * *",
};

registerPack(pack);

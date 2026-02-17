import type { ContentPack } from "@/content-packs/registry";
import { registerPack } from "@/content-packs/registry";
import { StarterEmailShell } from "@/content-packs/my-course/email-shell";

const pack: ContentPack = {
  key: "my-course",
  name: "My Email Course",
  description: "A short email course delivered straight to your inbox.",
  steps: [
    { slug: "welcome", emailFile: "welcome.md" },
    { slug: "day-1", emailFile: "day-1.md" },
  ],
  EmailShell: StarterEmailShell,
};

registerPack(pack);

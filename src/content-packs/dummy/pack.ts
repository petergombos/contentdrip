import type { ContentPack } from "@/content-packs/registry";
import { registerPack } from "@/content-packs/registry";

const pack: ContentPack = {
  key: "dummy",
  name: "A 3-day starter pack",
  description: "A tiny demo series that proves ContentDrip works end-to-end.",
  steps: [
    { slug: "welcome", emailFile: "welcome.md" },
    { slug: "day-1", emailFile: "day-1.md" },
    { slug: "day-2", emailFile: "day-2.md" },
  ],
};

registerPack(pack);

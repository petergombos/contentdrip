import { registerPack } from "../registry";
import type { ContentPack } from "../registry";

const pack: ContentPack = {
  key: "quietly",
  name: "Quietly",
  description: "A small reset for your attention",
  steps: [
    {
      slug: "welcome",
      emailFile: "welcome.md",
      pageFile: "welcome.md",
    },
    {
      slug: "day-1",
      emailFile: "day-1.md",
      pageFile: "day-1.md",
    },
    {
      slug: "day-2",
      emailFile: "day-2.md",
      pageFile: "day-2.md",
    },
    {
      slug: "day-3",
      emailFile: "day-3.md",
      pageFile: "day-3.md",
    },
  ],
};

// Register the pack
registerPack(pack);

export default pack;

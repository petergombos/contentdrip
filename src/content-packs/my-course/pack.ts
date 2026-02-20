import { StarterEmailShell } from "@/content-packs/my-course/email-shell";
import type { ContentPack } from "@/content-packs/registry";
import { registerPack } from "@/content-packs/registry";

// ✏️ Change `key` to a unique slug for your course.
//    It appears in subscriber management URLs and is stored in the database,
//    so pick something stable — avoid changing it after launch.
// ✏️ Change `name` to your course title (shown in the email header and pages).
// ✏️ Change `description` to a one-line summary of what subscribers get.
// ✏️ Add, remove, or reorder entries in `steps` to match your curriculum.
//    Each step needs a unique `slug` and a corresponding markdown file in emails/.
//    Companion pages in pages/ are optional — omit `pageFile` to reuse `emailFile`.
// ✏️ Uncomment and set `frequency` to lock delivery to a fixed schedule (cron syntax).
//    When set, subscribers cannot choose their own delivery frequency.
const pack: ContentPack = {
  key: "my-course",
  name: "How to Write an Email Course",
  description:
    "A sample 3-day demo course showing the ContentDrip email format. Replace this content with your own.",
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

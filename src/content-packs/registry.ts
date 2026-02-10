export interface ContentStep {
  slug: string;
  emailFile: string; // e.g., "day-1.md"
  pageFile?: string; // e.g., "day-1.md" (optional, defaults to emailFile)
}

export interface PackEmailShellProps {
  preview?: string;
  title: string;
  children: React.ReactNode;
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
}

export interface ContentPack {
  key: string;
  name: string;
  description: string;
  steps: ContentStep[];

  /**
   * Optional per-pack email shell to apply consistent branding (logo/course name/footer).
   * If omitted, the default EmailShell is used.
   */
  EmailShell?: React.ComponentType<PackEmailShellProps>;
}

// Registry of all content packs
const packs: ContentPack[] = [];

/**
 * Register a content pack
 */
export function registerPack(pack: ContentPack): void {
  packs.push(pack);
}

/**
 * Get all registered packs
 */
export function getAllPacks(): ContentPack[] {
  return packs;
}

/**
 * Get a pack by key
 */
export function getPackByKey(key: string): ContentPack | undefined {
  return packs.find((p) => p.key === key);
}

/**
 * Get a step from a pack
 */
export function getPackStep(
  packKey: string,
  stepSlug: string
): { pack: ContentPack; step: ContentStep } | null {
  const pack = getPackByKey(packKey);
  if (!pack) {
    return null;
  }

  const step = pack.steps.find((s) => s.slug === stepSlug);
  if (!step) {
    return null;
  }

  return { pack, step };
}

/**
 * Get the next step for a subscription
 */
export function getNextStep(
  packKey: string,
  currentStepIndex: number
): ContentStep | null {
  const pack = getPackByKey(packKey);
  if (!pack) {
    return null;
  }

  if (currentStepIndex >= pack.steps.length) {
    return null; // All steps completed
  }

  return pack.steps[currentStepIndex];
}

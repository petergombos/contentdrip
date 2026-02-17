"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Clone",
    desc: "Fork or clone the template. Standard Next.js — no custom tooling.",
  },
  {
    n: "02",
    title: "Write",
    desc: "Create a content pack: markdown files with YAML frontmatter, a schedule, and an email shell.",
  },
  {
    n: "03",
    title: "Deploy",
    desc: "Push to Vercel or any Node.js host. Set env vars. Done.",
  },
  {
    n: "04",
    title: "Drip",
    desc: "Subscribers choose their time. One lesson per day, in their timezone.",
  },
];

// Timing
const STEP_DURATION = 3000;
const TOTAL = STEPS.length * STEP_DURATION;

// ── Clone: terminal lines ──
const CLONE_LINES = [
  { type: "cmd" as const, text: "git clone content-drip.git my-course" },
  { type: "out" as const, text: "Cloning into 'my-course'..." },
  { type: "ok" as const, text: "✓ Done" },
  { type: "cmd" as const, text: "cd my-course && npm install" },
  { type: "out" as const, text: "added 247 packages in 8s" },
];

// ── Deploy: terminal lines ──
const DEPLOY_LINES = [
  { type: "cmd" as const, text: "vercel --prod" },
  { type: "out" as const, text: "Building..." },
  { type: "out" as const, text: "Deploying to production..." },
  { type: "ok" as const, text: "✓ Production: https://my-course.vercel.app" },
];

// ── Write: editor lines ──
const EDITOR_LINES = [
  { color: "#444", text: "---" },
  { color: "#666", text: 'subject: "Day 1: Getting Started"' },
  { color: "#666", text: 'preview: "Your first lesson awaits"' },
  { color: "#444", text: "---" },
  { color: "#666", text: "" },
  { color: "#666", text: "Good morning!" },
  { color: "#666", text: "" },
  { color: "#666", text: "Today we're covering the fundamentals" },
  { color: "#666", text: "of building email courses..." },
  { color: "#666", text: "" },
  { color: "#666", text: "## The Key Idea" },
  { color: "#666", text: "" },
  { color: "#666", text: "Write in standard **markdown**." },
  { color: "#666", text: "" },
  { color: "#c8ff00", text: "[Read online →]({{companionUrl}})" },
];

// ── Drip: inbox emails ──
const INBOX_EMAILS = [
  { label: "Welcome", subject: "Welcome to the course!" },
  { label: "Day 1", subject: "Day 1: Getting Started" },
  { label: "Day 2", subject: "Day 2: Going Deeper" },
  { label: "Day 3", subject: "Day 3: Advanced Topics" },
];

export function HowItWorksSection() {
  // Auto-loop timer
  const [autoTick, setAutoTick] = useState(0);
  const autoStartRef = useRef(0);
  const idRef = useRef(0);

  // Manual interaction state
  const [manualStep, setManualStep] = useState<number | null>(null);
  const [manualStart, setManualStart] = useState(0);
  const [manualTick, setManualTick] = useState(0);

  useEffect(() => {
    autoStartRef.current = performance.now();

    function loop(now: number) {
      // Always tick the manual animation if active
      if (manualStep !== null) {
        setManualTick(now);
      } else {
        setAutoTick((now - autoStartRef.current) % TOTAL);
      }
      idRef.current = requestAnimationFrame(loop);
    }
    idRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(idRef.current);
  }, [manualStep]);

  const autoStep = Math.floor(autoTick / STEP_DURATION);
  const autoProgress = (autoTick % STEP_DURATION) / STEP_DURATION;

  // Manual progress: plays 0→1 over STEP_DURATION then clamps at 1
  const manualElapsed = manualTick - manualStart;
  const manualProgress = Math.min(1, manualElapsed / STEP_DURATION);

  const activeStep = manualStep ?? autoStep;
  const stepProgress = manualStep !== null ? manualProgress : autoProgress;

  function handleStepEnter(i: number) {
    setManualStep(i);
    setManualStart(performance.now());
    setManualTick(performance.now());
  }

  function handleMouseLeave() {
    setManualStep(null);
    // Reset auto timer so it starts fresh from the current step
    autoStartRef.current = performance.now() - activeStep * STEP_DURATION;
  }

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Step cards */}
      <div
        className="grid gap-px bg-[#1a1a1a] p-px sm:grid-cols-2"
        onMouseLeave={handleMouseLeave}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className="cursor-pointer bg-[#050505] p-5 transition-all duration-300 md:p-6"
            style={{
              borderLeft:
                i === activeStep
                  ? "2px solid #c8ff00"
                  : "2px solid transparent",
            }}
            onClick={() => handleStepEnter(i)}
            onMouseEnter={() => handleStepEnter(i)}
          >
            <span
              className="font-mono text-[13px] transition-colors duration-300"
              style={{
                color:
                  i === activeStep ? "#c8ff00" : "rgba(200,255,0,0.4)",
              }}
            >
              {s.n}
            </span>
            <h3 className="mt-2 text-xl font-bold tracking-tight">
              {s.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#777]">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Animated visual — changes per step */}
      <div className="lg:sticky lg:top-8">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
          {activeStep === 0 && (
            <TerminalPanel
              lines={CLONE_LINES}
              progress={stepProgress}
              label="terminal"
            />
          )}
          {activeStep === 1 && (
            <EditorPanel progress={stepProgress} />
          )}
          {activeStep === 2 && (
            <TerminalPanel
              lines={DEPLOY_LINES}
              progress={stepProgress}
              label="terminal"
            />
          )}
          {activeStep === 3 && (
            <InboxPanel progress={stepProgress} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Terminal panel (Clone & Deploy) ──

function TerminalPanel({
  lines,
  progress,
  label,
}: {
  lines: { type: "cmd" | "out" | "ok"; text: string }[];
  progress: number;
  label: string;
}) {
  const visibleCount = Math.min(
    lines.length,
    Math.floor(progress * (lines.length + 1))
  );
  const currentlyTyping = visibleCount < lines.length;
  const typingLine = currentlyTyping ? lines[visibleCount] : null;
  const lineProgress =
    (progress * (lines.length + 1)) % 1;
  const typedChars = typingLine
    ? Math.floor(lineProgress * typingLine.text.length)
    : 0;

  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-[#333]" />
        <span className="h-2 w-2 rounded-full bg-[#333]" />
        <span className="h-2 w-2 rounded-full bg-[#333]" />
        <span className="ml-auto font-mono text-xs text-[#333]">
          {label}
        </span>
      </div>
      <div className="h-[280px] p-4 font-mono text-[13px] leading-[1.9]">
        {lines.slice(0, visibleCount).map((line, i) => (
          <TerminalLine key={i} line={line} />
        ))}
        {typingLine?.type === "cmd" && (
          <p>
            <span className="text-[#c8ff00]">$</span>{" "}
            <span className="text-[#999]">
              {typingLine.text.slice(0, typedChars)}
            </span>
            <span className="animate-cursor-blink ml-0.5 inline-block h-3.5 w-[7px] translate-y-[3px] bg-[#c8ff00]" />
          </p>
        )}
      </div>
    </>
  );
}

function TerminalLine({
  line,
}: {
  line: { type: "cmd" | "out" | "ok"; text: string };
}) {
  if (line.type === "cmd") {
    return (
      <p>
        <span className="text-[#c8ff00]">$</span>{" "}
        <span className="text-[#999]">{line.text}</span>
      </p>
    );
  }
  if (line.type === "ok") {
    return <p className="text-[#c8ff00]/60">{line.text}</p>;
  }
  return <p className="text-[#444]">{line.text}</p>;
}

// ── Editor panel (Write) ──

function EditorPanel({ progress }: { progress: number }) {
  const visibleLines = Math.min(
    EDITOR_LINES.length,
    Math.floor(progress * (EDITOR_LINES.length + 2))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#333]" />
          <span className="h-2 w-2 rounded-full bg-[#333]" />
          <span className="h-2 w-2 rounded-full bg-[#333]" />
        </div>
        <span className="font-mono text-xs text-[#444]">
          emails/day-1.md
        </span>
      </div>
      <div
        ref={containerRef}
        className="h-[280px] overflow-hidden p-4 font-mono text-[13px] leading-[1.9]"
      >
        {EDITOR_LINES.slice(0, visibleLines).map((line, i) => (
          <p key={i} style={{ color: line.color, minHeight: "1.9em" }}>
            {line.text || "\u00A0"}
          </p>
        ))}
        {visibleLines < EDITOR_LINES.length && (
          <span className="animate-cursor-blink inline-block h-3.5 w-[7px] translate-y-[1px] bg-[#c8ff00]" />
        )}
      </div>
    </>
  );
}

// ── Inbox panel (Drip) ──

function InboxPanel({ progress }: { progress: number }) {
  const visibleCount = Math.min(
    INBOX_EMAILS.length,
    Math.floor(progress * (INBOX_EMAILS.length + 1.5))
  );

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-4 py-2">
        <svg
          className="h-4 w-4 text-[#333]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-17.5 0V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v6.75m-19.5 0v4.5A2.25 2.25 0 004.5 20.25h15a2.25 2.25 0 002.25-2.25v-4.5"
          />
        </svg>
        <span className="font-mono text-xs text-[#444]">
          Subscriber inbox
        </span>
        <span className="ml-auto font-mono text-[10px] text-[#333]">
          you@example.com
        </span>
      </div>
      <div className="h-[280px] p-3">
        <div className="space-y-2">
          {INBOX_EMAILS.map((email, i) => {
            const visible = i < visibleCount;
            const isLatest = i === visibleCount - 1;

            return (
              <div
                key={email.label}
                className="transition-all duration-300"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? "translateY(0)"
                    : "translateY(-6px)",
                }}
              >
                <div
                  className="flex items-center gap-3 border px-4 py-3 transition-colors duration-500"
                  style={{
                    borderColor: isLatest ? "#c8ff0030" : "#1a1a1a",
                    backgroundColor: isLatest
                      ? "rgba(200,255,0,0.02)"
                      : "transparent",
                  }}
                >
                  <svg
                    className="h-4 w-4 shrink-0 transition-colors duration-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={isLatest ? "#c8ff00" : "#333"}
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p
                      className="font-mono text-[12px] font-bold transition-colors duration-500"
                      style={{
                        color: isLatest ? "#c8ff00" : "#666",
                      }}
                    >
                      {email.label}
                    </p>
                    <p className="truncate font-mono text-[11px] text-[#444]">
                      {email.subject}
                    </p>
                  </div>
                  <div className="ml-auto flex shrink-0 gap-1.5">
                    <div
                      className="h-1 w-6 rounded-full transition-colors duration-500"
                      style={{
                        backgroundColor: isLatest
                          ? "#c8ff0015"
                          : "#111",
                      }}
                    />
                    <div
                      className="h-1 w-4 rounded-full transition-colors duration-500"
                      style={{
                        backgroundColor: isLatest
                          ? "#c8ff0010"
                          : "#0d0d0d",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

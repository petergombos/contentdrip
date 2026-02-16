"use client";

import { useEffect, useRef, useState } from "react";

/*
  Looping animation:
  1. Email types into subscribe input
  2. Button → "Check your inbox…" → "✓ Confirmed"
  3. Scrolling list: Confirm email, Welcome, Day 1–7
     - Confirmation email is just another item in the list
     - Day 7 marked as "Course complete" with a checkmark
  4. Items scroll up and fade behind the subscribe form
  5. Hold, then loop
*/

const EMAIL = "you@example.com";

// All items in the drip list (confirmation + welcome + days)
const ITEMS = [
  { label: "Confirm subscription", type: "confirm" as const },
  { label: "Welcome", type: "email" as const },
  { label: "Day 1", type: "email" as const },
  { label: "Day 2", type: "email" as const },
  { label: "Day 3", type: "email" as const },
  { label: "Day 4", type: "email" as const },
  { label: "Day 5", type: "email" as const },
  { label: "Day 6", type: "email" as const },
  { label: "Day 7", type: "complete" as const },
];

const TYPE_START = 400;
const TYPE_CHAR_MS = 60;
const SUBSCRIBE_AT = TYPE_START + EMAIL.length * TYPE_CHAR_MS + 400;
const CONFIRMED_AT = SUBSCRIBE_AT + 800;
const DRIP_START = CONFIRMED_AT + 400;
const DRIP_INTERVAL = 800;
const HOLD = 3000;

const TOTAL = DRIP_START + ITEMS.length * DRIP_INTERVAL + HOLD;

export function HeroAnimation() {
  const [tick, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start = performance.now();
    let id: number;

    function loop(now: number) {
      setTick((now - start) % TOTAL);
      id = requestAnimationFrame(loop);
    }

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const typedChars = Math.min(
    EMAIL.length,
    Math.max(0, Math.floor((tick - TYPE_START) / TYPE_CHAR_MS))
  );
  const typedText = EMAIL.slice(0, typedChars);
  const showCursor = tick < SUBSCRIBE_AT;
  const subscribed = tick >= SUBSCRIBE_AT;
  const confirmed = tick >= CONFIRMED_AT;
  const drippedCount = confirmed
    ? Math.min(
        ITEMS.length,
        Math.floor((tick - DRIP_START) / DRIP_INTERVAL) + 1
      )
    : 0;
  const allComplete = drippedCount >= ITEMS.length;

  useEffect(() => {
    if (scrollRef.current && drippedCount > 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [drippedCount]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative w-full max-w-xs">
        {/* Subscribe card */}
        <div className="relative z-10">
          <div
            className="border border-[#1a1a1a] bg-[#0a0a0a] transition-all duration-500"
            style={{
              boxShadow: confirmed
                ? "0 0 40px rgba(200,255,0,0.04)"
                : "none",
            }}
          >
            <div className="border-b border-[#1a1a1a] p-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#333]">
                Email
              </div>
              <div className="flex h-8 items-center border border-[#1a1a1a] bg-[#050505] px-3">
                <span className="font-mono text-[13px] text-[#666]">
                  {typedText}
                </span>
                {showCursor && (
                  <span className="ml-0.5 inline-block h-3.5 w-[1.5px] animate-cursor-blink bg-[#c8ff00]" />
                )}
              </div>
            </div>

            <div className="p-4">
              <div
                className="flex h-8 items-center justify-center font-mono text-[12px] font-bold uppercase tracking-widest transition-all duration-300"
                style={{
                  backgroundColor: allComplete ? "#c8ff00" : "#1a1a1a",
                  color: allComplete
                    ? "#050505"
                    : confirmed
                      ? "#555"
                      : "#444",
                }}
              >
                {allComplete
                  ? "\u2713 Course complete"
                  : confirmed
                    ? "\u2713 Confirmed"
                    : subscribed
                      ? "Check your inbox\u2026"
                      : "Subscribe"}
              </div>
            </div>
          </div>
        </div>

        {/* Connector line */}
        <div className="relative z-10 flex justify-center">
          <div
            className="h-6 w-px transition-transform duration-500"
            style={{
              backgroundColor: "#1a1a1a",
              transform: `scaleY(${drippedCount > 0 ? 1 : 0})`,
              transformOrigin: "top",
            }}
          />
        </div>

        {/* Scrolling drip list with top fade */}
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(to bottom, #050505 0%, transparent 100%)",
              opacity: drippedCount > 4 ? 1 : 0,
            }}
          />

          <div
            ref={scrollRef}
            className="h-[220px] overflow-hidden"
          >
            <div>
              {Array.from({ length: drippedCount }, (_, i) => {
                const item = ITEMS[i];
                const isLatest = i === drippedCount - 1;
                const isComplete = item.type === "complete";
                const isConfirm = item.type === "confirm";

                return (
                  <div key={i}>
                    {/* Delay indicator */}
                    {i > 0 && !isConfirm && (
                      <div className="flex items-center py-1">
                        <div className="flex flex-1 justify-center">
                          <div className="flex items-center gap-2">
                            <div className="h-px w-6 border-t border-dashed border-[#222]" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#333]">
                              {i === 1 ? "instant" : "24h later"}
                            </span>
                            <div className="h-px w-6 border-t border-dashed border-[#222]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item card */}
                    <div
                      className="flex items-center gap-3 border px-4 py-3 transition-colors duration-500"
                      style={{
                        borderColor:
                          isComplete && isLatest
                            ? "#c8ff00"
                            : isLatest
                              ? "#c8ff0030"
                              : "#1a1a1a",
                        backgroundColor:
                          isComplete && isLatest
                            ? "rgba(200,255,0,0.03)"
                            : "#0a0a0a",
                      }}
                    >
                      {/* Icon */}
                      {isConfirm ? (
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={isLatest ? "#c8ff00" : "#333"}
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : isComplete ? (
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={isLatest ? "#c8ff00" : "#333"}
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 shrink-0"
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
                      )}

                      {/* Label */}
                      <span
                        className="font-mono text-[13px] transition-colors duration-500"
                        style={{
                          color:
                            isComplete && isLatest
                              ? "#c8ff00"
                              : isLatest
                                ? "#c8ff00"
                                : "#555",
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Right side */}
                      {isComplete && isLatest ? (
                        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[#c8ff00]">
                          Complete
                        </span>
                      ) : (
                        <div className="ml-auto flex gap-1.5">
                          <div
                            className="h-1 w-8 rounded-full transition-colors duration-500"
                            style={{
                              backgroundColor: isLatest
                                ? "#c8ff0015"
                                : "#111",
                            }}
                          />
                          <div
                            className="h-1 w-5 rounded-full transition-colors duration-500"
                            style={{
                              backgroundColor: isLatest
                                ? "#c8ff0010"
                                : "#0d0d0d",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

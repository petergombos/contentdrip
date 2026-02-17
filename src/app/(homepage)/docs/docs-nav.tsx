"use client";

import { useEffect, useRef, useState } from "react";

type NavGroup = {
  category: string;
  items: { id: string; label: string }[];
};

export function DocsNav({ items }: { items: NavGroup[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ids = items.flatMap((g) => g.items.map((i) => i.id));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [items]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-[#1a1a1a] lg:block">
        <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-5 py-8">
          {items.map((group) => (
            <div key={group.category} className="mb-6">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#555]">
                {group.category}
              </p>
              <ul className="mt-2.5 space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block py-1 font-mono text-[13px] no-underline transition-colors ${
                        activeId === item.id
                          ? "text-[#c8ff00]"
                          : "text-[#777] hover:text-[#c8ff00]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile TOC */}
      <details className="mx-6 mt-10 border border-[#1a1a1a] md:mx-10 lg:hidden">
        <summary className="cursor-pointer px-4 py-3 font-mono text-[13px] font-bold uppercase tracking-widest text-[#666]">
          Table of Contents
        </summary>
        <div className="border-t border-[#1a1a1a] px-4 py-4">
          {items.map((group) => (
            <div key={group.category} className="mb-4 last:mb-0">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#555]">
                {group.category}
              </p>
              <ul className="mt-1.5 space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block py-0.5 font-mono text-[13px] no-underline transition-colors ${
                        activeId === item.id
                          ? "text-[#c8ff00]"
                          : "text-[#777] hover:text-[#c8ff00]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}

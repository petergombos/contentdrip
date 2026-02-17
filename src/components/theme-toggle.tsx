"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const options = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5">
        {options.map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground"
            disabled
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="sr-only">{label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="icon"
          className={`h-7 w-7 rounded-md ${
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTheme(value)}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  );
}

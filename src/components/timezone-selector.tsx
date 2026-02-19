"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Build a human-readable label for an IANA timezone.
 * e.g. "Europe/Budapest" → "Europe/Budapest (GMT+1)"
 */
function formatTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const display = tz.replace(/_/g, " ");
    return `${display} (${offsetPart})`;
  } catch {
    return tz.replace(/_/g, " ");
  }
}

function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older environments
    return [
      "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
      "America/Phoenix", "America/Anchorage", "Pacific/Honolulu", "UTC",
      "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Budapest",
      "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Australia/Sydney",
    ];
  }
}

interface TimezoneSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function TimezoneSelector({
  value,
  onValueChange,
}: TimezoneSelectorProps) {
  const [detectedTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  });

  useEffect(() => {
    if (!value) {
      onValueChange(detectedTimezone);
    }
  }, [value, onValueChange, detectedTimezone]);

  const displayValue = value || detectedTimezone || "UTC";

  const timezones = useMemo(() => {
    const all = getAllTimezones();
    // Ensure the current value and detected timezone are always in the list
    const extras = [displayValue, detectedTimezone].filter(
      (tz) => tz && !all.includes(tz)
    );
    return [...extras, ...all];
  }, [displayValue, detectedTimezone]);

  return (
    <Select value={displayValue} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 w-full">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timezones.map((tz) => (
          <SelectItem key={tz} value={tz}>
            {formatTimezoneLabel(tz)}
            {tz === detectedTimezone && " ✓"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

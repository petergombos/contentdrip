"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Common timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

interface TimezoneSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function TimezoneSelector({
  value,
  onValueChange,
}: TimezoneSelectorProps) {
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  useEffect(() => {
    // Auto-detect timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(tz);
      if (!value) {
        onValueChange(tz);
      }
    } catch {
      // Fallback to UTC
      setDetectedTimezone("UTC");
      if (!value) {
        onValueChange("UTC");
      }
    }
  }, [value, onValueChange]);

  const displayValue = value || detectedTimezone || "UTC";
  const displayLabel =
    TIMEZONES.find((tz) => tz.value === displayValue)?.label || displayValue;

  return (
    <Select value={displayValue} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {TIMEZONES.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
            {tz.value === detectedTimezone && " (detected)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

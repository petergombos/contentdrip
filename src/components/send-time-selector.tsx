"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Generate hours (0-23)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface SendTimeSelectorProps {
  value?: number; // Hour (0-23)
  onValueChange: (hour: number) => void;
}

export function SendTimeSelector({
  value = 8,
  onValueChange,
}: SendTimeSelectorProps) {
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onValueChange(parseInt(val, 10))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {HOURS.map((hour) => (
          <SelectItem key={hour} value={hour.toString()}>
            {formatHour(hour)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Convert hour (0-23) to cron expression for a specific interval pattern
 * This modifies the hour in a cron expression
 */
export function hourToCron(hour: number, baseCron: string): string {
  const parts = baseCron.split(" ");
  if (parts.length >= 2) {
    parts[1] = hour.toString(); // Replace hour
  }
  return parts.join(" ");
}

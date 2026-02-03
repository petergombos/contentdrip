"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface IntervalOption {
  label: string;
  cronExpression: string;
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: "Daily", cronExpression: "0 8 * * *" }, // Daily at 8am
  { label: "Weekdays only", cronExpression: "0 9 * * 1-5" }, // Weekdays at 9am
  { label: "Weekly (Monday)", cronExpression: "0 7 * * 1" }, // Monday at 7am
  { label: "Twice daily (8am & 6pm)", cronExpression: "0 8,18 * * *" },
];

export function intervalToCron(interval: string): string {
  const option = INTERVAL_OPTIONS.find((opt) => opt.label === interval);
  return option?.cronExpression || INTERVAL_OPTIONS[0].cronExpression;
}

export function cronToInterval(cronExpression: string): string {
  const option = INTERVAL_OPTIONS.find(
    (opt) => opt.cronExpression === cronExpression
  );
  return option?.label || INTERVAL_OPTIONS[0].label;
}

interface IntervalSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function IntervalSelector({
  value,
  onValueChange,
}: IntervalSelectorProps) {
  return (
    <Select
      value={value || INTERVAL_OPTIONS[0].label}
      onValueChange={onValueChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select interval" />
      </SelectTrigger>
      <SelectContent>
        {INTERVAL_OPTIONS.map((option) => (
          <SelectItem key={option.label} value={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

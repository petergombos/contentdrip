"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FrequencyOption {
  label: string;
  cronExpression: string; // hour field is a placeholder; always merged with user-selected hour
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { label: "Daily", cronExpression: "0 8 * * *" },
  { label: "Weekdays", cronExpression: "0 8 * * 1-5" },
  { label: "Weekends", cronExpression: "0 8 * * 0,6" },
];

export function frequencyToCron(frequency: string): string {
  const option = FREQUENCY_OPTIONS.find((opt) => opt.label === frequency);
  return option?.cronExpression || FREQUENCY_OPTIONS[0].cronExpression;
}

export function cronToFrequency(cronExpression: string): string {
  const option = FREQUENCY_OPTIONS.find(
    (opt) => opt.cronExpression === cronExpression,
  );
  return option?.label || FREQUENCY_OPTIONS[0].label;
}

interface FrequencySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function FrequencySelector({
  value,
  onValueChange,
}: FrequencySelectorProps) {
  return (
    <Select
      value={value || FREQUENCY_OPTIONS[0].label}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select frequency" />
      </SelectTrigger>
      <SelectContent>
        {FREQUENCY_OPTIONS.map((option) => (
          <SelectItem key={option.label} value={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

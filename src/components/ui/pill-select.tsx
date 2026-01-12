"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/select";

export interface OptionGroup<T extends string> {
  label: string;
  options: T[];
}

interface PillSelectProps<T extends string> {
  value: T;
  onChange: (newValue: T) => void;
  groups: OptionGroup<T>[];
  getPillClasses: (value: T) => string;
  getHoverClasses: (value: T) => string;
  getDisplayName?: (value: T) => string;
  align?: "start" | "center" | "end";
  className?: string;
  showShadow?: boolean;
  disabled?: boolean;
}

export function PillSelect<T extends string>({
  value,
  onChange,
  groups,
  getPillClasses,
  getHoverClasses,
  getDisplayName,
  align = "end",
  className,
  showShadow = true,
  disabled = false,
}: PillSelectProps<T>) {
  // Normalize value to lowercase for case-insensitive comparison
  const normalizedValue = value?.toLowerCase() as T;
  const [optimisticValue, setOptimisticValue] = useState<T>(value);

  // Sync optimistic value with prop changes (in case of API errors or external updates)
  useEffect(() => {
    setOptimisticValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    if (disabled) return; // Prevent changes when disabled

    const normalizedNewValue = newValue?.toLowerCase();
    if (normalizedNewValue !== normalizedValue) {
      // Immediately update the UI optimistically
      setOptimisticValue(normalizedNewValue as T);
      // Call the API in the background
      onChange(normalizedNewValue as T);
    }
  };

  return (
    <Select value={optimisticValue} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-auto rounded-full border-0 px-2 py-0.5 text-xs font-semibold [&>svg]:hidden",
          showShadow ? "shadow-sm" : "shadow-none",
          disabled && "pointer-events-none cursor-default",
          getPillClasses(optimisticValue),
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {getDisplayName ? getDisplayName(optimisticValue) : optimisticValue}
      </SelectTrigger>
      <SelectContent
        align={align}
        className={cn("min-w-[180px] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2")}
        onClick={(e) => e.stopPropagation()}
      >
        {groups?.map((group, groupIndex) => (
          <div key={group.label || groupIndex}>
            {groupIndex > 0 && <div className="my-2 h-px bg-[var(--border-subtle)]" />}
            {group.label && <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{group.label}</div>}
            {group.options?.map((option) => {
              const normalizedOption = option?.toLowerCase() as T;
              return (
                <SelectItem
                  key={option}
                  value={normalizedOption}
                  className={cn("my-1 cursor-pointer rounded-md px-2 py-1 transition-colors focus:outline-none", getHoverClasses(option))}
                >
                  <span className={cn("inline-block w-fit rounded-full px-3 py-0.5 text-xs font-semibold", getPillClasses(option))}>
                    {getDisplayName ? getDisplayName(option) : option}
                  </span>
                </SelectItem>
              );
            })}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}

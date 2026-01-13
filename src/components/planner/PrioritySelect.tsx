"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Equal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface PrioritySelectProps {
  priority: string | undefined;
  onPriorityChange: (priority: string | null) => void;
  className?: string;
  placeholder?: string;
}

const PRIORITY_OPTIONS = [
  { value: "Highest", label: "Highest", icon: ChevronsUp },
  { value: "High", label: "High", icon: ArrowUp },
  { value: "Medium", label: "Medium", icon: Equal },
  { value: "Low", label: "Low", icon: ArrowDown },
  { value: "Lowest", label: "Lowest", icon: ChevronsDown },
];

function getPriorityIcon(priority: string | undefined) {
  const option = PRIORITY_OPTIONS.find((opt) => opt.value?.toLowerCase() === priority?.toLowerCase());
  if (!option?.icon) return null;
  const Icon = option.icon;
  return <Icon className={cn("h-4 w-4", getPriorityColor(priority))} />;
}

function getPriorityColor(priority: string | undefined): string {
  const p = priority?.toLowerCase();
  if (p === "lowest") return "text-gray-500";
  if (p === "low") return "text-blue-500";
  if (p === "medium") return "text-yellow-500";
  if (p === "high") return "text-orange-500";
  if (p === "highest") return "text-rose-500";
  return "text-[var(--text-muted)]";
}

export function PrioritySelect({ priority, onPriorityChange, className, placeholder = "-" }: PrioritySelectProps) {
  const [optimisticPriority, setOptimisticPriority] = useState(priority);

  // Sync optimistic value with prop changes (in case of API errors or external updates)
  useEffect(() => {
    setOptimisticPriority(priority);
  }, [priority]);

  const currentOption = PRIORITY_OPTIONS.find((opt) => opt.value?.toLowerCase() === optimisticPriority?.toLowerCase());

  const handleValueChange = (newValue: string) => {
    // Immediately update the UI optimistically
    setOptimisticPriority(newValue?.toLowerCase());
    // Send lowercase value to API in the background
    onPriorityChange(newValue?.toLowerCase());
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimisticPriority("");
    onPriorityChange(null);
  };

  return (
    <div className="relative inline-flex items-center">
      <Select value={optimisticPriority || "__none__"} onValueChange={handleValueChange}>
        <SelectTrigger
          className={cn(
            "h-auto w-auto max-w-[200px] rounded-md border-0 px-2 py-1 text-sm font-medium shadow-none transition-colors hover:bg-[var(--surface-hover)] focus:ring-0 [&>svg]:hidden",
            optimisticPriority && "pr-8",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <SelectValue>
            <div className={cn("flex max-w-full items-center gap-1.5 overflow-hidden", optimisticPriority && "pr-3")}>
              {optimisticPriority && <span className="flex-shrink-0">{getPriorityIcon(optimisticPriority)}</span>}
              <span className="truncate">{currentOption?.label ?? placeholder}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className={cn("max-h-[300px] min-w-[180px] overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2")}
          onClick={(e) => e.stopPropagation()}
        >
          {PRIORITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="my-1 cursor-pointer rounded-md px-2 py-1 text-sm transition-colors hover:bg-[var(--surface-hover)] focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", getPriorityColor(option.value))} />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {optimisticPriority && (
        <button
          onClick={handleClear}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm opacity-50 transition-opacity hover:opacity-100"
          aria-label="Clear priority"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/ui/button";
import { weekOfMonth } from "@/utils/calendar-utils";

interface CalendarHeaderProps {
  title: string;
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateSelect?: () => void;
  /**
   * Whether the current calendar view includes today's date.
   * When false, the Today button is rendered in a neutral style.
   */
  isTodayInRange?: boolean;
}

/**
 * Calendar Header with navigation controls
 * Matches old implementation design with date badge
 */
export function CalendarHeader({ title, currentDate, onPrevious, onNext, onToday, isTodayInRange = true }: CalendarHeaderProps) {
  const month = currentDate.toLocaleString("en-US", { month: "long" });
  const monthShort = currentDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = currentDate.getDate();
  const wk = weekOfMonth(currentDate);

  const todayButtonClasses = isTodayInRange
    ? "h-9 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--text-on-accent)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)]"
    : "h-9 rounded-full bg-[var(--accent-subtle)] px-4 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]";

  return (
    <div className="flex items-center justify-between p-3 lg:p-4">
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Date badge */}
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-[var(--accent-soft)] bg-[var(--surface-elevated)] shadow-sm lg:h-16 lg:w-16">
          <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">{monthShort}</div>
          <div className="text-2xl font-semibold leading-none text-[var(--text)]">{day}</div>
          <div className="mt-1 h-1.5 w-8 rounded-full bg-[var(--accent)]" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[var(--text)] lg:text-2xl">{month}</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">Week {wk}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">{title}</div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--accent-subtle)] px-2 py-1">
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full border-0 px-0 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          onClick={onPrevious}
          aria-label="Previous period"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="ghost" className={todayButtonClasses} onClick={onToday}>
          Today
        </Button>

        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full border-0 px-0 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          onClick={onNext}
          aria-label="Next period"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

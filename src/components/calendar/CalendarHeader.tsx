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
}

/**
 * Calendar Header with navigation controls
 * Matches old implementation design with date badge
 */
export function CalendarHeader({ title, currentDate, onPrevious, onNext, onToday }: CalendarHeaderProps) {
  const month = currentDate.toLocaleString("en-US", { month: "long" });
  const monthShort = currentDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = currentDate.getDate();
  const wk = weekOfMonth(currentDate);

  return (
    <div className="flex items-center justify-between p-3 lg:p-4">
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Date badge */}
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm lg:h-16 lg:w-16">
          <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{monthShort}</div>
          <div className="text-2xl font-semibold leading-none text-gray-900">{day}</div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900 lg:text-2xl">{month}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Week {wk}</span>
          </div>
          <div className="text-xs text-gray-500">{title}</div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center rounded-lg border border-gray-200 text-gray-900 shadow-sm">
        <Button variant="ghost" className="h-9 rounded-l-lg rounded-r-none border-0 px-3 hover:bg-gray-50" onClick={onPrevious} aria-label="Previous period">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="ghost" className="h-9 rounded-none border-x border-gray-200 px-3 font-semibold hover:bg-gray-50" onClick={onToday}>
          Today
        </Button>

        <Button variant="ghost" className="h-9 rounded-l-none rounded-r-lg border-0 px-3 hover:bg-gray-50" onClick={onNext} aria-label="Next period">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface CalendarCardProps {
    /** Initial date to display, defaults to today */
    initialDate?: Date;
    /** Minimum selectable date */
    minDate?: Date;
    /** Maximum selectable date */
    maxDate?: Date;
    /** Callback when a date is selected */
    onSelect?: (date: Date) => void;
    /** Additional CSS classes */
    className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function CalendarCard({ initialDate = new Date(), minDate = new Date(), maxDate, onSelect, className }: CalendarCardProps) {
    const [viewDate, setViewDate] = useState(initialDate);

    const calendarData = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // Get first day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get the starting date (might be from previous month)
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const weeks: Date[][] = [];
        const current = new Date(startDate);

        // Generate 6 weeks of dates
        for (let week = 0; week < 6; week++) {
            const weekDates: Date[] = [];
            for (let day = 0; day < 7; day++) {
                weekDates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            weeks.push(weekDates);
        }

        return { weeks, month, year, firstDay, lastDay };
    }, [viewDate]);

    const goToPreviousMonth = () => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const isDateDisabled = (date: Date) => {
        if (minDate) {
            // Normalize both dates to start of day for proper comparison
            const normalizedDate = new Date(date);
            normalizedDate.setHours(0, 0, 0, 0);

            const normalizedMinDate = new Date(minDate);
            normalizedMinDate.setHours(0, 0, 0, 0);

            if (normalizedDate < normalizedMinDate) return true;
        }

        if (maxDate) {
            // Normalize both dates to start of day for proper comparison
            const normalizedDate = new Date(date);
            normalizedDate.setHours(0, 0, 0, 0);

            const normalizedMaxDate = new Date(maxDate);
            normalizedMaxDate.setHours(0, 0, 0, 0);

            if (normalizedDate > normalizedMaxDate) return true;
        }

        return false;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === calendarData.month;
    };

    const handleDateClick = (date: Date) => {
        if (isDateDisabled(date)) return;
        onSelect?.(date);
    };

    return (
        <div className={cx("w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg", className)}>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={goToPreviousMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                >
                    <ChevronLeft className="size-4" />
                </button>

                <h3 className="text-sm font-semibold text-gray-900">
                    {MONTHS[calendarData.month]} {calendarData.year}
                </h3>

                <button
                    onClick={goToNextMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            {/* Days of week */}
            <div className="mb-2 grid grid-cols-7 gap-1">
                {DAYS.map((day) => (
                    <div key={day} className="py-1 text-center text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarData.weeks.map((week, weekIndex) =>
                    week.map((date, dayIndex) => {
                        const disabled = isDateDisabled(date);
                        const today = isToday(date);
                        const currentMonth = isCurrentMonth(date);

                        return (
                            <button
                                key={`${weekIndex}-${dayIndex}`}
                                onClick={() => handleDateClick(date)}
                                disabled={disabled}
                                className={cx(
                                    "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
                                    // Base styles
                                    "hover:bg-gray-50",
                                    // Current month vs other months
                                    currentMonth ? "text-gray-900" : "text-gray-400",
                                    // Today highlight
                                    today && "bg-violet-50 font-medium text-violet-600",
                                    // Disabled state
                                    disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                                    // Hover and focus states
                                    !disabled && !today && "hover:bg-gray-50 focus:bg-violet-50 focus:text-violet-600",
                                    // Focus ring
                                    "focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 focus:outline-none",
                                )}
                            >
                                {date.getDate()}
                            </button>
                        );
                    }),
                )}
            </div>
        </div>
    );
}

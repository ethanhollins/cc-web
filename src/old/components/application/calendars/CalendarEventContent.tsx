import React from "react";
import { EventContentArg } from "@fullcalendar/core";
import { calculateEventDuration, isShortEvent } from "@/old/utils/calendar-utils";

interface CalendarEventContentProps {
  arg: EventContentArg;
}

/**
 * Shared event content renderer for calendar components
 */
export function CalendarEventContent({ arg }: CalendarEventContentProps) {
  // Calculate event duration in minutes
  const durationMinutes = calculateEventDuration(arg.event.start, arg.event.end);
  const isEventShort = isShortEvent(arg.event.start, arg.event.end);

  // Get color band settings from event extended props
  const bandColor = arg.event.extendedProps?.bandColor || "#3b82f6"; // Default blue
  const showBand = arg.event.extendedProps?.showBand !== false; // Show by default

  // Check if event is completed (Done or Removed status, or marked as completed)
  const isCompleted =
    arg.event.extendedProps?.ticket_status === "Done" || arg.event.extendedProps?.ticket_status === "Removed" || arg.event.extendedProps?.completed === true;

  // Use compact layout for events less than 30 minutes
  if (isEventShort) {
    const durationText = `${Math.round(durationMinutes)}m`;

    return (
      <div className="relative flex h-full items-center justify-between gap-1 overflow-hidden px-1">
        {/* Color band on the left */}
        {showBand && <div className="absolute left-0 top-0 h-full w-1 flex-shrink-0 rounded-l" style={{ backgroundColor: bandColor }} />}

        {/* Diagonal lines overlay for completed items */}
        {isCompleted && (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 4px,
                                #6b7280 4px,
                                #6b7280 5.5px
                            )`,
            }}
          />
        )}

        <div className={`flex-1 truncate text-xs font-medium leading-4 ${showBand ? "ml-2" : ""} ${isCompleted ? "opacity-60" : ""}`}>{arg.event.title}</div>

        <div className="whitespace-nowrap text-xs opacity-70">{durationText}</div>
      </div>
    );
  }

  // Default layout for longer events
  return (
    <div className="relative h-full overflow-hidden p-1">
      {/* Color band on the left */}
      {showBand && <div className="absolute left-0 top-0 h-full w-1 flex-shrink-0 rounded-l" style={{ backgroundColor: bandColor }} />}

      {/* Diagonal lines overlay for completed items */}
      {isCompleted && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 4px,
                            #6b7280 4px,
                            #6b7280 5.5px
                        )`,
          }}
        />
      )}

      <div className={`h-full ${showBand ? "ml-2" : ""}`}>
        {/* For events less than 45 minutes: single line with ellipses, no ticket key */}
        {durationMinutes < 45 ? (
          <>
            <div className={`truncate text-xs font-semibold leading-5 ${isCompleted ? "opacity-60" : ""}`}>{arg.event.title}</div>

            <div className="mt-1 text-xs opacity-70">{arg.timeText}</div>
          </>
        ) : (
          /* For events 45+ minutes: two lines with ellipses, show ticket key above time */
          <>
            <div className={`line-clamp-2 text-xs font-semibold leading-5 ${isCompleted ? "opacity-60" : ""}`}>{arg.event.title}</div>

            {/* Show ticket key if available */}
            {arg.event.extendedProps?.ticket_key && <div className="mt-1 text-xs opacity-60">{arg.event.extendedProps.ticket_key}</div>}

            <div className="mt-1 text-xs opacity-70">{arg.timeText}</div>
          </>
        )}
      </div>
    </div>
  );
}

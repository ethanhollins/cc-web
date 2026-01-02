import type { EventContentArg } from "@fullcalendar/core";
import { Badge } from "@/ui/badge";
import { calculateEventDuration, isShortEvent } from "@/utils/calendar-utils";

interface CalendarEventProps {
  eventInfo: EventContentArg;
}

/**
 * Custom event rendering component for FullCalendar
 * Mobile-optimized with compact layouts
 */
export function CalendarEvent({ eventInfo }: CalendarEventProps) {
  const { event } = eventInfo;
  const { extendedProps } = event;

  const durationMinutes = calculateEventDuration(event.start, event.end);
  const isEventShort = isShortEvent(event.start, event.end);

  // Visual properties
  const bandColor = extendedProps?.bandColor || "var(--accent)";
  const showBand = extendedProps?.showBand !== false;
  const isCompleted = extendedProps?.ticket_status === "Done" || extendedProps?.ticket_status === "Removed" || extendedProps?.completed === true;

  // All-day events: render as a compact header-only chip
  if (event.allDay) {
    return (
      <div className="relative flex h-full items-center overflow-hidden px-1.5 py-0.5">
        <div className="truncate text-[11px] font-semibold leading-tight sm:text-xs">{event.title}</div>
      </div>
    );
  }

  // Compact layout for short events (< 30 min) - better for mobile
  if (isEventShort) {
    const durationText = `${Math.round(durationMinutes)}m`;

    return (
      <div className="relative flex h-full items-center justify-between gap-1 overflow-hidden px-1.5 py-0.5">
        {/* Color band */}
        {showBand && <div className="absolute left-0 top-0 h-full w-1 flex-shrink-0 rounded-l" style={{ backgroundColor: bandColor }} />}

        {/* Completed overlay */}
        {isCompleted && (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                var(--event-completed-stripe) 4px,
                var(--event-completed-stripe) 5.5px
              )`,
            }}
          />
        )}

        <div className={`flex-1 truncate text-[11px] font-medium leading-tight sm:text-xs ${showBand ? "ml-2" : ""} ${isCompleted ? "opacity-60" : ""}`}>
          {event.title}
        </div>

        <div className="whitespace-nowrap text-[10px] opacity-70 sm:text-xs">{durationText}</div>
      </div>
    );
  }

  // Default layout for longer events
  return (
    <div className="relative h-full overflow-hidden p-1.5">
      {/* Color band */}
      {showBand && <div className="absolute left-0 top-0 h-full w-1 flex-shrink-0 rounded-l" style={{ backgroundColor: bandColor }} />}

      {/* Completed overlay */}
      {isCompleted && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              var(--event-completed-stripe) 4px,
              var(--event-completed-stripe) 5.5px
            )`,
          }}
        />
      )}

      <div className={`h-full ${showBand ? "ml-1" : ""}`}>
        {/* Events < 45 min: single line with ticket key */}
        {durationMinutes < 45 ? (
          <>
            <div className={`truncate text-[11px] font-semibold leading-tight sm:text-xs ${isCompleted ? "opacity-60" : ""}`}>{event.title}</div>
            {extendedProps?.ticket_key && (
              <Badge variant="outline" className="mt-1 px-1 text-[9px] leading-none sm:text-[10px]">
                {extendedProps.ticket_key}
              </Badge>
            )}
            <div className="mt-1 text-[9px] opacity-70 sm:text-[10px]">{eventInfo.timeText}</div>
          </>
        ) : (
          /* Events 45+ min: multi-line with ticket key */
          <>
            <div className={`line-clamp-2 text-[11px] font-semibold leading-snug sm:text-xs ${isCompleted ? "opacity-60" : ""}`}>{event.title}</div>

            {extendedProps?.ticket_key && (
              <Badge variant="outline" className="mt-1.5 px-1 text-[9px] leading-none sm:text-[10px]">
                {extendedProps.ticket_key}
              </Badge>
            )}

            <div className="mt-1 text-[9px] opacity-70 sm:text-[10px]">{eventInfo.timeText}</div>
          </>
        )}
      </div>
    </div>
  );
}

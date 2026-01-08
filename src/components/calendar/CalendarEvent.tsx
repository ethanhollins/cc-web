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
  const isOptimistic = extendedProps?.isOptimistic === true;
  const isBreak = extendedProps?.isBreak === true;

  // Break events: blend with calendar background
  if (isBreak) {
    const zigzagStyle = {
      "--a": "90deg",
      "--s": "13px",
      "--b": "1px",
      background: "var(--break-zigzag)",
      width: "calc(var(--b) + var(--s)/(2*tan(var(--a)/2)))",
      "--_g": "100% var(--s) repeat-y conic-gradient(from calc(90deg - var(--a)/2) at left, #0000, #000 1deg calc(var(--a) - 1deg), #0000 var(--a))",
      mask: "var(--b) 50%/var(--_g) exclude, 0 50%/var(--_g)",
    } as React.CSSProperties;

    // Short break events
    if (isEventShort) {
      const durationText = `${Math.round(durationMinutes)}m`;

      return (
        <div className="relative flex h-full items-center justify-between gap-1 overflow-hidden">
          {/* Zigzag left border */}
          <div className="absolute left-2 top-0 h-[100%]" style={zigzagStyle} />

          {/* Zigzag right border */}
          <div className="absolute right-2 top-0 h-[100%]" style={zigzagStyle} />

          {/* Content */}
          <div className="flex-1 px-5 py-0.5">
            <span className="text-[11px] leading-tight sm:text-[10px]" style={{ color: "var(--break-text)" }}>
              Break
            </span>
          </div>
          <div className="whitespace-nowrap pr-6 text-[10px] sm:text-xs" style={{ color: "var(--break-text)" }}>
            {durationText}
          </div>
        </div>
      );
    }

    // Regular break events
    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* Zigzag left border */}
        <div className="absolute left-2 top-0 h-[100%]" style={zigzagStyle} />

        {/* Zigzag right border */}
        <div className="absolute right-2 top-0 h-[100%]" style={zigzagStyle} />

        {/* Content aligned top-left like normal events */}
        <div className="h-full px-5 py-1">
          <div className="text-[11px] font-medium leading-tight sm:text-[10px]" style={{ color: "var(--break-text)" }}>
            Break
          </div>
          <div className="mt-0.5 text-[10px] sm:text-[9px]" style={{ color: "var(--break-text)" }}>
            {eventInfo.timeText}
          </div>
        </div>
      </div>
    );
  }

  // All-day events: render as a compact header-only chip
  if (event.allDay) {
    return (
      <div className="relative flex h-full items-center overflow-hidden px-1.5 py-0.5">
        {/* Optimistic overlay */}
        {isOptimistic && <div className="pointer-events-none absolute inset-0 cursor-wait bg-gray-400/30" />}
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

        {/* Optimistic overlay */}
        {isOptimistic && <div className="pointer-events-none absolute inset-0 cursor-wait bg-gray-400/30" />}

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

      {/* Optimistic overlay */}
      {isOptimistic && <div className="pointer-events-none absolute inset-0 cursor-wait bg-gray-400/30" />}

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

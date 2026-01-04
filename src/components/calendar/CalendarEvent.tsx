import type { EventContentArg } from "@fullcalendar/core";
import { TicketYieldStack } from "@/components/planner/TicketYieldStack";
import type { TicketYield } from "@/types/ticket";
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
  const yields = (extendedProps?.yields as TicketYield[] | undefined) || undefined;
  const shouldShowYields = extendedProps?.showYieldsOnEvent === true;
  const score = typeof extendedProps?.score === "number" ? extendedProps.score : undefined;
  const scoreText = typeof score === "number" ? `+${score}` : null;
  const shouldShowScore = shouldShowYields && !!scoreText;

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
    const isVeryShort = durationMinutes <= 15;

    const shortContainerClasses = `relative flex h-full justify-between gap-1 overflow-hidden px-1.5 ${
      isVeryShort ? "items-start py-px" : "items-center py-0.5"
    }`;

    const titleBaseMargin = showBand ? "ml-2" : "";
    const titleClasses = `truncate text-[11px] font-medium leading-tight sm:text-xs ${titleBaseMargin} ${
      isCompleted ? "opacity-60" : ""
    }`;
    const durationClasses = `mt-0.5 text-[10px] opacity-70 sm:text-xs ${titleBaseMargin}`;
    const scoreClasses = `mt-0.5 text-[10px] opacity-70 sm:text-xs ${titleBaseMargin}`;

    return (
      <div className="relative h-full">
        <div className={shortContainerClasses}>
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

          <div className={"flex-1"}>
              <div className={titleClasses}>{event.title}</div>
            {!isVeryShort && <div className={durationClasses}>{durationText}</div>}
            {!isVeryShort && shouldShowScore && <div className={scoreClasses}>{scoreText}</div>}
          </div>
        </div>

        {yields && yields.length > 0 && shouldShowYields && (
          <div className="pointer-events-none absolute -bottom-2 right-1 z-50">
            <TicketYieldStack yields={yields} />
          </div>
        )}
      </div>
    );
  }

  // Default layout for longer events
  return (
    <div className="relative h-full">
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
              {shouldShowScore && (
                <div className="mt-0.5 text-[9px] opacity-70 sm:text-[10px]">{scoreText}</div>
              )}
            </>
          ) : (
            /* Events 45+ min: multi-line with ticket key */
            <>
              <div className={`line-clamp-2 text-[11px] font-semibold leading-snug sm:text-xs ${isCompleted ? "opacity-60" : ""}`}>{event.title}</div>

              {extendedProps?.ticket_key && (
                <Badge variant="outline" className="mt-1.5 inline-flex px-1 text-[9px] leading-none sm:text-[10px]">
                  {extendedProps.ticket_key}
                </Badge>
              )}
              <div className="mt-1 text-[9px] opacity-70 sm:text-[10px]">{eventInfo.timeText}</div>
              {shouldShowScore && (
                <div className="mt-0.5 text-[9px] opacity-70 sm:text-[10px]">{scoreText}</div>
              )}
            </>
          )}
        </div>
      </div>

      {yields && yields.length > 0 && shouldShowYields && (
        <div className="pointer-events-none absolute -bottom-2 right-1 z-50">
          <TicketYieldStack yields={yields} />
        </div>
      )}
    </div>
  );
}

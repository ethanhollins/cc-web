"use client";

import { useEffect, useRef, useState } from "react";
import type { DateSelectArg, DatesSetArg, EventDropArg, EventInput, EventMountArg } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import type { DropArg, EventReceiveArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/calendar.css";
import type { CalendarResizeArg, CalendarViewConfig } from "@/types/calendar";
import { ContextMenuButton } from "@/ui/context-menu-button";
import { calculateScrollTime, formatHoverTime, lightenColor, observeMarkerHarness } from "@/utils/calendar-utils";
import { parseInTimezone } from "@/utils/date-utils";
import { CalendarContextMenu, type CalendarContextMenuState } from "./CalendarContextMenu";
import { CalendarEvent } from "./CalendarEvent";

interface CalendarViewProps {
  events: EventInput[];
  viewConfig?: CalendarViewConfig;
  onEventClick?: (eventId: string) => void;
  onEventDrop?: (dropInfo: EventDropArg) => void;
  onEventResize?: (resizeInfo: CalendarResizeArg) => void;
  onEventReceive?: (receiveInfo: EventReceiveArg) => void;
  onDatesSet?: (dateInfo: DatesSetArg) => void;
  onEventDidMount?: (info: EventMountArg) => void;
  onDayHeaderClick?: (date: Date) => void;
  onDrop?: (dropInfo: DropArg) => void;
  selectedDay?: Date | null;
  isDragging?: boolean;
  editableEventId?: string | null;
  // Event context menu props
  showContextMenu?: (x: number, y: number, eventId: string, googleCalendarId?: string, is_break?: boolean, is_marker?: boolean) => void;
  hideContextMenu?: () => void;
  eventContextMenu?: CalendarContextMenuState;
  onEventEdit?: (eventId: string) => void;
  onEventDelete?: (eventId: string) => void;
  // Selection context menu props
  onCreateEvent?: (startDate: Date, endDate: Date) => void;
  onScheduleBreak?: (startDate: Date, endDate: Date) => void;
  onCreateMarker?: (startDate: Date, endDate: Date) => void;
  onRenameBreak?: (eventId: string) => void;
  onRenameMarker?: (eventId: string) => void;
  // Touch and drag handlers
  onTouchStart?: (e: TouchEvent, eventId: string) => void;
  onTouchEnd?: () => void;
  onDragStart?: () => void;
  onDragStop?: () => void;
  onResizeStart?: () => void;
  onResizeStop?: () => void;
  className?: string;
  calendarRef?: React.RefObject<FullCalendar | null>;
}

interface MarkerTooltip {
  title: string;
  x: number;
  y: number;
}

/**
 * Reusable Calendar View Component
 * Wraps FullCalendar with consistent configuration and event handlers
 * Mobile-first design with touch support
 */
export function CalendarView({
  events,
  viewConfig,
  onEventClick,
  onEventDrop,
  onEventResize,
  onEventReceive,
  onDatesSet,
  onEventDidMount,
  onDayHeaderClick,
  onDrop,
  selectedDay,
  isDragging,
  editableEventId,
  showContextMenu,
  hideContextMenu,
  eventContextMenu,
  onEventEdit,
  onEventDelete,
  onCreateEvent,
  onScheduleBreak: _onScheduleBreak,
  onCreateMarker: _onCreateMarker,
  onRenameBreak,
  onRenameMarker,
  onTouchStart,
  onTouchEnd,
  onDragStart,
  onDragStop,
  onResizeStart,
  onResizeStop,
  className,
  calendarRef: externalRef,
}: CalendarViewProps) {
  const internalRef = useRef<FullCalendar | null>(null);
  const calendarRef = externalRef || internalRef;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Marker hover tooltip state
  const [markerTooltip, setMarkerTooltip] = useState<MarkerTooltip | null>(null);

  // WeakMap to track MutationObservers attached to marker harness elements so
  // they can be disconnected when the event is unmounted.
  const markerHarnessObservers = useRef(new WeakMap<HTMLElement, MutationObserver>()).current;

  // Hover time label: tracks the time being hovered (grid or event start)
  const [hoverTime, setHoverTime] = useState<{ label: string; y: number } | null>(null);
  // true while the pointer is over a calendar event (suppresses grid-tracking)
  const isHoveringEventRef = useRef(false);
  // Cached time-axis column bounds so we don't query the DOM on every render
  const axisRectRef = useRef<{ left: number; width: number } | null>(null);

  const scrollTime = calculateScrollTime();

  // On time selection, immediately open the hotbar in ticket-creation mode
  const handleDateSelectWrapper = (selectInfo: DateSelectArg) => {
    hideContextMenu?.();
    if (onCreateEvent && selectInfo.start && selectInfo.end) {
      const startMoment = parseInTimezone(selectInfo.startStr);
      const endMoment = parseInTimezone(selectInfo.endStr);
      onCreateEvent(startMoment.toDate(), endMoment.toDate());
    }
    // Do not unselect here – the selection should remain visible while the hotbar
    // is open. The caller is responsible for calling unselect() when the hotbar
    // flow is completed (confirmed or cancelled).
  };

  // Default config with mobile optimizations
  const defaultConfig: CalendarViewConfig = {
    initialView: "timeGridWeek",
    headerToolbar: false,
    allDaySlot: true,
    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    slotDuration: "00:30:00",
    expandRows: true,
    stickyHeaderDates: true,
  };

  const config = { ...defaultConfig, ...viewConfig };

  // --- Hover time label helpers ---

  /** Parse an HH:MM:SS time string into total minutes. */
  const parseMins = (t: string): number => {
    const [h = 0, m = 0] = t.split(":").map(Number);
    return h * 60 + m;
  };

  /**
   * Given a viewport clientY, returns the snapped (5-min) time label and y
   * coordinate, or null if the cursor is outside the timegrid body.
   */
  const getTimeLabelFromClientY = (clientY: number): { label: string; y: number } | null => {
    const bodyEl = wrapperRef.current?.querySelector(".fc-timegrid-body") as HTMLElement | null;
    if (!bodyEl) return null;

    const rect = bodyEl.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    if (relativeY < 0 || relativeY > rect.height) return null;

    const startMins = parseMins(config.slotMinTime ?? "00:00:00");
    const endMins = parseMins(config.slotMaxTime ?? "24:00:00");
    const rawMins = startMins + (relativeY / rect.height) * (endMins - startMins);
    const snapped = Math.round(rawMins / 5) * 5;
    const clamped = Math.max(startMins, Math.min(endMins - 5, snapped));

    return {
      label: formatHoverTime(Math.floor(clamped / 60) % 24, clamped % 60),
      y: clientY,
    };
  };

  /**
   * Returns the viewport clientY that corresponds to a specific Date's time
   * within the timegrid body, or null if not computable.
   */
  const getClientYFromEventStart = (start: Date): number | null => {
    const bodyEl = wrapperRef.current?.querySelector(".fc-timegrid-body") as HTMLElement | null;
    if (!bodyEl) return null;

    const rect = bodyEl.getBoundingClientRect();
    const startMins = parseMins(config.slotMinTime ?? "00:00:00");
    const endMins = parseMins(config.slotMaxTime ?? "24:00:00");
    const timeMins = start.getHours() * 60 + start.getMinutes();
    const fraction = (timeMins - startMins) / (endMins - startMins);
    return rect.top + fraction * rect.height;
  };

  /** Lazily populate the cached axis column rect. */
  const refreshAxisRect = () => {
    const el = wrapperRef.current?.querySelector(".fc-timegrid-slot-label") as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      axisRectRef.current = { left: r.left, width: r.width };
    }
  };

  const handleCalendarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoveringEventRef.current) return;
    if (!axisRectRef.current) refreshAxisRect();
    setHoverTime(getTimeLabelFromClientY(e.clientY));
  };

  const handleCalendarMouseLeave = () => {
    isHoveringEventRef.current = false;
    setHoverTime(null);
  };

  // Set initial view based on screen size
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      calendarApi.changeView(isMobile ? "timeGridThreeDay" : "timeGridWeek");
    }
  }, [calendarRef]);

  return (
    <div
      ref={wrapperRef}
      className={cn("h-full w-full", className)}
      onMouseMove={handleCalendarMouseMove}
      onMouseLeave={handleCalendarMouseLeave}
    >
      {/* Hover time label – floats over the time-axis column */}
      {hoverTime && axisRectRef.current && (
        <div
          className="pointer-events-none fixed z-40 flex items-center justify-center rounded-full bg-[var(--accent,#2563eb)] text-[11px] font-semibold text-white shadow-sm"
          style={{
            left: axisRectRef.current.left,
            width: axisRectRef.current.width,
            top: hoverTime.y - 9,
            height: 18,
          }}
        >
          {hoverTime.label}
        </div>
      )}

      {/* Marker hover tooltip */}
      {markerTooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
          style={{ left: markerTooltip.x, top: markerTooltip.y - 32 }}
        >
          {markerTooltip.title}
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView={config.initialView}
        views={{
          timeGridThreeDay: {
            type: "timeGrid",
            duration: { days: 3 },
          },
        }}
        // Responsive: 3-day on mobile, week on desktop
        windowResize={() => {
          const calendarApi = calendarRef.current?.getApi();
          if (calendarApi) {
            const isMobile = window.innerWidth < 1024; // lg breakpoint
            calendarApi.changeView(isMobile ? "timeGridThreeDay" : "timeGridWeek");
          }
        }}
        headerToolbar={false}
        height="100%"
        expandRows={config.expandRows}
        stickyHeaderDates={config.stickyHeaderDates}
        firstDay={1} // Monday
        // Enable time selection
        selectable
        selectMirror
        unselectAuto={false}
        longPressDelay={500}
        selectLongPressDelay={500}
        selectMinDistance={0}
        // Mobile-friendly day header
        dayHeaderFormat={{ weekday: "short", day: "numeric" }}
        dayHeaderContent={(args) => {
          const date = args.date;
          const day = date.getDate();
          const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

          // Format: Mon 29
          return (
            <div className="flex items-center gap-1 text-sm text-[var(--text)]">
              <span className="font-medium">{weekday}</span>
              <span className="text-[var(--text-muted)]">{day}</span>
            </div>
          );
        }}
        dayHeaderDidMount={(info) => {
          // Add click handler to day header for day selection
          const handleHeaderClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onDayHeaderClick?.(info.date);
          };

          info.el.addEventListener("click", handleHeaderClick);
          info.el.style.cursor = "pointer";
        }}
        dayCellClassNames={(info) => {
          if (selectedDay) {
            const cellDate = new Date(info.date);
            cellDate.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDay);
            selected.setHours(0, 0, 0, 0);

            if (selected.getTime() === cellDate.getTime()) {
              return ["fc-day-selected"];
            }
          }
          return [];
        }}
        dayHeaderClassNames={(info) => {
          if (selectedDay) {
            const headerDate = new Date(info.date);
            headerDate.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDay);
            selected.setHours(0, 0, 0, 0);

            if (selected.getTime() === headerDate.getTime()) {
              return ["fc-day-selected"];
            }
          }
          return [];
        }}
        // Time slots
        allDaySlot={config.allDaySlot}
        // Use a clear text label for the all-day row
        allDayText=""
        slotDuration={config.slotDuration}
        snapDuration="00:05:00"
        slotMinTime={config.slotMinTime}
        slotMaxTime={config.slotMaxTime}
        slotLabelFormat={{ hour: "numeric", meridiem: "short" }}
        nowIndicator
        scrollTime={scrollTime}
        timeZone="Australia/Sydney"
        // Allow events to be moved and resized
        editable
        eventStartEditable
        eventDurationEditable
        eventResizableFromStart
        // Events with project colors
        events={events.map((event) => {
          // Marker events: full-width draggable line
          if (event.extendedProps?.is_marker) {
            return {
              ...event,
              classNames: ["event-marker"],
              backgroundColor: event.extendedProps?.marker_colour || "#2980b9",
              borderColor: "transparent",
              textColor: "transparent",
              editable: true,
              startEditable: true,
              durationEditable: false,
            };
          }
          // Break events: blend with calendar background
          if (event.extendedProps?.is_break) {
            return {
              ...event,
              borderColor: "transparent",
              backgroundColor: "#71717b",
              textColor: "#6b7280",
              className: "event-break",
            };
          }
          // Regular events with project colors
          if (event.extendedProps?.project?.colour) {
            return {
              ...event,
              borderColor: event.extendedProps.project.colour,
              backgroundColor: lightenColor(event.extendedProps.project.colour, 0.85),
              textColor: "#000000",
            };
          }
          return event;
        })}
        // Event styling
        eventMinHeight={5}
        eventBackgroundColor="#ffffff"
        eventBorderColor="#d1d5db"
        eventTextColor="#374151"
        eventClassNames={(arg) => {
          if (arg.event.extendedProps?.is_marker) {
            return ["event-marker"];
          }
          return ["rounded-lg", "border", "overflow-hidden", "relative"];
        }}
        eventContent={(arg) => {
          // Marker line events don't use eventContent
          if (arg.event.extendedProps?.is_marker) return null;
          return <CalendarEvent eventInfo={arg} />;
        }}
        // Drag & drop
        droppable={true}
        dropAccept=".draggable-ticket"
        // Marker hover tooltip
        eventMouseEnter={(info) => {
          // For non-marker events show the event's start time on the axis
          if (!info.event.extendedProps?.is_marker && info.event.start) {
            isHoveringEventRef.current = true;
            if (!axisRectRef.current) refreshAxisRect();
            const y = getClientYFromEventStart(info.event.start) ?? info.el.getBoundingClientRect().top;
            setHoverTime({
              label: formatHoverTime(info.event.start.getHours(), info.event.start.getMinutes()),
              y,
            });
          }
          if (info.event.extendedProps?.is_marker) {
            const rect = info.el.getBoundingClientRect();
            setMarkerTooltip({
              title: info.event.title || "Marker",
              x: rect.left,
              y: rect.top,
            });
          }
        }}
        eventMouseLeave={(info) => {
          if (!info.event.extendedProps?.is_marker) {
            isHoveringEventRef.current = false;
            setHoverTime(null);
          }
          if (info.event.extendedProps?.is_marker) {
            setMarkerTooltip(null);
          }
        }}
        // Event handlers
        eventClick={(info) => {
          if (editableEventId === info.event.id) {
            // Event is in editing mode, allow editing
            return;
          }
          info.jsEvent.preventDefault();

          // Break events should not open ticket modal, they should just be selectable for editing
          if (info.event.extendedProps?.is_break) {
            return;
          }

          // Marker events should not open ticket modal
          if (info.event.extendedProps?.is_marker) {
            return;
          }

          onEventClick?.(info.event.id);
        }}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventReceive={onEventReceive}
        select={handleDateSelectWrapper}
        drop={onDrop}
        datesSet={onDatesSet}
        eventDidMount={(info) => {
          // Add right-click context menu handler for all events including background (markers)
          const handleEventContextMenu = (e: MouseEvent) => {
            if (isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenu?.(
              e.clientX,
              e.clientY,
              info.event.id,
              info.event.extendedProps?.google_calendar_id,
              info.event.extendedProps?.is_break,
              info.event.extendedProps?.is_marker,
            );
          };

          info.el.addEventListener("contextmenu", handleEventContextMenu);

          // Add touch handlers for long press (not for markers)
          if (onTouchStart && onTouchEnd && !info.event.extendedProps?.is_marker) {
            info.el.addEventListener("touchstart", (e) => {
              onTouchStart(e as TouchEvent, info.event.id);
            });
            info.el.addEventListener("touchend", () => onTouchEnd());
            info.el.addEventListener("touchcancel", () => onTouchEnd());
          }

          // Force marker harness to full column width.
          // FullCalendar's overlap-avoidance layout injects inline left/right
          // styles onto the `.fc-timegrid-event-harness` wrapper element, which
          // shrinks markers when another event occupies the same time slot.
          // observeMarkerHarness applies the override immediately and keeps
          // re-applying it via a MutationObserver whenever FullCalendar
          // updates the harness style (e.g. after drag-and-drop re-layout).
          if (info.event.extendedProps?.is_marker) {
            const harness = info.el.closest(".fc-timegrid-event-harness") as HTMLElement | null;
            if (harness) {
              markerHarnessObservers.set(harness, observeMarkerHarness(harness));
            }
          }

          // Call custom eventDidMount if provided
          onEventDidMount?.(info);
        }}
        eventWillUnmount={(info) => {
          if (info.event.extendedProps?.is_marker) {
            const harness = info.el.closest(".fc-timegrid-event-harness") as HTMLElement | null;
            if (harness) {
              markerHarnessObservers.get(harness)?.disconnect();
              markerHarnessObservers.delete(harness);
            }
          }
        }}
        eventDragStart={onDragStart}
        eventDragStop={onDragStop}
        eventResizeStart={onResizeStart}
        eventResizeStop={onResizeStop}
      />

      {/* Event context menu (right-click on event) - only show if it has an eventId */}
      {eventContextMenu && eventContextMenu.show && eventContextMenu.type === "event" && eventContextMenu.eventId && (
        <CalendarContextMenu contextMenu={eventContextMenu} onClose={() => hideContextMenu?.()}>
          {eventContextMenu.is_marker ? (
            // Marker event menu items
            <>
              <ContextMenuButton
                icon={Edit}
                onClick={() => {
                  if (eventContextMenu.eventId && onRenameMarker) {
                    onRenameMarker(eventContextMenu.eventId);
                  }
                  hideContextMenu?.();
                }}
              >
                Edit Marker
              </ContextMenuButton>

              <ContextMenuButton
                icon={Trash2}
                variant="destructive"
                onClick={() => {
                  if (eventContextMenu.eventId && onEventDelete) onEventDelete(eventContextMenu.eventId);
                  hideContextMenu?.();
                }}
              >
                Remove Marker
              </ContextMenuButton>
            </>
          ) : eventContextMenu.is_break ? (
            // Break event menu items
            <>
              <ContextMenuButton
                icon={Edit}
                onClick={() => {
                  if (eventContextMenu.eventId && onRenameBreak) {
                    onRenameBreak(eventContextMenu.eventId);
                  }
                  hideContextMenu?.();
                }}
              >
                Rename Break
              </ContextMenuButton>

              <ContextMenuButton
                icon={Trash2}
                variant="destructive"
                onClick={() => {
                  if (eventContextMenu.eventId && onEventDelete) onEventDelete(eventContextMenu.eventId);
                  hideContextMenu?.();
                }}
              >
                Remove Break
              </ContextMenuButton>
            </>
          ) : (
            // Regular event menu items
            <>
              <ContextMenuButton
                icon={Edit}
                onClick={() => {
                  if (eventContextMenu.eventId && onEventEdit) onEventEdit(eventContextMenu.eventId);
                  hideContextMenu?.();
                }}
              >
                Open Ticket
              </ContextMenuButton>

              <ContextMenuButton
                icon={Trash2}
                variant="destructive"
                onClick={() => {
                  if (eventContextMenu.eventId && onEventDelete) onEventDelete(eventContextMenu.eventId);
                  hideContextMenu?.();
                }}
              >
                Delete Event
              </ContextMenuButton>
            </>
          )}
        </CalendarContextMenu>
      )}
    </div>
  );
}

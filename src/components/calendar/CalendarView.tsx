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

/** Height of the floating hover-time pill in pixels. Used for vertical centring. */
const HOVER_LABEL_HEIGHT = 18;

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
  // Time-axis column bounds stored in state so they can be read safely during render
  const [axisRect, setAxisRect] = useState<{ left: number; width: number } | null>(null);
  // True while the user is actively dragging the bottom (end-time) resize handle
  const isResizingEndRef = useRef(false);
  // Tracks the event harness element being bottom-resized so we can read its
  // bottom edge (which FullCalendar keeps snapped) rather than the raw cursor Y.
  const resizingEventHarnessRef = useRef<HTMLElement | null>(null);
  // Always-current ref to getTimeLabelFromClientY so it can be called from the
  // document-level mousemove handler without stale-closure issues.
  const getTimeLabelFromClientYRef = useRef<typeof getTimeLabelFromClientY | null>(null);
  // Always-current ref to getMirrorHarness for the same reason.
  const getMirrorHarnessRef = useRef<(() => HTMLElement | null) | null>(null);

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

  /**
   * Find the mirror harness that FullCalendar creates/resizes during a drag.
   * In FC 6.x the `fc-event-mirror` class is on the event element INSIDE the
   * harness (not on a parent container), so we find the event then climb up.
   * Also handles older FC layouts where fc-event-mirror is a container.
   */
  const getMirrorHarness = (): HTMLElement | null => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return null;
    // Strategy 1: fc-event-mirror class is on the inner event element
    const mirrorEvent = wrapper.querySelector<HTMLElement>(
      ".fc-timegrid-event.fc-event-mirror, .fc-timegrid-event-harness .fc-event-mirror",
    );
    if (mirrorEvent) {
      return mirrorEvent.closest<HTMLElement>(".fc-timegrid-event-harness") ?? null;
    }
    // Strategy 2: fc-event-mirror class is directly on the harness itself
    const mirrorHarness = wrapper.querySelector<HTMLElement>(".fc-timegrid-event-harness.fc-event-mirror");
    if (mirrorHarness) return mirrorHarness;
    // Strategy 3: any element with fc-event-mirror in the wrapper (broadest fallback)
    const anyMirror = wrapper.querySelector<HTMLElement>("[class*='fc-event-mirror']");
    if (anyMirror) {
      return anyMirror.closest<HTMLElement>(".fc-timegrid-event-harness") ?? anyMirror;
    }
    return null;
  };

  /** Parse an HH:MM:SS time string into total minutes. */
  const parseMins = (t: string): number => {
    const [h = 0, m = 0] = t.split(":").map(Number);
    return h * 60 + m;
  };

  /**
   * Given a viewport clientY, returns the snapped time label and y coordinate,
   * or null if the cursor is outside the timegrid body.
   *
   * @param snap  "floor" (default) → matches FullCalendar's selection snapping.
   *              "round" → nearest 5-min boundary (float-point safe for harness edges).
   *              "ceil"  → next 5-min boundary (matches FC resize pre-drag hover).
   */
  const getTimeLabelFromClientY = (
    clientY: number,
    snap: "floor" | "round" | "ceil" = "floor",
  ): { label: string; y: number } | null => {
    const bodyEl = wrapperRef.current?.querySelector(".fc-timegrid-body") as HTMLElement | null;
    if (!bodyEl) return null;

    const rect = bodyEl.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    if (relativeY < 0 || relativeY > rect.height) return null;

    const startMins = parseMins(config.slotMinTime ?? "00:00:00");
    const endMins = parseMins(config.slotMaxTime ?? "24:00:00");
    const rawMins = startMins + (relativeY / rect.height) * (endMins - startMins);
    const snapper = snap === "ceil" ? Math.ceil : snap === "round" ? Math.round : Math.floor;
    const snapped = snapper(rawMins / 5) * 5;
    const clamped = Math.max(startMins, Math.min(endMins - 5, snapped));

    return {
      label: formatHoverTime(Math.floor(clamped / 60) % 24, clamped % 60),
      y: clientY,
    };
  };

  /** Lazily populate the axis column rect (stored in state). */
  const refreshAxisRect = () => {
    const el = wrapperRef.current?.querySelector(".fc-timegrid-slot-label") as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      setAxisRect({ left: r.left, width: r.width });
    }
  };

  // Keep refs in sync after every render so document-level handlers can call
  // them without stale-closure issues. Must be done in useEffect, not during render.
  useEffect(() => {
    getTimeLabelFromClientYRef.current = getTimeLabelFromClientY;
    getMirrorHarnessRef.current = getMirrorHarness;
  });

  const handleCalendarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!axisRect) refreshAxisRect();

    // While the end-time resize handle is being dragged, prefer the live mirror
    // harness bottom (FullCalendar ghost) over the original harness.
    if (isResizingEndRef.current) {
      const mirrorHarness = getMirrorHarness();
      const harness = mirrorHarness ?? resizingEventHarnessRef.current;
      const bottomY = harness ? harness.getBoundingClientRect().bottom : e.clientY;
      setHoverTime(getTimeLabelFromClientY(bottomY, "round"));
      return;
    }

    // When hovering (not yet dragging) the bottom resize handle, FullCalendar
    // will snap to the NEXT 5-min boundary from cursor, so use ceil.
    const resizerEnd = (e.target as HTMLElement).closest(".fc-event-resizer-end");
    if (resizerEnd) {
      setHoverTime(getTimeLabelFromClientY(e.clientY, "ceil"));
      return;
    }

    // If the cursor is over a non-marker event, snap the label to the event's
    // start position. Use the harness top (FullCalendar's reference element)
    // and round to handle floating-point pixel→time conversion.
    const eventEl = (e.target as HTMLElement).closest<HTMLElement>(
      ".fc-timegrid-event:not(.event-marker)",
    );
    if (eventEl) {
      const harness =
        eventEl.closest<HTMLElement>(".fc-timegrid-event-harness") ?? eventEl;
      const harnessTop = harness.getBoundingClientRect().top;
      const timeInfo = getTimeLabelFromClientY(harnessTop, "round");
      if (timeInfo) {
        setHoverTime({ label: timeInfo.label, y: harnessTop });
      }
      return;
    }

    setHoverTime(getTimeLabelFromClientY(e.clientY));
  };

  const handleCalendarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const resizerEl = (e.target as HTMLElement).closest(".fc-event-resizer-end");
    if (resizerEl) {
      isResizingEndRef.current = true;
      resizingEventHarnessRef.current =
        resizerEl.closest<HTMLElement>(".fc-timegrid-event-harness") ?? null;
    }
  };

  const handleCalendarMouseLeave = () => {
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

  // Clear the end-resize lock whenever the mouse button is released anywhere.
  // Also track mousemove at the document level so the label updates even when
  // FullCalendar's drag system captures pointer events (preventing our wrapper
  // div's React onMouseMove from firing consistently during a resize drag).
  useEffect(() => {
    const handleMouseUp = () => {
      isResizingEndRef.current = false;
      resizingEventHarnessRef.current = null;
    };

    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!isResizingEndRef.current) return;
      // During FC resize drag, FullCalendar creates a mirror event that tracks
      // the live snapped end time. Prefer the mirror's harness bottom when found.
      const mirrorHarness = getMirrorHarnessRef.current?.() ?? null;
      const harness = mirrorHarness ?? resizingEventHarnessRef.current;
      const bottomY = harness ? harness.getBoundingClientRect().bottom : e.clientY;

      setHoverTime(getTimeLabelFromClientYRef.current?.(bottomY, "round") ?? null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleDocumentMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleDocumentMouseMove);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn("h-full w-full", className)}
      onMouseDown={handleCalendarMouseDown}
      onMouseMove={handleCalendarMouseMove}
      onMouseLeave={handleCalendarMouseLeave}
    >
      {/* Hover time label – floats over the time-axis column */}
      {hoverTime && axisRect && (
        <div
          className="pointer-events-none fixed z-40 flex items-center justify-center rounded bg-[var(--accent)] text-[10px] font-semibold text-white"
          style={{
            left: axisRect.left,
            width: axisRect.width,
            height: HOVER_LABEL_HEIGHT,
            top: hoverTime.y - HOVER_LABEL_HEIGHT / 2,
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

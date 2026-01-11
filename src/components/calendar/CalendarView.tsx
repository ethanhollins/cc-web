"use client";

import { useCallback, useEffect, useRef } from "react";
import type { DateSelectArg, DatesSetArg, EventDropArg, EventInput, EventMountArg } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import type { DropArg, EventReceiveArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useCalendarSelection } from "@/hooks/useCalendarSelection";
import { cn } from "@/lib/utils";
import "@/styles/calendar.css";
import type { CalendarResizeArg, CalendarViewConfig } from "@/types/calendar";
import { ContextMenuButton } from "@/ui/context-menu-button";
import { calculateScrollTime, lightenColor } from "@/utils/calendar-utils";
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
  showContextMenu?: (x: number, y: number, eventId: string, googleCalendarId?: string, is_break?: boolean) => void;
  hideContextMenu?: () => void;
  eventContextMenu?: CalendarContextMenuState;
  onEventEdit?: (eventId: string) => void;
  onEventDelete?: (eventId: string) => void;
  // Selection context menu props
  onCreateEvent?: (startDate: Date, endDate: Date) => void;
  onScheduleBreak?: (startDate: Date, endDate: Date) => void;
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
  onScheduleBreak,
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

  // Selection context menu management
  const { selectionContextMenu, handleDateSelect, hideSelectionContextMenu } = useCalendarSelection();
  const scrollTime = calculateScrollTime();

  // Wrap handleDateSelect to also hide event context menu
  const handleDateSelectWrapper = useCallback(
    (selectInfo: DateSelectArg) => {
      hideContextMenu?.(); // Close event menu when making a selection
      handleDateSelect(selectInfo);
    },
    [handleDateSelect, hideContextMenu],
  );

  // Helper to close selection menu and unselect
  // eslint-disable-next-line
  const handleSelectionMenuClose = useCallback(() => {
    hideSelectionContextMenu();
    calendarRef.current?.getApi().unselect();
  }, [hideSelectionContextMenu, calendarRef]);

  // Handler for create event action
  const handleCreateEvent = useCallback(() => {
    if (selectionContextMenu.startDate && selectionContextMenu.endDate && onCreateEvent) {
      onCreateEvent(selectionContextMenu.startDate, selectionContextMenu.endDate);
    }
    handleSelectionMenuClose();
  }, [selectionContextMenu.startDate, selectionContextMenu.endDate, onCreateEvent, handleSelectionMenuClose]);

  // Handler for schedule break action
  const handleScheduleBreak = useCallback(() => {
    if (selectionContextMenu.startDate && selectionContextMenu.endDate && onScheduleBreak) {
      onScheduleBreak(selectionContextMenu.startDate, selectionContextMenu.endDate);
    }
    handleSelectionMenuClose();
  }, [selectionContextMenu.startDate, selectionContextMenu.endDate, onScheduleBreak, handleSelectionMenuClose]);

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

  // Set initial view based on screen size
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      calendarApi.changeView(isMobile ? "timeGridThreeDay" : "timeGridWeek");
    }
  }, [calendarRef]);

  return (
    <div className={cn("h-full w-full", className)}>
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
        eventClassNames={() => ["rounded-lg", "border", "overflow-hidden", "relative"]}
        eventContent={(arg) => <CalendarEvent eventInfo={arg} />}
        // Drag & drop
        droppable={true}
        dropAccept=".draggable-ticket"
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

          onEventClick?.(info.event.id);
        }}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventReceive={onEventReceive}
        select={handleDateSelectWrapper}
        drop={onDrop}
        datesSet={onDatesSet}
        eventDidMount={(info) => {
          // Add right-click context menu handler
          const handleEventContextMenu = (e: MouseEvent) => {
            if (isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenu?.(e.clientX, e.clientY, info.event.id, info.event.extendedProps?.google_calendar_id, info.event.extendedProps?.is_break);
          };

          info.el.addEventListener("contextmenu", handleEventContextMenu);

          // Add touch handlers for long press
          if (onTouchStart && onTouchEnd) {
            info.el.addEventListener("touchstart", (e) => {
              onTouchStart(e as TouchEvent, info.event.id);
            });
            info.el.addEventListener("touchend", () => onTouchEnd());
            info.el.addEventListener("touchcancel", () => onTouchEnd());
          }

          // Call custom eventDidMount if provided
          onEventDidMount?.(info);
        }}
        eventDragStart={onDragStart}
        eventDragStop={onDragStop}
        eventResizeStart={onResizeStart}
        eventResizeStop={onResizeStop}
      />

      {/* Event context menu (right-click on event) - only show if it has an eventId */}
      {eventContextMenu && eventContextMenu.show && eventContextMenu.type === "event" && eventContextMenu.eventId && (
        <CalendarContextMenu contextMenu={eventContextMenu} onClose={() => hideContextMenu?.()}>
          {eventContextMenu.is_break ? (
            // Break event menu items
            <>
              <ContextMenuButton
                icon={Edit}
                onClick={() => {
                  // TODO: Implement rename break functionality
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

      {/* Selection context menu (click & drag to select time) */}
      {selectionContextMenu.show && (
        <CalendarContextMenu contextMenu={selectionContextMenu} onClose={handleSelectionMenuClose}>
          <ContextMenuButton icon={Plus} onClick={handleCreateEvent}>
            Create Event
          </ContextMenuButton>

          <ContextMenuButton icon={Clock} onClick={handleScheduleBreak}>
            Schedule Break
          </ContextMenuButton>
        </CalendarContextMenu>
      )}
    </div>
  );
}

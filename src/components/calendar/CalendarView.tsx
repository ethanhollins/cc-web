"use client";

import { useEffect, useRef } from "react";
import type { DateSelectArg, DatesSetArg, EventDropArg, EventInput, EventMountArg } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import type { DropArg, EventReceiveArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { cn } from "@/lib/utils";
import "@/styles/calendar.css";
import type { CalendarResizeArg, CalendarViewConfig } from "@/types/calendar";
import { calculateScrollTime, lightenColor } from "@/utils/calendar-utils";
import { CalendarEvent } from "./CalendarEvent";

interface CalendarViewProps {
  events: EventInput[];
  viewConfig?: CalendarViewConfig;
  onEventClick?: (eventId: string) => void;
  onEventDrop?: (dropInfo: EventDropArg) => void;
  onEventResize?: (resizeInfo: CalendarResizeArg) => void;
  onEventReceive?: (receiveInfo: EventReceiveArg) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onDatesSet?: (dateInfo: DatesSetArg) => void;
  onEventDidMount?: (info: EventMountArg) => void;
  onDayHeaderClick?: (date: Date) => void;
  onDrop?: (dropInfo: DropArg) => void;
  selectedDay?: Date | null;
  isDragging?: boolean;
  editableEventId?: string | null;
  showContextMenu?: (x: number, y: number, eventId: string, googleCalendarId?: string) => void;
  hideContextMenu?: () => void;
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
  onDateSelect,
  onDatesSet,
  onEventDidMount,
  onDayHeaderClick,
  onDrop,
  selectedDay,
  isDragging,
  editableEventId,
  showContextMenu,
  hideContextMenu: _hideContextMenu,
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
  const scrollTime = calculateScrollTime();

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
        // Mobile-friendly day header
        dayHeaderFormat={{ weekday: "short", day: "numeric", month: "numeric" }}
        dayHeaderContent={(args) => {
          const date = args.date;
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

          // Format: Mon, 29/12
          return (
            <div className="flex items-center gap-1 text-sm text-gray-900">
              <span className="font-medium">{weekday},</span>
              <span className="text-gray-600">{`${day}/${month}`}</span>
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
        // Selection
        selectable
        selectMirror
        unselectAuto={false}
        longPressDelay={1200}
        selectLongPressDelay={1200}
        // Events with project colors
        events={events.map((event) => {
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
          onEventClick?.(info.event.id);
        }}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventReceive={onEventReceive}
        select={onDateSelect}
        drop={onDrop}
        datesSet={onDatesSet}
        eventDidMount={(info) => {
          // Add right-click context menu handler
          const handleEventContextMenu = (e: MouseEvent) => {
            if (isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenu?.(e.clientX, e.clientY, info.event.id, info.event.extendedProps?.google_calendar_id);
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
    </div>
  );
}

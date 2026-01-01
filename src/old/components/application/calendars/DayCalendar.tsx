import { useMemo, useRef } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import moment from "moment-timezone";
import { Project, Ticket } from "@/old/app/home-screen";
import { useCalendarContextMenu, useCalendarDate, useCalendarOutsideClick, useEventDragState, useLongPress } from "@/old/hooks/use-calendar-interactions";
import "@/old/styles/calendar.css";
import { calculateScrollTime, lightenColor } from "@/old/utils/calendar-utils";
import { CalendarContextMenu } from "./CalendarContextMenu";
import { CalendarEventContent } from "./CalendarEventContent";

interface DayCalendarProps {
  events: EventInput[];
  onDateChange?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  onEventDrop?: (event: any) => void;
  onEventChange?: (event: any) => void;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvents?: (updater: (prevEvents: any[]) => any[]) => void;
}

export default function DayCalendar({ events = [], onDateChange, onEventClick, onEventDrop, onEventChange, onDeleteEvent, onUpdateEvents }: DayCalendarProps) {
  const calRef = useRef<FullCalendar | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Use shared hooks
  const { selectedDate, goToPreviousPeriod, goToNextPeriod, goToToday, handleDatesSet } = useCalendarDate(new Date(), onDateChange);
  const { isDragging, handleDragStart, handleDragStop, handleResizeStart, handleResizeStop } = useEventDragState();
  const { contextMenu, showContextMenu, hideContextMenu } = useCalendarContextMenu(isDragging);
  const { isLongPressing, editableEventId, handleTouchStart, handleTouchEnd, clearEditableEvent } = useLongPress(isDragging);

  // Handle clicks outside to unselect and close menus
  useCalendarOutsideClick(containerRef as React.RefObject<HTMLElement>, calRef, () => {
    hideContextMenu();
    clearEditableEvent();
  });

  const now = useMemo(() => new Date(), []);
  const weekday = selectedDate.toLocaleString("en-US", { weekday: "long" });
  const scrollTime = useMemo(() => calculateScrollTime(now), [now]);

  // Context menu handlers
  const handleOpenEvent = () => {
    if (contextMenu.eventId && onEventClick) {
      onEventClick(contextMenu.eventId); // Pass the google_id directly
    }
    hideContextMenu();
    clearEditableEvent();
  };

  const handleDeleteEventClick = () => {
    if (contextMenu.eventId && onDeleteEvent) {
      onDeleteEvent(contextMenu.eventId);
    }
    hideContextMenu();
    clearEditableEvent();
  };

  return (
    <div ref={containerRef} className="flex h-full w-full max-w-[350px]">
      {/* Main Calendar Section */}
      <div className="flex flex-1 flex-col px-1 py-3">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Date badge */}
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-gray-200 text-[11px] shadow-sm">
              <div className="font-medium uppercase tracking-wide text-gray-500">{selectedDate.toLocaleString("en-US", { month: "short" })}</div>
              <div className="text-2xl font-semibold leading-6">{selectedDate.getDate()}</div>
            </div>

            {/* Title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">{weekday}</span>
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.toLocaleString("en-US", { month: "long" })} {selectedDate.getFullYear()}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center rounded-lg border border-gray-200 shadow-sm">
            <button
              className="cursor-pointer rounded-l-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => goToPreviousPeriod(calRef.current?.getApi())}
            >
              ‹
            </button>
            <button
              className="cursor-pointer border-x border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              onClick={() => goToToday(calRef.current?.getApi())}
            >
              Today
            </button>
            <button
              className="cursor-pointer rounded-r-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => goToNextPeriod(calRef.current?.getApi())}
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1">
          <FullCalendar
            ref={calRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            headerToolbar={false}
            height="100%"
            expandRows
            dayHeaders={false}
            allDaySlot={true}
            slotDuration="00:30:00"
            snapDuration="00:05:00"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotLabelFormat={{ hour: "numeric", meridiem: "short" }}
            nowIndicator
            scrollTime={scrollTime}
            timeZone="Australia/Sydney"
            selectable
            selectMirror
            unselectAuto={false}
            longPressDelay={1200}
            selectLongPressDelay={1200}
            events={events.map((event) => {
              // Apply project colors
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
            eventMinHeight={5}
            droppable={true}
            dropAccept=".draggable-ticket"
            editable={true}
            eventBackgroundColor="#ffffff"
            eventBorderColor="#d1d5db"
            eventTextColor="#374151"
            eventResizableFromStart={true}
            eventDurationEditable={true}
            eventStartEditable={true}
            eventClassNames={() => ["rounded-lg", "border", "overflow-hidden", "relative"]}
            eventContent={(arg) => <CalendarEventContent arg={arg} />}
            datesSet={handleDatesSet}
            select={(info) => console.log("selected", info.start, info.end)}
            eventClick={(info) => {
              if (editableEventId === info.event.id) {
                // Event is in editing mode, allow editing
                return;
              } else if (!isLongPressing) {
                // Normal click, open event
                onEventClick?.(info.event.id); // Pass the google_id directly
              }
            }}
            eventDidMount={(info) => {
              // Add right-click handler
              const handleEventContextMenu = (e: MouseEvent) => {
                // Don't show context menu if dragging
                if (isDragging) {
                  return;
                }
                e.preventDefault();
                e.stopPropagation();
                showContextMenu(e.clientX, e.clientY, info.event.id, info.event.extendedProps?.google_calendar_id);
              };

              info.el.addEventListener("contextmenu", handleEventContextMenu);

              // Add touch handlers for long press
              info.el.addEventListener("touchstart", (e) => {
                handleTouchStart(
                  e as any,
                  info.event.id,
                  (x, y) => {
                    showContextMenu(x, y, info.event.id, info.event.extendedProps?.google_calendar_id);
                  },
                  hideContextMenu,
                );
              });
              info.el.addEventListener("touchend", handleTouchEnd);
              info.el.addEventListener("touchcancel", handleTouchEnd);
            }}
            eventResize={(info) => {
              console.log("Event resized:", info);

              const newStartDate = moment.tz(info.event.start?.toISOString().replace(/Z$/, ""), "Australia/Sydney").format();
              const newEndDate = moment.tz(info.event.end?.toISOString().replace(/Z$/, ""), "Australia/Sydney").format();

              // Optimistically update the events state immediately
              if (onUpdateEvents) {
                onUpdateEvents((prevEvents) => {
                  const updated = prevEvents.map((event) =>
                    event.google_id === info.event.id
                      ? {
                          ...event,
                          start_date: newStartDate,
                          end_date: newEndDate,
                        }
                      : event,
                  );
                  return updated;
                });
              }

              // Then call the API handler for backend update
              const updatedEvent = {
                ...info.event.extendedProps,
                eventId: info.event.id,
                startDate: newStartDate,
                endDate: newEndDate,
              };
              onEventChange?.(updatedEvent);
            }}
            drop={(info) => {
              onEventDrop?.(info);
            }}
            eventDrop={(info) => {
              console.log("EVENT DROP handler triggered (iPad/touch device):", info);

              const newStartDate = moment.tz(info.event.start?.toISOString().replace(/Z$/, ""), "Australia/Sydney").format();
              const newEndDate = moment.tz(info.event.end?.toISOString().replace(/Z$/, ""), "Australia/Sydney").format();

              // Optimistically update the events state immediately for moved events
              if (onUpdateEvents) {
                onUpdateEvents((prevEvents) => {
                  const updated = prevEvents.map((event) =>
                    event.google_id === info.event.id
                      ? {
                          ...event,
                          start_date: newStartDate,
                          end_date: newEndDate,
                        }
                      : event,
                  );
                  return updated;
                });
              }

              // Then call the API handler for backend update
              const updatedEvent = {
                ...info.event.extendedProps,
                eventId: info.event.id,
                startDate: newStartDate,
                endDate: newEndDate,
              };
              onEventChange?.(updatedEvent);
            }}
            eventReceive={(info) => {
              console.log("Event received:", info);

              if (info.draggedEl?.classList?.contains("draggable-ticket")) {
                return;
              }

              const newStartDate = moment.tz(info.event.start?.toISOString().replace(/Z$/, ""), "Australia/Sydney").format();
              const newEndDate = moment.tz(info.event.end?.toISOString().replace(/Z$/, ""), "Australia/Sydney").format();

              // Optimistically update the events state immediately for moved events
              if (onUpdateEvents) {
                onUpdateEvents((prevEvents) => {
                  const updated = prevEvents.map((event) =>
                    event.google_id === info.event.id
                      ? {
                          ...event,
                          start_date: newStartDate,
                          end_date: newEndDate,
                        }
                      : event,
                  );
                  return updated;
                });
              }

              // Then call the API handler for backend update
              const updatedEvent = {
                ...info.event.extendedProps,
                eventId: info.event.id,
                startDate: newStartDate,
                endDate: newEndDate,
              };
              onEventChange?.(updatedEvent);
            }}
            eventDragStart={() => {
              handleDragStart();
            }}
            eventDragStop={() => {
              handleDragStop();
            }}
            eventResizeStart={() => {
              handleResizeStart();
            }}
            eventResizeStop={() => {
              handleResizeStop();
            }}
          />
        </div>
      </div>

      {/* Context Menu */}
      <CalendarContextMenu contextMenu={contextMenu} onOpenEvent={handleOpenEvent} onDeleteEvent={handleDeleteEventClick} />
    </div>
  );
}

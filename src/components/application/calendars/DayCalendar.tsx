import { useMemo, useRef } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Project, Ticket } from "@/app/home-screen";
import { useCalendarContextMenu, useCalendarDate, useCalendarOutsideClick, useLongPress } from "@/hooks/use-calendar-interactions";
import "@/styles/calendar.css";
import { calculateScrollTime, lightenColor } from "@/utils/calendar-utils";
import { CalendarContextMenu } from "./CalendarContextMenu";
import { CalendarEventContent } from "./CalendarEventContent";

interface DayCalendarProps {
    events: EventInput[];
    onDateChange?: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
    onEventDrop?: (event: any) => void;
    onEventChange?: (event: any) => void;
    onDeleteEvent?: (eventId: string) => void;
}

export default function DayCalendar({ events = [], onDateChange, onEventClick, onEventDrop, onEventChange, onDeleteEvent }: DayCalendarProps) {
    const calRef = useRef<FullCalendar | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Use shared hooks
    const { selectedDate, goToPreviousPeriod, goToNextPeriod, goToToday, handleDatesSet } = useCalendarDate(new Date(), onDateChange);
    const { contextMenu, showContextMenu, hideContextMenu } = useCalendarContextMenu();
    const { isLongPressing, editableEventId, handleTouchStart, handleTouchEnd, clearEditableEvent } = useLongPress();

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
            const event = events.find((e) => e.id === contextMenu.eventId);
            onEventClick(event?.extendedProps?.ticket_id);
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
        <div ref={containerRef} className="flex h-full w-full">
            {/* Main Calendar Section */}
            <div className="flex flex-1 flex-col px-1 py-3">
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Date badge */}
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-gray-200 text-[11px] shadow-sm">
                            <div className="font-medium tracking-wide text-gray-500 uppercase">{selectedDate.toLocaleString("en-US", { month: "short" })}</div>
                            <div className="text-2xl leading-6 font-semibold">{selectedDate.getDate()}</div>
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
                                onEventClick?.(info.event.extendedProps?.ticket_id);
                            }
                        }}
                        eventDidMount={(info) => {
                            // Add right-click handler
                            const handleEventContextMenu = (e: MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                showContextMenu(e.clientX, e.clientY, info.event.id, info.event.extendedProps?.google_calendar_id);
                            };

                            info.el.addEventListener("contextmenu", handleEventContextMenu);

                            // Add touch handlers for long press
                            info.el.addEventListener("touchstart", (e) => {
                                handleTouchStart(e as any, info.event.id, (x, y) => {
                                    showContextMenu(x, y, info.event.id, info.event.extendedProps?.google_calendar_id);
                                });
                            });
                            info.el.addEventListener("touchend", handleTouchEnd);
                            info.el.addEventListener("touchcancel", handleTouchEnd);
                        }}
                        eventResize={(info) => {
                            const updatedEvent = {
                                ...info.event.extendedProps,
                                eventId: info.event.id,
                                startDate: info.event.start?.toISOString(),
                                endDate: info.event.end?.toISOString(),
                            };
                            onEventChange?.(updatedEvent);
                        }}
                        drop={(info) => {
                            onEventDrop?.(info);
                        }}
                        eventReceive={(info) => {
                            if (info.draggedEl?.classList?.contains("draggable-ticket")) {
                                return;
                            }

                            const updatedEvent = {
                                ...info.event.extendedProps,
                                eventId: info.event.id,
                                startDate: info.event.start?.toISOString(),
                                endDate: info.event.end?.toISOString(),
                            };
                            onEventChange?.(updatedEvent);
                        }}
                    />
                </div>
            </div>

            {/* Context Menu */}
            <CalendarContextMenu contextMenu={contextMenu} onOpenEvent={handleOpenEvent} onDeleteEvent={handleDeleteEventClick} />
        </div>
    );
}

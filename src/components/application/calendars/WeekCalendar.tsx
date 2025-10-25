import { useEffect, useMemo, useRef, useState } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Project, Ticket } from "@/app/home-screen";
import { CalendarCard } from "@/components/base/calendar";
import { useCalendarContextMenu, useCalendarDate, useCalendarOutsideClick, useLongPress } from "@/hooks/use-calendar-interactions";
import "@/styles/calendar.css";
import { handleScheduleTicket } from "@/utils/calendar-event-handlers";
import { calculateScrollTime, formatWeekRange, getWeekEnd, getWeekStart, lightenColor, weekOfMonth } from "@/utils/calendar-utils";
import { CalendarContextMenu } from "./CalendarContextMenu";
import { CalendarEventContent } from "./CalendarEventContent";
import TicketsList from "./TicketsList";

interface WeekCalendarProps {
    events: EventInput[];
    onDateChange?: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
    onDaySelect?: (date: Date) => void;
    tickets?: Record<string, Ticket[]>;
    projects?: Project[];
    selectedProjectKey?: string;
    onProjectChange?: (projectKey: string) => void;
    onTicketClick?: (ticket: Ticket) => void;
    onScheduleTicket?: (ticketId: string, scheduledDate: string) => void;
    onEventDrop?: (event: any) => void;
    onEventChange?: (event: any) => void;
    onDeleteEvent?: (eventId: string) => void;
}

export default function WeekCalendar({
    events = [],
    onDateChange,
    onEventClick,
    onDaySelect,
    tickets = {},
    projects = [],
    selectedProjectKey,
    onProjectChange,
    onTicketClick,
    onScheduleTicket,
    onEventDrop,
    onEventChange,
    onDeleteEvent,
}: WeekCalendarProps) {
    const calRef = useRef<FullCalendar | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // State for selected day - initialize with current date
    const [selectedDay, setSelectedDay] = useState<Date | null>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        return today;
    });

    // Calendar picker state
    const [calendarPicker, setCalendarPicker] = useState<{ show: boolean; x: number; y: number; onSelect?: (date: Date) => void }>({
        show: false,
        x: 0,
        y: 0,
    });

    // Use shared hooks
    const { selectedDate, goToPreviousPeriod, goToNextPeriod, goToToday, handleDatesSet } = useCalendarDate(new Date(), onDateChange);
    const { contextMenu, showContextMenu, hideContextMenu } = useCalendarContextMenu();
    const { isLongPressing, editableEventId, handleTouchStart, handleTouchEnd, clearEditableEvent } = useLongPress();

    // Notify parent about initial day selection
    useEffect(() => {
        if (selectedDay && onDaySelect) {
            onDaySelect(selectedDay);
        }
    }, []); // Only run on mount

    // Calendar picker control functions
    const showCalendarPicker = (x: number, y: number, onSelect: (date: Date) => void) => {
        setCalendarPicker({ show: true, x, y, onSelect });
    };

    const hideCalendarPicker = () => {
        setCalendarPicker({ show: false, x: 0, y: 0 });
    };

    const handleCalendarSelect = (date: Date) => {
        if (calendarPicker.onSelect) {
            calendarPicker.onSelect(date);
        }
        hideCalendarPicker();
    };

    // Handle clicks outside to unselect and close menus
    useCalendarOutsideClick(containerRef as React.RefObject<HTMLElement>, calRef, () => {
        hideContextMenu();
        clearEditableEvent();
        hideCalendarPicker();
    });

    const now = useMemo(() => new Date(), []);
    const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
    const weekEnd = useMemo(() => getWeekEnd(selectedDate), [selectedDate]);
    const month = selectedDate.toLocaleString("en-US", { month: "long" });
    const wk = weekOfMonth(selectedDate);
    const weekRangeText = useMemo(() => formatWeekRange(weekStart, weekEnd), [weekStart, weekEnd]);
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

    const handleScheduleTicketLocal = async (ticketId: string, scheduledDate: string) => {
        try {
            await handleScheduleTicket(ticketId, scheduledDate);
            // Call the parent callback if provided (for additional handling like state updates)
            if (onScheduleTicket) {
                onScheduleTicket(ticketId, scheduledDate);
            }
        } catch (error) {
            console.error("Failed to schedule ticket:", error);
            // You could add error handling UI here (toast, alert, etc.)
        }
    };

    return (
        <div ref={containerRef} className="flex h-full w-full">
            {/* Main Calendar Section */}
            <div className="flex flex-1 flex-col py-3 pr-4">
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Date badge */}
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-gray-200 text-[11px] shadow-sm">
                            <div className="font-medium tracking-wide text-gray-500 uppercase">
                                {selectedDay
                                    ? selectedDay.toLocaleString("en-US", { month: "short" })
                                    : selectedDate.toLocaleString("en-US", { month: "short" })}
                            </div>
                            <div className="text-2xl leading-6 font-semibold">{selectedDay ? selectedDay.getDate() : selectedDate.getDate()}</div>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-semibold">{month}</span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-700">Week {wk}</span>
                            </div>
                            <div className="text-sm text-gray-500">{weekRangeText}</div>
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
                        initialView="timeGridWeek"
                        headerToolbar={false}
                        height="100%"
                        expandRows
                        firstDay={1} // Start week on Monday
                        dayHeaderFormat={{ weekday: "short", day: "2-digit", month: "2-digit" }}
                        dayHeaderContent={(args) => {
                            const date = args.date;
                            const day = date.getDate().toString().padStart(2, "0");
                            const month = (date.getMonth() + 1).toString().padStart(2, "0");
                            const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
                            return `${weekday}, ${day}/${month}`;
                        }}
                        allDaySlot={false}
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
                        dayCellClassNames={(info) => {
                            if (selectedDay) {
                                const cellDate = new Date(info.date);
                                cellDate.setHours(0, 0, 0, 0);

                                if (selectedDay.getTime() === cellDate.getTime()) {
                                    return ["fc-day-selected"];
                                }
                            }
                            return [];
                        }}
                        dayHeaderClassNames={(info) => {
                            if (selectedDay) {
                                const headerDate = new Date(info.date);
                                headerDate.setHours(0, 0, 0, 0);

                                if (selectedDay.getTime() === headerDate.getTime()) {
                                    return ["fc-day-selected"];
                                }
                            }
                            return [];
                        }}
                        datesSet={handleDatesSet}
                        dayHeaderDidMount={(info) => {
                            // Add click handler to day header only
                            const handleHeaderClick = (e: MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const clickedDate = new Date(info.date);
                                // Normalize to start of day for comparison
                                clickedDate.setHours(0, 0, 0, 0);

                                // Get current selected day state
                                setSelectedDay((currentSelectedDay) => {
                                    // Toggle selection if same day, otherwise select new day
                                    if (currentSelectedDay && currentSelectedDay.getTime() === clickedDate.getTime()) {
                                        onDaySelect?.(null as any); // Deselect
                                        return null;
                                    } else {
                                        onDaySelect?.(clickedDate);
                                        return clickedDate;
                                    }
                                });
                            };

                            info.el.addEventListener("click", handleHeaderClick);
                            info.el.style.cursor = "pointer";
                        }}
                        select={(info) => console.log("selected", info.start?.toISOString(), info.end?.toISOString())}
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
                            const ticketId = info.draggedEl?.dataset?.ticketId;
                            const ticket = ticketId
                                ? Object.values(tickets)
                                      .flat()
                                      .find((t) => t.ticket_id === ticketId)
                                : null;

                            if (ticket) {
                                onEventDrop?.({
                                    ...info,
                                    ticket: ticket,
                                });
                            }
                        }}
                        eventReceive={(info) => {
                            if (info.draggedEl?.classList?.contains("draggable-ticket")) {
                                return;
                            }
                            console.log("THIS ONE?1");

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

            {/* Tickets Sidebar */}
            {projects.length > 0 && (
                <TicketsList
                    items={tickets}
                    projects={projects}
                    selectedProjectKey={selectedProjectKey}
                    selectedDay={selectedDay}
                    events={events}
                    onProjectChange={onProjectChange}
                    onItemClick={onTicketClick}
                    onScheduleTicket={handleScheduleTicketLocal}
                    onShowCalendarPicker={showCalendarPicker}
                />
            )}

            {/* Context Menu */}
            <CalendarContextMenu contextMenu={contextMenu} onOpenEvent={handleOpenEvent} onDeleteEvent={handleDeleteEventClick} />

            {/* Calendar Picker */}
            {calendarPicker.show && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={hideCalendarPicker} />
                    {/* Calendar Card */}
                    <div
                        className="fixed z-50"
                        style={{
                            left: `${calendarPicker.x}px`,
                            top: `${calendarPicker.y}px`,
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <CalendarCard initialDate={new Date()} minDate={new Date()} onSelect={handleCalendarSelect} />
                    </div>
                </>
            )}
        </div>
    );
}

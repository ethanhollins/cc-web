import { useEffect, useMemo, useRef, useState } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import moment from "moment-timezone";
import { Project, Ticket } from "@/app/home-screen";
import { CalendarCard } from "@/components/base/calendar";
import { useCalendarContextMenu, useCalendarDate, useCalendarOutsideClick, useEventDragState, useLongPress } from "@/hooks/use-calendar-interactions";
import "@/styles/calendar.css";
import { handleScheduleTicket, handleUnscheduleTicket } from "@/utils/calendar-event-handlers";
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
    onUnscheduleTicket?: (ticketId: string) => void;
    onEventDrop?: (event: any) => void;
    onEventChange?: (event: any) => void;
    onDeleteEvent?: (eventId: string) => void;
    onCreateTicket?: (createdTicket: Ticket, projectKey: string) => void;
    onUpdateEvents?: (updater: (prevEvents: any[]) => any[]) => void;
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
    onUnscheduleTicket,
    onEventDrop,
    onEventChange,
    onDeleteEvent,
    onCreateTicket,
    onUpdateEvents,
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

    // Event creation trigger state
    const [eventCreationTrigger, setEventCreationTrigger] = useState<{ startDate: Date; endDate: Date; projectKey: string } | null>(null);

    // Reset trigger after it's been used
    useEffect(() => {
        if (eventCreationTrigger) {
            // Reset after a short delay to allow TicketsList to consume it
            const timeout = setTimeout(() => {
                setEventCreationTrigger(null);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [eventCreationTrigger]);

    // Use shared hooks
    const { selectedDate, goToPreviousPeriod, goToNextPeriod, goToToday, handleDatesSet } = useCalendarDate(new Date(), onDateChange);
    const { isDragging, handleDragStart, handleDragStop, handleResizeStart, handleResizeStop } = useEventDragState();
    const { contextMenu, showContextMenu, hideContextMenu } = useCalendarContextMenu(isDragging);
    const { isLongPressing, editableEventId, handleTouchStart, handleTouchEnd, clearEditableEvent } = useLongPress(isDragging);

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

    // Function to unselect calendar selection
    const handleUnselectCalendar = () => {
        if (calRef.current) {
            calRef.current.getApi().unselect();
        }
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

    const handleUnscheduleTicketLocal = async (ticketId: string) => {
        try {
            await handleUnscheduleTicket(ticketId);
            // Call the parent callback if provided (for additional handling like state updates)
            if (onUnscheduleTicket) {
                onUnscheduleTicket(ticketId);
            }
        } catch (error) {
            console.error("Failed to unschedule ticket:", error);
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
                        select={(info) => {
                            if (info.start && info.end && selectedProjectKey) {
                                // Convert dates to moment objects in Australia/Sydney timezone
                                // FullCalendar provides dates without timezone info, but they are already in Sydney time
                                const startMoment = moment.tz(info.startStr, "Australia/Sydney");
                                const endMoment = moment.tz(info.endStr, "Australia/Sydney");

                                setEventCreationTrigger({
                                    startDate: startMoment.toDate(),
                                    endDate: endMoment.toDate(),
                                    projectKey: selectedProjectKey,
                                });
                            }
                        }}
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
                                console.log("Event touched:", e);
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
                            const ticketId = info.draggedEl?.dataset?.ticketId;
                            const ticket = ticketId
                                ? Object.values(tickets)
                                      .flat()
                                      .find((t) => t.ticket_id === ticketId)
                                : null;

                            // Check if this is a ticket from the sidebar (external drop)
                            if (ticket) {
                                onEventDrop?.({
                                    ...info,
                                    ticket: ticket,
                                });
                                return;
                            }

                            // This is an existing calendar event being moved (internal drop)
                            // The event will be handled by eventReceive, but we can also handle it here
                            console.log("Internal event drop detected");
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
                        eventDragStart={(info) => {
                            handleDragStart();
                        }}
                        eventDragStop={(info) => {
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
                    onUnscheduleTicket={handleUnscheduleTicketLocal}
                    onShowCalendarPicker={showCalendarPicker}
                    onCreateTicket={onCreateTicket}
                    updateEvents={onUpdateEvents}
                    createEventTrigger={eventCreationTrigger}
                    onUnselectCalendar={handleUnselectCalendar}
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

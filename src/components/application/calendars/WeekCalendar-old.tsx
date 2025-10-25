import { useMemo, useRef } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Project, Ticket } from "@/app/home-screen";
import { useCalendarContextMenu, useLongPress, useCalendarDate, useCalendarOutsideClick } from "@/hooks/use-calendar-interactions";
import { weekOfMonth, getWeekStart, getWeekEnd, formatWeekRange, calculateScrollTime } from "@/utils/calendar-utils";
import { CalendarEventContent } from "./CalendarEventContent";
import { CalendarContextMenu } from "./CalendarContextMenu";
import TicketsList from "./TicketsList";
import "@/styles/calendar.css";

interface WeekCalendarProps {
    events: EventInput[];
    onDateChange?: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
    tickets?: Record<string, Ticket[]>;
    projects?: Project[];
    selectedProjectKey?: string;
    onProjectChange?: (projectKey: string) => void;
    onTicketClick?: (ticket: Ticket) => void;
    onEventDrop?: (event: any) => void;
    onEventChange?: (event: any) => void;
    onDeleteEvent?: (eventId: string) => void;
}

export default function WeekCalendar({
    events = [],
    onDateChange,
    onEventClick,
    tickets = {},
    projects = [],
    selectedProjectKey,
    onProjectChange,
    onTicketClick,
    onEventDrop,
    onEventChange,
    onDeleteEvent,
}: WeekCalendarProps) {
    const calRef = useRef<FullCalendar | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Use shared hooks
    const { selectedDate, goToPreviousPeriod, goToNextPeriod, goToToday, handleDatesSet } = useCalendarDate(new Date(), onDateChange);
    const { contextMenu, showContextMenu, hideContextMenu } = useCalendarContextMenu();
    const { isLongPressing, editableEventId, handleTouchStart, handleTouchEnd, clearEditableEvent } = useLongPress();

    const now = useMemo(() => new Date(), []);
    const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
    const weekEnd = useMemo(() => getWeekEnd(selectedDate), [selectedDate]);
    const month = selectedDate.toLocaleString("en-US", { month: "long" });
    const wk = weekOfMonth(selectedDate);

    // Format the week range for display
    const weekRangeText = useMemo(() => {
        const startMonth = weekStart.toLocaleString("en-US", { month: "short" });
        const endMonth = weekEnd.toLocaleString("en-US", { month: "short" });

        if (startMonth === endMonth) {
            return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
            return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        }
    }, [weekStart, weekEnd]);

    // Calculate scroll time: current time minus 1 hour, minimum 00:00:00
    const scrollTime = useMemo(() => {
        const currentHour = now.getHours();
        const scrollHour = Math.max(0, currentHour - 1);
        return `${scrollHour.toString().padStart(2, "0")}:00:00`;
    }, [now]);

    // Handle clicks outside the calendar to unselect and hide context menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                const api = calRef.current?.getApi();
                api?.unselect();
                setContextMenu((prev) => ({ ...prev, show: false }));
                setEditableEventId(null);
            }
        };

        const handleClick = () => {
            setContextMenu((prev) => ({ ...prev, show: false }));
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("click", handleClick);
        };
    }, []);

    // Handle context menu actions
    const handleOpenEvent = () => {
        console.log("Open event clicked, eventId:", contextMenu.eventId);
        if (contextMenu.eventId && onEventClick) {
            const event = events.find((e) => e.id === contextMenu.eventId);
            onEventClick(event?.extendedProps?.ticket_id);
        }
        setContextMenu((prev) => ({ ...prev, show: false }));
        setEditableEventId(null);
    };

    const handleDeleteEvent = () => {
        console.log("Delete event clicked, eventId:", contextMenu.eventId);
        if (contextMenu.eventId && onDeleteEvent) {
            onDeleteEvent(contextMenu.eventId);
        }
        setContextMenu((prev) => ({ ...prev, show: false }));
        setEditableEventId(null);
    };

    // Handle long press for touch devices
    const handleTouchStart = (e: React.TouchEvent, eventId?: string) => {
        setIsLongPressing(false);

        // If this event is already in editing mode, don't start new timers
        if (editableEventId === eventId) {
            return;
        }

        // Context menu timer (500ms)
        longPressTimer.current = setTimeout(() => {
            // Don't show context menu if event is in editing mode
            if (editableEventId !== eventId) {
                setIsLongPressing(true);
                const touch = e.touches[0];
                setContextMenu({
                    show: true,
                    x: touch.clientX,
                    y: touch.clientY,
                    type: "event",
                    eventId,
                });
            }
        }, 500);

        // Event editing timer (1000ms - twice as long)
        editingLongPressTimer.current = setTimeout(() => {
            // Close context menu and enable editing
            setContextMenu((prev) => ({ ...prev, show: false }));
            setEditableEventId(eventId || null);
            console.log("Event editing enabled for:", eventId);
        }, 1000);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (editingLongPressTimer.current) {
            clearTimeout(editingLongPressTimer.current);
            editingLongPressTimer.current = null;
        }
        setTimeout(() => setIsLongPressing(false), 100);
    };

    return (
        <div ref={containerRef} className="flex h-full w-full">
            {/* Main Calendar Section */}
            <div className="flex flex-1 flex-col py-3 pr-4">
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Week badge */}
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-gray-200 text-[11px] shadow-sm">
                            <div className="font-medium tracking-wide text-gray-500 uppercase">Week</div>
                            <div className="text-2xl leading-6 font-semibold">{wk}</div>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-semibold">Week {wk}</span>
                            </div>
                            <div className="text-sm text-gray-500">{weekRangeText}</div>
                        </div>
                    </div>

                    {/* Right-side controls (no FC title, no overlap) */}
                    <div className="flex items-center rounded-lg border border-gray-200 shadow-sm">
                        <button
                            className="cursor-pointer rounded-l-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                            onClick={() => {
                                const api = calRef.current?.getApi();
                                api?.prev();
                                // Update selected date to match the new calendar view
                                const newDate = api?.getDate();
                                if (newDate) {
                                    setSelectedDate(new Date(newDate));
                                    onDateChange?.(new Date(newDate));
                                }
                            }}
                        >
                            ‹
                        </button>
                        <button
                            className="cursor-pointer border-x border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                            onClick={() => {
                                const api = calRef.current?.getApi();
                                api?.today();
                                // Update selected date to today
                                setSelectedDate(new Date());
                                onDateChange?.(new Date());
                            }}
                        >
                            Today
                        </button>
                        <button
                            className="cursor-pointer rounded-r-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                            onClick={() => {
                                const api = calRef.current?.getApi();
                                api?.next();
                                // Update selected date to match the new calendar view
                                const newDate = api?.getDate();
                                if (newDate) {
                                    setSelectedDate(new Date(newDate));
                                    onDateChange?.(new Date(newDate));
                                }
                            }}
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
                        /** hide built-in toolbar entirely so we control header layout */
                        headerToolbar={false}
                        height="100%"
                        expandRows
                        firstDay={1} // Start week on Monday (0=Sunday, 1=Monday)
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
                        slotLabelFormat={{ hour: "numeric", meridiem: "short" }} // 1 am
                        nowIndicator
                        scrollTime={scrollTime}
                        timeZone="Australia/Sydney"
                        selectable
                        selectMirror
                        unselectAuto={false}
                        longPressDelay={1200}
                        selectLongPressDelay={1200}
                        events={events}
                        eventMinHeight={5}
                        // Enable drop functionality
                        droppable={true}
                        dropAccept=".draggable-ticket"
                        // Enable event resizing and dragging
                        editable={true}
                        eventResizableFromStart={true} // Allow resizing from the start (top edge)
                        eventDurationEditable={true} // Allow resizing from the end (bottom edge)
                        eventStartEditable={true} // Allow dragging to change start time
                        eventBackgroundColor="#ffffff"
                        eventBorderColor="#d1d5db"
                        eventTextColor="#374151"
                        eventClassNames={() => ["rounded-lg", "border", "overflow-hidden", "relative"]}
                        eventContent={(arg) => {
                            // Calculate event duration in minutes
                            const start = arg.event.start;
                            const end = arg.event.end;
                            const durationMinutes = start && end ? (end.getTime() - start.getTime()) / (1000 * 60) : 60;

                            // Get color band settings from event extended props
                            const bandColor = arg.event.extendedProps?.bandColor || "#3b82f6"; // Default blue
                            const showBand = arg.event.extendedProps?.showBand !== false; // Show by default

                            // Check if event is completed (Done or Removed status)
                            const isCompleted = arg.event.extendedProps?.ticket_status === "Done" || arg.event.extendedProps?.ticket_status === "Removed";

                            // Use compact layout for events less than 30 minutes
                            const isShortEvent = durationMinutes < 30;

                            if (isShortEvent) {
                                const durationText = `${Math.round(durationMinutes)}m`;

                                return (
                                    <div className="relative flex h-full">
                                        {/* Vertical color band */}
                                        {showBand && <div className="w-1 flex-shrink-0 rounded-l-xs" style={{ backgroundColor: bandColor }} />}
                                        {/* Event content */}
                                        <div className="flex w-full flex-1 items-center gap-1 px-2 py-1 leading-4">
                                            <div className="flex-1 truncate text-xs font-medium">{arg.event.title}</div>
                                            <div className="w-8 flex-shrink-0 text-right text-xs whitespace-nowrap opacity-70">{durationText}</div>
                                        </div>
                                        {/* Diagonal lines overlay for completed events */}
                                        {isCompleted && (
                                            <div
                                                className="pointer-events-none absolute inset-0"
                                                style={{
                                                    background: `repeating-linear-gradient(
                                                        45deg,
                                                        transparent,
                                                        transparent 4px,
                                                        rgba(107, 114, 128, 0.4) 4px,
                                                        rgba(107, 114, 128, 0.4) 6px
                                                    )`,
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            }

                            // Default layout for longer events
                            return (
                                <div className="relative flex h-full">
                                    {/* Vertical color band */}
                                    {showBand && <div className="w-1 flex-shrink-0 rounded-l-xs" style={{ backgroundColor: bandColor }} />}
                                    {/* Event content */}
                                    <div className="flex-1 px-2 py-1 leading-4">
                                        {(durationMinutes < 45 && (
                                            <div className="line-clamp-1 overflow-hidden text-xs font-semibold">{arg.event.title}</div>
                                        )) || (
                                            <>
                                                <div className="line-clamp-2 overflow-hidden text-xs font-semibold">{arg.event.title}</div>
                                                <div className="text-xs opacity-70">{arg.event.extendedProps.ticket_key}</div>
                                            </>
                                        )}
                                        <div className="text-xs opacity-70">{arg.timeText}</div>
                                    </div>
                                    {/* Diagonal lines overlay for completed events */}
                                    {isCompleted && (
                                        <div
                                            className="pointer-events-none absolute inset-0"
                                            style={{
                                                background: `repeating-linear-gradient(
                                                    45deg,
                                                    transparent,
                                                    transparent 4px,
                                                    rgba(107, 114, 128, 0.4) 4px,
                                                    rgba(107, 114, 128, 0.4) 6px
                                                )`,
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        }}
                        datesSet={(dateInfo) => {
                            // Update selected date when calendar view changes
                            const newDate = new Date(dateInfo.start);
                            setSelectedDate(newDate);
                            onDateChange?.(newDate);
                        }}
                        select={(info) => console.log("selected", info.start?.toISOString(), info.end?.toISOString())}
                        eventClick={(info) => {
                            // Only handle clicks for editable events or non-long-press clicks
                            if (editableEventId === info.event.id) {
                                // Show context menu for editable events
                                setContextMenu({
                                    show: true,
                                    x: info.jsEvent.clientX,
                                    y: info.jsEvent.clientY,
                                    type: "event",
                                    eventId: info.event.id,
                                });
                            } else if (!isLongPressing) {
                                onEventClick?.(info.event.extendedProps.ticket_id);
                            }
                        }}
                        // Handle right-click context menu
                        eventDidMount={(info) => {
                            // Add right-click handler to events
                            const handleEventContextMenu = (e: MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation(); // Prevent event from bubbling up
                                console.log("Event context menu triggered for:", info.event.id);

                                // Don't show context menu if event is in editing mode (unless it's this event)
                                if (editableEventId && editableEventId !== info.event.id) {
                                    return;
                                }

                                setContextMenu({
                                    show: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    type: "event",
                                    eventId: info.event.id,
                                });
                            };

                            info.el.addEventListener("contextmenu", handleEventContextMenu);

                            // Add touch handlers for long press
                            info.el.addEventListener("touchstart", (e) => {
                                handleTouchStart(e as any, info.event.id);
                            });
                            info.el.addEventListener("touchend", handleTouchEnd);
                            info.el.addEventListener("touchcancel", handleTouchEnd);
                        }}
                        // Handle event resizing
                        eventResize={(info) => {
                            console.log("Event resized:", info);
                            // TODO: Update event in state and persist to backend
                            const updatedEvent = {
                                ...info.event.extendedProps,
                                eventId: info.event.id,
                                startDate: info.event.start?.toISOString(),
                                endDate: info.event.end?.toISOString(),
                            };
                            onEventChange?.(updatedEvent);
                        }}
                        // Handle dropped tickets
                        drop={(info) => {
                            console.log("Ticket dropped on calendar:", info);

                            // Extract ticket information from the dropped element
                            const ticketId = info.draggedEl?.dataset?.ticketId;
                            const ticket = ticketId
                                ? Object.values(tickets)
                                      .flat()
                                      .find((t) => t.ticket_id === ticketId)
                                : null;

                            // Call the handler with both ticket and drop info
                            if (ticket) {
                                onEventDrop?.({
                                    ...info,
                                    ticket: ticket,
                                });
                            }
                        }}
                        // Handle event dragging (moving to different time)
                        eventReceive={(info) => {
                            // Skip if this is a ticket being dropped from sidebar
                            if (info.draggedEl?.classList?.contains("draggable-ticket")) {
                                console.log("Skipping ticket drop in eventReceive, should use drop handler");
                                return;
                            }

                            console.log("Event Received (existing event moved):", info);
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
                    onProjectChange={onProjectChange}
                    onItemClick={onTicketClick}
                />
            )}

            {/* Context Menu */}
            {contextMenu.show && (
                <div
                    className="fixed z-50 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    style={{
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={handleOpenEvent}>
                        <span>Open Event</span>
                    </button>
                    <button className="flex w-full items-center px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={handleDeleteEvent}>
                        <span>Delete Event</span>
                    </button>
                </div>
            )}
        </div>
    );
}

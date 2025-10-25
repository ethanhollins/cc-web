import React, { useEffect, useRef } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import { Draggable } from "@fullcalendar/interaction";
import {
    AlertCircle,
    Archive,
    BookOpen01,
    CalendarDate,
    CalendarPlus01,
    Check,
    CheckDone02,
    CheckSquare,
    ChevronDown,
    Clock,
    Diamond01,
    Feather,
} from "@untitledui/icons";
import { Project, Ticket, TicketStatus, TicketType } from "@/app/home-screen";

type Props = {
    items: Record<string, Ticket[]>;
    projects: Project[];
    selectedProjectKey?: string;
    selectedDay?: Date | null;
    events?: EventInput[];
    onProjectChange?: (projectKey: string) => void;
    onItemClick?: (ticket: Ticket) => void;
    onScheduleTicket?: (ticketId: string, scheduledDate: string) => void;
    onShowCalendarPicker?: (x: number, y: number, onSelect: (date: Date) => void) => void;
};

type TabType = "today" | "unscheduled" | "backlog";

const statusRank: Record<TicketStatus, number> = {
    "In Progress": 0,
    "In Review": 1,
    Blocked: 2,
    Todo: 3,
    Backlog: 4,
    Done: 5,
    Removed: 6,
};

function typeIcon(t: TicketType) {
    const base = "size-3";
    switch (t) {
        case "bug":
            return <AlertCircle className={`${base} text-red-600`} />;
        case "story":
            return <BookOpen01 className={`${base} text-green-600`} />;
        case "epic":
            return <Diamond01 className={`${base} text-purple-600`} />;
        case "subtask":
            return <CheckDone02 className={`${base} text-blue-600`} />;
        default:
            return <CheckSquare className={`${base} text-blue-600`} />; // task
    }
}

function statusPillClasses(status: TicketStatus) {
    // Subtle colored pills by bucket
    if (status === "In Progress" || status === "In Review") return "bg-indigo-50 text-indigo-700";
    if (status === "Todo" || status === "Backlog") return "bg-gray-100 text-gray-700";
    if (status === "Blocked") return "bg-amber-50 text-amber-700";
    if (status === "Done") return "bg-emerald-50 text-emerald-700";
    return "bg-rose-50 text-rose-700"; // Removed
}

// Schedule Button Component with Date Picker
function ScheduleButton({
    ticket,
    onSchedule,
    onShowCalendarPicker,
}: {
    ticket: Ticket;
    onSchedule: (date: string) => void;
    onShowCalendarPicker?: (x: number, y: number, onSelect: (date: Date) => void) => void;
}) {
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (onShowCalendarPicker && buttonRef.current) {
            // Calculate position for calendar
            const rect = buttonRef.current.getBoundingClientRect();
            const calendarWidth = 288; // 72 * 4 (w-72 = 18rem = 288px)
            const calendarHeight = 320; // Approximate height

            let x = rect.right - calendarWidth; // Align right edge with button
            let y = rect.bottom + 4; // 4px gap below button

            // Adjust if calendar would go off-screen
            if (x < 8) x = 8; // 8px margin from left edge
            if (x + calendarWidth > window.innerWidth - 8) {
                x = window.innerWidth - calendarWidth - 8;
            }
            if (y + calendarHeight > window.innerHeight - 8) {
                y = rect.top - calendarHeight - 4; // Show above button if no space below
            }

            // Show calendar with calculated position and date handler
            onShowCalendarPicker(x, y, (date: Date) => {
                // Use local timezone to avoid date shifting issues
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const selectedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
                onSchedule(selectedDate);
            });
        }
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleButtonClick}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
        >
            <CalendarPlus01 className="size-3" />
        </button>
    );
}

export default function TicketsList({
    items,
    projects,
    selectedProjectKey,
    selectedDay,
    events = [],
    onProjectChange,
    onItemClick,
    onScheduleTicket,
    onShowCalendarPicker,
}: Props) {
    const [projectKey, setProjectKey] = React.useState<string>(selectedProjectKey || (projects[0]?.project_key ?? ""));
    const [activeTab, setActiveTab] = React.useState<TabType>("today");
    const ticketsListRef = useRef<HTMLDivElement>(null);
    const draggableRef = useRef<Draggable | null>(null);
    const isDraggingRef = useRef<boolean>(false);

    React.useEffect(() => {
        if (selectedProjectKey && selectedProjectKey !== projectKey) {
            setProjectKey(selectedProjectKey);
        }
    }, [selectedProjectKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        setProjectKey(v);
        onProjectChange?.(v);
    };

    const handleTicketClick = (ticket: Ticket) => {
        // Only trigger click if we're not in the middle of a drag operation
        if (!isDraggingRef.current) {
            onItemClick?.(ticket);
        }
    };

    const projectTickets = React.useMemo(() => {
        const allTickets = items[projectKey] || [];

        // Base filter: exclude epics and removed tickets, but keep done tickets for special handling
        let filtered = allTickets.filter((ticket) => ticket.ticket_type.toLowerCase() !== "epic" && !["removed"].includes(ticket.ticket_status.toLowerCase()));

        // If no selected day, show all filtered tickets in the appropriate tabs (excluding done)
        if (!selectedDay) {
            const nonDoneFiltered = filtered.filter((ticket) => !["done"].includes(ticket.ticket_status.toLowerCase()));
            switch (activeTab) {
                case "today":
                    return nonDoneFiltered.filter((ticket) => ["in progress", "in review"].includes(ticket.ticket_status.toLowerCase()));
                case "unscheduled":
                    return nonDoneFiltered.filter((ticket) => ["todo"].includes(ticket.ticket_status.toLowerCase()));
                case "backlog":
                    return nonDoneFiltered.filter((ticket) => ["backlog", "blocked"].includes(ticket.ticket_status.toLowerCase()));
                default:
                    return nonDoneFiltered;
            }
        }

        // Helper function to safely convert DateInput to Date
        const toDate = (dateInput: any): Date | null => {
            if (!dateInput) return null;
            if (dateInput instanceof Date) return dateInput;
            if (typeof dateInput === "string" || typeof dateInput === "number") {
                return new Date(dateInput);
            }
            return null;
        };

        // Helper function to check if a ticket has an event on the selected day
        const hasEventOnSelectedDay = (ticket: Ticket) => {
            if (!selectedDay || !events.length) return false;

            const selectedDayStart = new Date(selectedDay);
            selectedDayStart.setHours(0, 0, 0, 0);

            const selectedDayEnd = new Date(selectedDay);
            selectedDayEnd.setHours(23, 59, 59, 999);

            return events.some((event) => {
                // Check if event is associated with this ticket
                const isTicketEvent = event.extendedProps?.ticket_id === ticket.ticket_id || event.extendedProps?.ticket_key === ticket.ticket_key;

                if (!isTicketEvent) return false;

                // Check if event occurs on selected day
                const eventStart = toDate(event.start);
                const eventEnd = toDate(event.end);

                if (eventStart) {
                    // Event starts on selected day
                    if (eventStart >= selectedDayStart && eventStart <= selectedDayEnd) return true;

                    // Event spans across selected day
                    if (eventEnd && eventStart < selectedDayStart && eventEnd > selectedDayStart) return true;
                }

                return false;
            });
        };

        // Helper function to check if a ticket is scheduled for today or earlier
        const isScheduledForTodayOrEarlier = (ticket: Ticket) => {
            if (!selectedDay || !ticket.scheduled_date) return false;

            const scheduledDate = new Date(ticket.scheduled_date);
            scheduledDate.setHours(0, 0, 0, 0);

            const selectedDayStart = new Date(selectedDay);
            selectedDayStart.setHours(0, 0, 0, 0);

            // Show if scheduled for selected day or earlier (and not done)
            return scheduledDate <= selectedDayStart;
        };

        // Helper function to get the earliest and latest event dates for a ticket
        const getTicketEventDateRange = (ticket: Ticket) => {
            if (!events.length) return null;

            const ticketEvents = events.filter((event) => {
                return event.extendedProps?.ticket_id === ticket.ticket_id || event.extendedProps?.ticket_key === ticket.ticket_key;
            });

            if (ticketEvents.length === 0) return null;

            let earliest: Date | null = null;
            let latest: Date | null = null;

            ticketEvents.forEach((event) => {
                const eventStart = toDate(event.start);
                const eventEnd = toDate(event.end);

                if (eventStart) {
                    if (!earliest || eventStart < earliest) {
                        earliest = eventStart;
                    }
                }

                if (eventEnd) {
                    if (!latest || eventEnd > latest) {
                        latest = eventEnd;
                    }
                } else if (eventStart) {
                    // If no end date, use start date as latest
                    if (!latest || eventStart > latest) {
                        latest = eventStart;
                    }
                }
            });

            return earliest && latest ? { earliest, latest } : null;
        };

        // Helper function to check if a ticket should show in today based on events
        const hasEventForToday = (ticket: Ticket) => {
            if (!selectedDay || !events.length) return false;

            const selectedDayStart = new Date(selectedDay);
            selectedDayStart.setHours(0, 0, 0, 0);

            const eventRange = getTicketEventDateRange(ticket);
            if (!eventRange) return false;

            const isDone = ticket.ticket_status.toLowerCase() === "done";

            if (isDone) {
                // For done tickets, show them from earliest event date to latest event date
                const earliestDate = new Date(eventRange.earliest);
                earliestDate.setHours(0, 0, 0, 0);

                const latestDate = new Date(eventRange.latest);
                latestDate.setHours(0, 0, 0, 0);

                return selectedDayStart >= earliestDate && selectedDayStart <= latestDate;
            } else {
                // For non-done tickets, show them on or after the earliest event date
                const earliestDate = new Date(eventRange.earliest);
                earliestDate.setHours(0, 0, 0, 0);

                return selectedDayStart >= earliestDate;
            }
        };

        // Filter based on selected day and events
        switch (activeTab) {
            case "today":
                // Show tickets that have events on/after selected day OR are scheduled for selected day or earlier
                return filtered.filter((ticket) => {
                    return hasEventOnSelectedDay(ticket) || hasEventForToday(ticket) || isScheduledForTodayOrEarlier(ticket);
                });

            case "unscheduled":
                // Show tickets that don't have events on the selected day, don't have events for today, are not scheduled for today or earlier, and are not in backlog or done
                return filtered.filter(
                    (ticket) =>
                        !hasEventOnSelectedDay(ticket) &&
                        !hasEventForToday(ticket) &&
                        !isScheduledForTodayOrEarlier(ticket) &&
                        !["backlog", "blocked", "done"].includes(ticket.ticket_status.toLowerCase()),
                );

            case "backlog":
                // Show tickets with backlog status regardless of events (excluding done unless they have events in range)
                return filtered.filter((ticket) => {
                    const isBacklogStatus = ["backlog", "blocked"].includes(ticket.ticket_status.toLowerCase());
                    const isDone = ticket.ticket_status.toLowerCase() === "done";

                    if (isDone) {
                        // Done tickets only show in backlog if they don't have events for today
                        return isBacklogStatus && !hasEventForToday(ticket);
                    }

                    return isBacklogStatus;
                });

            default:
                return filtered.filter((ticket) => !["done"].includes(ticket.ticket_status.toLowerCase()));
        }
    }, [items, projectKey, activeTab, selectedDay, events]);

    const sorted = [...projectTickets].sort((a, b) => {
        const ar = statusRank[a.ticket_status] ?? 99;
        const br = statusRank[b.ticket_status] ?? 99;
        if (ar !== br) return ar - br;
        // Stable secondary sort: newest first by key/id if you like; here alphabetical by key
        return parseInt(b.ticket_key.split("-")[1]) - parseInt(a.ticket_key.split("-")[1]);
    });

    // Setup drag and drop functionality
    useEffect(() => {
        if (ticketsListRef.current) {
            // Clean up previous draggable instance
            if (draggableRef.current) {
                draggableRef.current.destroy();
            }

            // Initialize FullCalendar's Draggable for the ticket items
            draggableRef.current = new Draggable(ticketsListRef.current, {
                itemSelector: ".draggable-ticket",
                // Optimize performance
                longPressDelay: 300, // Require 300ms long press before drag starts
                minDistance: 5, // Small minimum distance to reduce sensitivity
                eventData: function (eventEl) {
                    const ticketId = eventEl.dataset.ticketId;
                    const ticket = sorted.find((t) => t.ticket_id === ticketId);
                    if (ticket) {
                        return {
                            id: ticket.ticket_id,
                            title: ticket.title,
                            duration: "00:30:00", // Default 30 minutes duration
                            extendedProps: {
                                showBand: false,
                                ticket_key: ticket.ticket_key,
                                ticket_type: ticket.ticket_type,
                                ticket_status: ticket.ticket_status,
                                project: projects.find((p) => p.project_key === projectKey),
                            },
                        };
                    }
                    return null;
                },
            });

            // Add mouse event listeners to track dragging state
            const ticketElements = ticketsListRef.current.querySelectorAll(".draggable-ticket");

            const handleMouseDown = () => {
                // Set a small timeout to detect if this becomes a drag
                setTimeout(() => {
                    // Check if mouse is still down - if so, it's likely a drag
                    const isMouseDown = document.querySelector(".fc-event-dragging") !== null || document.querySelector(":active") !== null;
                    if (isMouseDown) {
                        isDraggingRef.current = true;
                    }
                }, 100);
            };

            const handleMouseUp = () => {
                // Reset drag flag after a small delay
                setTimeout(() => {
                    isDraggingRef.current = false;
                }, 50);
            };

            // Add event listeners to all ticket elements
            ticketElements.forEach((element) => {
                element.addEventListener("mousedown", handleMouseDown);
                element.addEventListener("touchstart", handleMouseDown);
            });

            // Add global listeners for mouse up
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchend", handleMouseUp);

            // Store cleanup function
            const cleanup = () => {
                ticketElements.forEach((element) => {
                    element.removeEventListener("mousedown", handleMouseDown);
                    element.removeEventListener("touchstart", handleMouseDown);
                });
                document.removeEventListener("mouseup", handleMouseUp);
                document.removeEventListener("touchend", handleMouseUp);
            };

            return cleanup;
        }

        return () => {
            if (draggableRef.current) {
                draggableRef.current.destroy();
                draggableRef.current = null;
            }
            // Reset drag flag on cleanup
            isDraggingRef.current = false;
        };
    }, [sorted, projectKey, projects]);

    return (
        <div className="flex h-full w-65 flex-col border-l border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="mb-3">
                    <div className="flex items-center gap-2">
                        <Feather className="size-5 text-violet-800" />
                        <h3 className="text-lg font-semibold text-violet-950">Project Tickets</h3>
                    </div>
                    {selectedDay && (
                        <div className="mt-1 text-sm text-gray-600">
                            {selectedDay.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <select
                        value={projectKey}
                        onChange={handleChange}
                        className="w-full appearance-none truncate rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-3 text-sm font-medium whitespace-nowrap text-gray-900 shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    >
                        {projects
                            .filter((p) => p.project_status.toLowerCase() === "in progress")
                            .map((p) => (
                                <option key={p.project_key} value={p.project_key}>
                                    {p.project_key} — {p.title}
                                </option>
                            ))}
                        {projects.length === 0 && <option value="">No projects</option>}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-gray-500" />
                </div>

                {/* Tab Navigation */}
                <div className="mt-3 flex items-center justify-end gap-1">
                    <button
                        onClick={() => setActiveTab("today")}
                        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                            activeTab === "today" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                    >
                        <CalendarDate className="size-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("unscheduled")}
                        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                            activeTab === "unscheduled" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                    >
                        <Clock className="size-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("backlog")}
                        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                            activeTab === "backlog" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                    >
                        <Archive className="size-4" />
                    </button>
                </div>
            </div>

            {/* Tickets List */}
            <div ref={ticketsListRef} className="flex-1 overflow-y-auto">
                {sorted.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No tickets available for this project</div>
                ) : (
                    <div className="space-y-2 p-2">
                        {sorted.map((ticket) => {
                            const isDone = ticket.ticket_status.toLowerCase() === "done";
                            return (
                                <div
                                    key={ticket.ticket_id}
                                    data-ticket-id={ticket.ticket_id}
                                    className={`draggable-ticket cursor-grab rounded-lg border p-3 shadow-sm active:cursor-grabbing ${
                                        isDone ? "border-gray-100 bg-gray-50 opacity-75" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                                    }`}
                                    onClick={() => handleTicketClick(ticket)}
                                    style={{
                                        // Optimize for dragging performance
                                        willChange: "transform",
                                        backfaceVisibility: "hidden",
                                        transform: "translateZ(0)", // Force hardware acceleration
                                    }}
                                >
                                    {/* Ticket header */}
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                                                {isDone ? <Check className="size-3 text-emerald-600" /> : typeIcon(ticket.ticket_type)}
                                            </span>
                                            <span className={`text-xs font-medium ${isDone ? "text-gray-500" : "text-gray-600"}`}>{ticket.ticket_key}</span>
                                        </div>
                                        <span
                                            className={[
                                                "rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                                                statusPillClasses(ticket.ticket_status),
                                            ].join(" ")}
                                        >
                                            {ticket.ticket_status}
                                        </span>
                                    </div>

                                    {/* Ticket title */}
                                    <p
                                        className={`mb-2 line-clamp-2 text-sm leading-tight font-medium ${isDone ? "text-gray-500 line-through" : "text-gray-900"}`}
                                    >
                                        {ticket.title}
                                    </p>
                                    {/* Epic, Scheduled Date, and Schedule Button Row */}
                                    <div className="flex items-center justify-between">
                                        {/* Epic */}
                                        {ticket.epic && (
                                            <div className="flex min-w-0 flex-shrink items-center gap-2">
                                                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                                                    <Diamond01 className={`size-3 ${isDone ? "text-gray-400" : "text-purple-600"}`} />
                                                </span>
                                                <span className={`truncate text-xs ${isDone ? "text-gray-400" : "text-gray-600"}`}>{ticket.epic}</span>
                                            </div>
                                        )}

                                        {/* Scheduled date and Schedule button */}
                                        <div className="flex items-center gap-2">
                                            {/* Scheduled date for scheduled tickets */}
                                            {ticket.scheduled_date && !isDone && (
                                                <span className="flex-shrink-0 text-xs text-violet-600">
                                                    {new Date(ticket.scheduled_date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            )}

                                            {/* Schedule button for both unscheduled and scheduled tickets */}
                                            {!isDone && (
                                                <ScheduleButton
                                                    ticket={ticket}
                                                    onSchedule={(date) => onScheduleTicket?.(ticket.ticket_id, date)}
                                                    onShowCalendarPicker={onShowCalendarPicker}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

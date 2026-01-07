import React, { useEffect, useRef } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import { Draggable } from "@fullcalendar/interaction";
import {
  AlertCircle,
  Archive,
  BookOpen01,
  CalendarDate,
  CalendarMinus01,
  CalendarPlus01,
  Check,
  CheckDone02,
  CheckSquare,
  ChevronDown,
  Clock,
  Diamond01,
  Feather,
  Image01,
  Plus,
} from "@untitledui/icons";
import moment from "moment-timezone";
import { Project, Ticket, TicketStatus, TicketType } from "@/old/app/home-screen";
import { CalendarCard } from "@/old/components/base/calendar";
import { DEFAULT_CALENDAR_ID, handleCreateTicket } from "@/old/utils/calendar-event-handlers";

type Props = {
  items: Record<string, Ticket[]>;
  projects: Project[];
  selectedProjectKey?: string;
  selectedDay?: Date | null;
  events?: any[];
  onProjectChange?: (projectKey: string) => void;
  onItemClick?: (ticket: Ticket) => void;
  onScheduleTicket?: (ticketId: string, scheduledDate: string) => void;
  onUnscheduleTicket?: (ticketId: string) => void;
  onShowCalendarPicker?: (x: number, y: number, onSelect: (date: Date) => void) => void;
  onCreateTicket?: (createdTicket: Ticket, projectKey: string) => void;
  updateEvents?: (updater: (prevEvents: any[]) => any[]) => void;
  createEventTrigger?: { startDate: Date; endDate: Date; projectKey: string } | null;
  onUnselectCalendar?: () => void;
};

type TabType = "today" | "unscheduled" | "backlog";

const statusRank: Record<TicketStatus, number> = {
  "In Progress": 0,
  "In Review": 1,
  Ongoing: 2,
  Blocked: 3,
  Todo: 4,
  Backlog: 5,
  Done: 6,
  Removed: 7,
};

function typeIcon(t: TicketType) {
  const base = "size-3";
  switch (t.toLowerCase()) {
    case "bug":
      return <AlertCircle className={`${base} text-red-600`} />;
    case "story":
      return <BookOpen01 className={`${base} text-green-600`} />;
    case "epic":
      return <Diamond01 className={`${base} text-purple-600`} />;
    case "subtask":
      return <CheckDone02 className={`${base} text-blue-600`} />;
    case "event":
      return <CalendarDate className={`${base} text-gray-600`} />;
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

// Unschedule Button Component
function UnscheduleButton({ ticket, onUnschedule }: { ticket: Ticket; onUnschedule: (ticketId: string) => void }) {
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onUnschedule(ticket.ticket_id);
  };

  return (
    <button
      onClick={handleButtonClick}
      className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-orange-600 transition-colors hover:bg-orange-100"
    >
      <CalendarMinus01 className="size-3" />
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
  onUnscheduleTicket,
  onShowCalendarPicker,
  onCreateTicket,
  updateEvents,
  createEventTrigger,
  onUnselectCalendar,
}: Props) {
  const [projectKey, setProjectKey] = React.useState<string>(selectedProjectKey || (projects[0]?.project_key ?? ""));
  const [activeTab, setActiveTab] = React.useState<TabType>("today");
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);
  const [newTicketTitle, setNewTicketTitle] = React.useState<string>("");
  const [newTicketProject, setNewTicketProject] = React.useState<string>(projectKey);
  const [newTicketType, setNewTicketType] = React.useState<TicketType>("event");
  const [newTicketScheduledDate, setNewTicketScheduledDate] = React.useState<string | null>(null);
  const [newEventDateRange, setNewEventDateRange] = React.useState<{ startDate: Date; endDate: Date } | null>(null);
  const [showCalendarPicker, setShowCalendarPicker] = React.useState<boolean>(false);
  const [calendarPickerPosition, setCalendarPickerPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCreatingTicket, setIsCreatingTicket] = React.useState<boolean>(false);
  const ticketsListRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const createModalRef = useRef<HTMLDivElement>(null);

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

  // Handle create ticket modal
  const handleCreateTicketSubmit = async () => {
    if (!newTicketTitle.trim() || isCreatingTicket) return;

    setIsCreatingTicket(true);
    try {
      // Find the selected project to get its ID
      const selectedProject = projects.find((p) => p.project_key === newTicketProject);
      if (!selectedProject) {
        console.error("Selected project not found");
        return;
      }

      // Prepare ticket data for API
      const ticketData = {
        title: newTicketTitle.trim(),
        project_id: selectedProject.notion_id,
        internal_project_id: selectedProject.project_id,
        type: newTicketType.charAt(0).toUpperCase() + newTicketType.slice(1), // Capitalize first letter
        google_calendar_id: DEFAULT_CALENDAR_ID,
        // If we have event date range (from calendar), always use start/end dates regardless of ticket type
        ...(newEventDateRange && {
          start_date: moment.tz(newEventDateRange.startDate, "Australia/Sydney").format(),
          end_date: moment.tz(newEventDateRange.endDate, "Australia/Sydney").format(),
        }),
        // Only use scheduled_date if there's no event date range (manually scheduled)
        ...(!newEventDateRange &&
          newTicketScheduledDate && {
            scheduled_date: newTicketScheduledDate,
          }),
      };

      // Use the calendar event handler
      const createdTicket = await handleCreateTicket(ticketData, events || [], updateEvents || (() => {}));

      console.log("Ticket created successfully:", createdTicket);

      // Call parent callback if provided (for local state updates in items)
      if (onCreateTicket) {
        onCreateTicket(createdTicket, newTicketProject);
      }

      // Reset form
      setNewTicketTitle("");
      setNewTicketProject(projectKey);
      setNewTicketType("event");
      setNewTicketScheduledDate(null);
      setNewEventDateRange(null);
      setShowCalendarPicker(false);
      setShowCreateModal(false);

      // Unselect calendar after successful ticket creation
      if (onUnselectCalendar) {
        onUnselectCalendar();
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to create ticket: ${errorMessage}`);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewTicketTitle("");
    setNewTicketProject(projectKey);
    setNewTicketType("event");
    setNewTicketScheduledDate(null);
    setNewEventDateRange(null);
    setShowCalendarPicker(false);
    setIsCreatingTicket(false);

    // Unselect calendar when modal is closed
    if (onUnselectCalendar) {
      onUnselectCalendar();
    }
  };

  // Update new ticket project when main project changes
  useEffect(() => {
    setNewTicketProject(projectKey);
    // Only reset ticket type if not creating from calendar interaction (no event date range)
    if (!newEventDateRange) {
      setNewTicketType("task"); // Reset to default type when project changes
    }
  }, [projectKey, newEventDateRange]);

  // Handle external event creation trigger
  useEffect(() => {
    if (createEventTrigger) {
      setNewEventDateRange({
        startDate: createEventTrigger.startDate,
        endDate: createEventTrigger.endDate,
      });
      setNewTicketType("event");
      setNewTicketProject(createEventTrigger.projectKey);
      setNewTicketTitle("");
      setNewTicketScheduledDate(null);
      setShowCreateModal(true);
    }
  }, [createEventTrigger]);

  const handleTicketClick = (ticket: Ticket) => {
    // Only trigger click if we're not in the middle of a drag operation
    if (!isDraggingRef.current) {
      onItemClick?.(ticket);
    }
  };

  const projectTickets = React.useMemo(() => {
    const allTickets = items[projectKey] || [];

    // Base filter: exclude epics, events, and removed tickets, but keep done tickets for special handling
    let filtered = allTickets.filter(
      (ticket) => !["epic", "event"].includes(ticket.ticket_type.toLowerCase()) && !["removed"].includes(ticket.ticket_status.toLowerCase()),
    );

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
        // Show tickets based on their status and relationships to events/scheduled dates
        return filtered.filter((ticket) => {
          const isDone = ticket.ticket_status.toLowerCase() === "done";

          if (isDone) {
            // Done tickets: only show if they have events and selected day is within event range
            // OR if they have no events but have a scheduled date and selected day matches scheduled date
            const eventRange = getTicketEventDateRange(ticket);
            if (eventRange) {
              // Has events - show only if selected day is within the event range
              return hasEventForToday(ticket);
            } else if (ticket.scheduled_date) {
              // No events but has scheduled date - show only on scheduled date
              const scheduledDate = new Date(ticket.scheduled_date);
              scheduledDate.setHours(0, 0, 0, 0);
              const selectedDayStart = new Date(selectedDay);
              selectedDayStart.setHours(0, 0, 0, 0);
              return scheduledDate.getTime() === selectedDayStart.getTime();
            } else {
              // No events and no scheduled date - never show
              return false;
            }
          } else {
            // Non-done tickets: show if they have events on/after selected day OR are scheduled for selected day or earlier
            return hasEventOnSelectedDay(ticket) || hasEventForToday(ticket) || isScheduledForTodayOrEarlier(ticket);
          }
        });

      case "unscheduled":
        // Show tickets that have no scheduled_date at all, don't have events on the selected day, don't have events for today, and are not in backlog or done
        return filtered.filter(
          (ticket) =>
            !ticket.scheduled_date && // Must have no scheduled date
            !hasEventOnSelectedDay(ticket) &&
            !hasEventForToday(ticket) &&
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

  // Helper function to check if a ticket has an active event right now
  const hasActiveEvent = React.useCallback(
    (ticket: Ticket) => {
      if (!events.length) return false;

      const now = new Date();

      // Helper function to safely convert DateInput to Date
      const toDate = (dateInput: any): Date | null => {
        if (!dateInput) return null;
        if (dateInput instanceof Date) return dateInput;
        if (typeof dateInput === "string" || typeof dateInput === "number") {
          return new Date(dateInput);
        }
        return null;
      };

      return events.some((event) => {
        // Check if event is associated with this ticket
        const isTicketEvent = event.extendedProps?.ticket_id === ticket.ticket_id || event.extendedProps?.ticket_key === ticket.ticket_key;

        if (!isTicketEvent) return false;

        const eventStart = toDate(event.start);
        const eventEnd = toDate(event.end);

        if (!eventStart) return false;

        // If no end time, consider it active for the next hour
        if (!eventEnd) {
          const eventEndDefault = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour
          return now >= eventStart && now <= eventEndDefault;
        }

        // Check if current time is within the event's time range
        return now >= eventStart && now <= eventEnd;
      });
    },
    [events],
  );

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
            const project = projects.find((p) => p.project_key === projectKey);
            return {
              id: ticket.ticket_id,
              title: ticket.title,
              duration: "00:30:00", // Default 30 minutes duration
              extendedProps: {
                showBand: ticket.epic !== null && ticket.epic !== "" && ticket.epic !== undefined,
                bandColor: ticket.colour,
                ticket_id: ticket.ticket_id,
                ticket_key: ticket.ticket_key,
                ticket_type: ticket.ticket_type,
                ticket_status: ticket.ticket_status,
                completed: false,
                project: project,
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
    <div className="w-65 flex h-full flex-col border-l border-gray-200 bg-white">
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
            className="w-full appearance-none truncate whitespace-nowrap rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {projects
              .filter((p) => p.project_status.toLowerCase() === "in progress")
              .sort((a, b) => a.project_key.localeCompare(b.project_key))
              .map((p) => (
                <option key={p.project_key} value={p.project_key}>
                  {p.project_key} — {p.title}
                </option>
              ))}
            {projects.length === 0 && <option value="">No projects</option>}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 flex items-center justify-between">
          {/* Create ticket button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-600 transition-colors hover:bg-green-100"
          >
            <Plus className="size-4" />
          </button>

          {/* Tab buttons */}
          <div className="flex items-center gap-1">
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
      </div>

      {/* Tickets List */}
      <div ref={ticketsListRef} className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No tickets available for this project</div>
        ) : (
          <div className="space-y-2 p-2">
            {sorted.map((ticket) => {
              const isDone = ticket.ticket_status.toLowerCase() === "done";
              const isActive = hasActiveEvent(ticket);
              return (
                <div
                  key={ticket.ticket_id}
                  data-ticket-id={ticket.ticket_id}
                  className={`draggable-ticket cursor-grab rounded-lg border p-3 shadow-sm active:cursor-grabbing ${
                    isDone
                      ? "border-gray-100 bg-gray-50 opacity-75"
                      : isActive
                        ? "border-amber-200 bg-white shadow-lg shadow-amber-200/50 hover:border-amber-300 hover:shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
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
                    <span className={["whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", statusPillClasses(ticket.ticket_status)].join(" ")}>
                      {ticket.ticket_status}
                    </span>
                  </div>

                  {/* Ticket title */}
                  <p className={`mb-2 line-clamp-2 text-sm font-medium leading-tight ${isDone ? "text-gray-500 line-through" : "text-gray-900"}`}>
                    {ticket.title}
                  </p>
                  {/* Epic, Scheduled Date, and Schedule Button Row */}
                  <div className="flex items-center justify-between">
                    {/* Epic - takes up left side when present */}
                    <div className="flex min-w-0 flex-shrink items-center gap-2">
                      {ticket.epic && (
                        <>
                          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                            <Diamond01 className={`size-3 ${isDone ? "text-gray-400" : "text-purple-600"}`} />
                          </span>
                          <span className={`truncate text-xs ${isDone ? "text-gray-400" : "text-gray-600"}`}>{ticket.epic}</span>
                        </>
                      )}
                    </div>

                    {/* Scheduled date and Schedule/Unschedule buttons - always on the right */}
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

                      {/* Unschedule button - only show if ticket has scheduled_date */}
                      {!isDone && ticket.scheduled_date && onUnscheduleTicket && <UnscheduleButton ticket={ticket} onUnschedule={onUnscheduleTicket} />}

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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={(e) => {
            // Only close if clicking on the background, not on modal content or calendar
            if (e.target === e.currentTarget) {
              handleCloseCreateModal();
            }
          }}
        >
          <div ref={createModalRef} className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Quick Action Section */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Ticket Title</label>
                <input
                  type="text"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTicketSubmit();
                    } else if (e.key === "Escape") {
                      handleCloseCreateModal();
                    }
                  }}
                  placeholder="Enter ticket title..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  autoFocus
                />
              </div>

              {/* Project and Type selectors */}
              <div className="flex items-center gap-4">
                {/* Project selector */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Feather className="size-3" />
                  <select
                    value={newTicketProject}
                    onChange={(e) => setNewTicketProject(e.target.value)}
                    className="cursor-pointer appearance-none border-none bg-transparent outline-none hover:text-gray-800 focus:text-gray-800"
                  >
                    {projects.map((project) => (
                      <option key={project.project_key} value={project.project_key}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-3" />
                </div>

                {/* Ticket Type selector */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  {typeIcon(newTicketType)}
                  <select
                    value={newTicketType}
                    onChange={(e) => {
                      const newType = e.target.value as TicketType;

                      // If changing from event to non-event type and we have an event date range,
                      // convert to scheduled date but keep event date range for display
                      if (newTicketType === "event" && newType !== "event" && newEventDateRange && !newTicketScheduledDate) {
                        const year = newEventDateRange.startDate.getFullYear();
                        const month = String(newEventDateRange.startDate.getMonth() + 1).padStart(2, "0");
                        const day = String(newEventDateRange.startDate.getDate()).padStart(2, "0");
                        setNewTicketScheduledDate(`${year}-${month}-${day}`);
                        // Keep the event date range for display purposes
                      }
                      // If changing from non-event to event type and we have a scheduled date,
                      // convert to event date range
                      else if (newTicketType !== "event" && newType === "event" && newTicketScheduledDate) {
                        // If we don't have an event date range, create one from scheduled date
                        if (!newEventDateRange) {
                          const scheduledDate = new Date(newTicketScheduledDate);
                          setNewEventDateRange({
                            startDate: scheduledDate,
                            endDate: scheduledDate,
                          });
                        }
                        setNewTicketScheduledDate(null);
                      }

                      setNewTicketType(newType);
                    }}
                    className="cursor-pointer appearance-none border-none bg-transparent outline-none hover:text-gray-800 focus:text-gray-800"
                  >
                    <option value="task">Task</option>
                    <option value="story">Story</option>
                    <option value="bug">Bug</option>
                    <option value="event">Event</option>
                  </select>
                  <ChevronDown className="size-3" />
                </div>
              </div>

              {/* Schedule section - now below dropdowns */}
              <div className="flex items-center justify-end gap-2">
                {/* Show scheduled date for non-event types */}
                {newTicketScheduledDate && newTicketType !== "event" && (
                  <button
                    onClick={() => {
                      setNewTicketScheduledDate(null);
                      // Also clear event date range if it exists
                      setNewEventDateRange(null);
                    }}
                    className="cursor-pointer text-xs font-medium text-violet-600 hover:text-violet-800"
                    title="Click to remove scheduled date"
                  >
                    {/* Show time format if we have event date range, otherwise just date */}
                    {newEventDateRange ? (
                      <>
                        {newEventDateRange.startDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {newEventDateRange.startDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: false,
                        })}{" "}
                        -{" "}
                        {newEventDateRange.endDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </>
                    ) : (
                      new Date(newTicketScheduledDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    )}
                  </button>
                )}{" "}
                {/* Show date range for event types */}
                {newEventDateRange && newTicketType === "event" && (
                  <button
                    onClick={() => setNewEventDateRange(null)}
                    className="cursor-pointer text-xs font-medium text-violet-600 hover:text-violet-800"
                    title="Click to remove date range"
                  >
                    {newEventDateRange.startDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {newEventDateRange.startDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: false,
                    })}{" "}
                    -{" "}
                    {newEventDateRange.endDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </button>
                )}{" "}
                {/* Schedule button - toggle (only for non-event types) */}
                {newTicketType !== "event" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (showCalendarPicker) {
                        setShowCalendarPicker(false);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const calendarWidth = 288;
                        const calendarHeight = 320;

                        let x = rect.right - calendarWidth;
                        let y = rect.bottom + 4;

                        if (x < 8) x = 8;
                        if (x + calendarWidth > window.innerWidth - 8) {
                          x = window.innerWidth - calendarWidth - 8;
                        }
                        if (y + calendarHeight > window.innerHeight - 8) {
                          y = rect.top - calendarHeight - 4;
                        }

                        setCalendarPickerPosition({ x, y });
                        setShowCalendarPicker(true);
                      }
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      showCalendarPicker || newTicketScheduledDate ? "bg-violet-100 text-violet-700" : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                    }`}
                  >
                    <CalendarPlus01 className="size-3" />
                  </button>
                )}
              </div>

              <button
                onClick={() => handleCreateTicketSubmit()}
                disabled={!newTicketTitle.trim() || isCreatingTicket}
                className="w-full rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isCreatingTicket ? "Creating..." : "Create Ticket"}
              </button>
            </div>

            {/* Divider with "or" */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">or</span>
              </div>
            </div>

            {/* Create from image section */}
            <button
              onClick={() => {
                // TODO: Add image-to-ticket functionality
                console.log("Create from image");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Image01 className="size-4" />
              Create from Image
            </button>
          </div>

          {/* Custom Calendar Picker */}
          {showCalendarPicker && (
            <div
              className="z-60 fixed"
              style={{
                left: `${calendarPickerPosition.x}px`,
                top: `${calendarPickerPosition.y}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarCard
                initialDate={new Date()}
                minDate={new Date()}
                onSelect={(date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const selectedDate = `${year}-${month}-${day}`;
                  setNewTicketScheduledDate(selectedDate);
                  setShowCalendarPicker(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

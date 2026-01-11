"use client";

import React, { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { Archive, CalendarDays, ChevronDown, Clock, Feather, Plus } from "lucide-react";
import { CalendarCard } from "@/components/calendar/CalendarCard";
import { TicketCreateModal } from "@/components/modals/TicketCreateModal";
import { TicketCard } from "@/components/planner/TicketCard";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket, TicketStatus } from "@/types/ticket";
import { ScrollArea } from "@/ui/scroll-area";
import { sortTickets } from "@/utils/ticket-sort";

interface TicketsSidebarProps {
  tickets: Record<string, Ticket[]>;
  projects: Project[];
  selectedProjectKey?: string;
  selectedDay?: Date | null;
  events?: CalendarEvent[];
  onProjectChange: (projectKey: string) => void;
  onTicketClick: (ticket: Ticket) => void;
  onScheduleTicket?: (ticketId: string, scheduledDate: string) => void;
  onUnscheduleTicket?: (ticketId: string) => void;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  onCreateTicket?: (ticket: Ticket, projectKey: string) => void;
  onUnselectCalendar?: () => void;
}

type TabType = "today" | "unscheduled" | "backlog";

/**
 * Sidebar component with draggable tickets list
 * Mobile-optimized with larger touch targets
 */
export function TicketsSidebar({
  tickets,
  projects,
  selectedProjectKey,
  selectedDay,
  events,
  onProjectChange,
  onTicketClick,
  onScheduleTicket,
  onUnscheduleTicket,
  onStatusChange,
  onCreateTicket,
  onUnselectCalendar,
}: TicketsSidebarProps) {
  const ticketsListRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>("unscheduled");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [ticketSchedulePicker, setTicketSchedulePicker] = React.useState<{ ticketId: string; x: number; y: number } | null>(null);

  // Initialize FullCalendar Draggable for ticket items
  useEffect(() => {
    if (!ticketsListRef.current) return;

    const draggable = new Draggable(ticketsListRef.current, {
      itemSelector: ".draggable-ticket",
      eventData: (eventEl) => {
        const ticketId = eventEl.getAttribute("data-ticket-id");
        const title = eventEl.getAttribute("data-title") || "";
        const projectId = eventEl.getAttribute("data-project-id");

        return {
          title,
          duration: "00:30:00", // Default 30 minutes
          extendedProps: {
            ticket_id: ticketId,
            project_id: projectId,
          },
        };
      },
    });

    return () => {
      draggable.destroy();
    };
  }, [selectedProjectKey, tickets]);

  const currentTickets = React.useMemo(() => (selectedProjectKey ? tickets[selectedProjectKey] || [] : []), [selectedProjectKey, tickets]);

  const handleOpenCreateModal = () => {
    if (!selectedProjectKey && projects.length === 0) return;
    setIsCreateModalOpen(true);
    onUnselectCalendar?.();
  };

  // Filter tickets based on active tab
  const filteredTickets = React.useMemo(() => {
    // Normalize helper for ticket type
    const getType = (t: Ticket) => (t.ticket_type ? t.ticket_type.toLowerCase() : "");

    // Never show epic-type tickets in the sidebar lists
    const visibleTickets = currentTickets.filter((t) => getType(t) !== "epic");

    if (activeTab === "today") {
      // Use selectedDay when provided; otherwise default to today
      const day = selectedDay ? new Date(selectedDay) : new Date();
      day.setHours(0, 0, 0, 0);

      // Determine which tickets have calendar events on or before the selected day
      let eventTicketIdsOnOrBeforeDay: Set<string> | undefined;
      let eventTicketIdsForDay: Set<string> | undefined;
      let ticketEventDateRanges: Map<string, { firstEventDate: Date; lastEventDate: Date }> | undefined;

      if (events && events.length > 0) {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        // Tickets with events on the selected day (for event-type tickets)
        eventTicketIdsForDay = new Set(
          events
            .filter((event) => {
              const start = new Date(event.start_date);
              const end = new Date(event.end_date);
              return start <= dayEnd && end >= dayStart;
            })
            .map((event) => event.ticket_id)
            .filter((id): id is string => Boolean(id)),
        );

        // Tickets with events on or before the selected day (for filtering)
        eventTicketIdsOnOrBeforeDay = new Set(
          events
            .filter((event) => {
              const start = new Date(event.start_date);
              start.setHours(0, 0, 0, 0);
              return start <= day;
            })
            .map((event) => event.ticket_id)
            .filter((id): id is string => Boolean(id)),
        );

        // Calculate first and last event dates for each ticket (for Done tickets)
        ticketEventDateRanges = new Map();
        events.forEach((event) => {
          if (!event.ticket_id) return;
          const eventDate = new Date(event.start_date);
          eventDate.setHours(0, 0, 0, 0);

          const existing = ticketEventDateRanges!.get(event.ticket_id);
          if (!existing) {
            ticketEventDateRanges!.set(event.ticket_id, {
              firstEventDate: new Date(eventDate),
              lastEventDate: new Date(eventDate),
            });
          } else {
            if (eventDate < existing.firstEventDate) {
              existing.firstEventDate = new Date(eventDate);
            }
            if (eventDate > existing.lastEventDate) {
              existing.lastEventDate = new Date(eventDate);
            }
          }
        });
      }

      const todayTickets = visibleTickets.filter((t) => {
        const status = t.ticket_status;
        const statusLower = status.toLowerCase();
        const isDone = statusLower === "done";
        const isRemoved = statusLower === "removed";
        const isCompletedStatus = isDone || isRemoved;

        // Exclude backlog / blocked tickets from today view
        if (["backlog", "blocked"].includes(statusLower)) return false;

        // Check if ticket has calendar event on or before selected day
        const hasEventOnOrBeforeDay = eventTicketIdsOnOrBeforeDay?.has(t.ticket_id);
        const hasEventForDay = eventTicketIdsForDay?.has(t.ticket_id);
        const eventDateRange = ticketEventDateRanges?.get(t.ticket_id);

        // For event-type tickets: only show when there is a calendar event on this specific day
        if (getType(t) === "event") {
          return hasEventForDay || false;
        }

        // For Done/Removed tickets:
        if (isCompletedStatus) {
          // If has completion_date, show up until completion_date
          if (t.completion_date) {
            const completionDate = new Date(t.completion_date);
            completionDate.setHours(0, 0, 0, 0);

            // If has calendar events, show from first event through completion_date
            if (eventDateRange) {
              return day >= eventDateRange.firstEventDate && day <= completionDate;
            }

            // If no calendar events, show only on completion_date
            return completionDate.getTime() === day.getTime();
          }

          // If no completion_date, use existing behavior
          // With events: show from first event date through last event date
          if (eventDateRange) {
            return day >= eventDateRange.firstEventDate && day <= eventDateRange.lastEventDate;
          }

          // With only scheduled_date: show only on exact scheduled date
          if (t.scheduled_date) {
            const scheduledDate = new Date(t.scheduled_date);
            scheduledDate.setHours(0, 0, 0, 0);
            return scheduledDate.getTime() === day.getTime();
          }

          // No events, no scheduled_date, no completion_date: don't show
          return false;
        }

        // For non-Done, non-Removed, non-event tickets: show if they have a calendar event OR a scheduled_date
        if (hasEventOnOrBeforeDay) return true;

        if (!t.scheduled_date) return false;

        const scheduledDate = new Date(t.scheduled_date);
        scheduledDate.setHours(0, 0, 0, 0);

        // Non-done tickets: show when scheduled for selected day or earlier
        return scheduledDate <= day;
      });

      return sortTickets(todayTickets);
    } else if (activeTab === "unscheduled") {
      // Show non-event tickets: (no scheduled_date) OR (Blocked status ignoring scheduled_date)
      return sortTickets(
        visibleTickets.filter(
          (t) => getType(t) !== "event" && !["Done", "Removed", "Backlog"].includes(t.ticket_status) && (!t.scheduled_date || t.ticket_status === "Blocked"),
        ),
      );
    } else {
      // backlog - show non-event tickets with Backlog status (ignoring scheduled_date)
      return sortTickets(
        visibleTickets.filter((t) => getType(t) !== "event" && t.ticket_status === "Backlog" && !["Done", "Removed"].includes(t.ticket_status)),
      );
    }
  }, [currentTickets, activeTab, selectedDay, events]);

  const getEventTimeRangeForTicket = React.useCallback(
    (ticketId: string): string | null => {
      if (!events || events.length === 0) return null;

      const day = selectedDay ? new Date(selectedDay) : new Date();
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const ticketEventsForDay = events
        .filter((event) => event.ticket_id === ticketId)
        .filter((event) => {
          const start = new Date(event.start_date);
          const end = new Date(event.end_date);
          return start <= dayEnd && end >= dayStart;
        })
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

      if (ticketEventsForDay.length === 0) return null;

      const first = ticketEventsForDay[0];
      const start = new Date(first.start_date);
      const end = new Date(first.end_date);

      const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

      return `${formatTime(start)} - ${formatTime(end)}`;
    },
    [events, selectedDay],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 space-y-3 px-4 pb-4 sm:pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--planner-sidebar-icon-bg)] text-[var(--accent)] shadow-[var(--planner-sidebar-icon-shadow)]">
            <Feather className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Project Tickets</h3>
        </div>
        {selectedDay && (
          <div className="text-sm text-[var(--text-muted)]">
            {selectedDay.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}

        {/* Project selector */}
        <div className="relative">
          <select
            value={selectedProjectKey}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full appearance-none truncate rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2 pl-3 pr-9 text-sm font-medium text-[var(--text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          >
            {projects
              .filter((p) => p.project_status?.toLowerCase() === "in progress")
              .sort((a, b) => a.project_key.localeCompare(b.project_key))
              .map((p) => (
                <option key={p.project_key} value={p.project_key}>
                  {p.project_key} — {p.title}
                </option>
              ))}
            {projects.length === 0 && <option value="">No projects</option>}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          {/* Create ticket button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)]"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Tab buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("today")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                activeTab === "today"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
              )}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("unscheduled")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                activeTab === "unscheduled"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
              )}
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("backlog")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                activeTab === "backlog"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
              )}
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <ScrollArea className="flex-1">
        <div ref={ticketsListRef} className="space-y-2 p-2">
          {filteredTickets.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">{!selectedProjectKey ? "Select a project" : "No tickets available"}</div>
          ) : (
            filteredTickets.map((ticket) => {
              const isDone = ["done", "removed"].includes(ticket.ticket_status?.toLowerCase());
              const isEventToday = activeTab === "today" && ticket.ticket_type?.toLowerCase() === "event";
              const eventTimeRange = isEventToday && ticket.ticket_type?.toLowerCase() === "event" ? getEventTimeRangeForTicket(ticket.ticket_id) : null;
              return (
                <TicketCard
                  key={ticket.ticket_id}
                  ticket={ticket}
                  isDone={isDone}
                  isEventToday={isEventToday}
                  eventTimeRange={eventTimeRange}
                  onTicketClick={onTicketClick}
                  onUnscheduleTicket={onUnscheduleTicket}
                  onStatusChange={onStatusChange}
                  onOpenSchedulePicker={
                    onScheduleTicket
                      ? (ticketId, position) => {
                          setTicketSchedulePicker((prev) => {
                            // Toggle: close if already open for this ticket
                            if (prev?.ticketId === ticketId) {
                              return null;
                            }
                            return { ticketId, ...position };
                          });
                        }
                      : undefined
                  }
                />
              );
            })
          )}
        </div>
      </ScrollArea>

      <TicketCreateModal
        open={isCreateModalOpen}
        projects={projects}
        selectedProjectKey={selectedProjectKey}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTicket={onCreateTicket}
      />

      {ticketSchedulePicker && (
        <div
          className="fixed"
          style={{ left: `${ticketSchedulePicker.x}px`, top: `${ticketSchedulePicker.y}px`, zIndex: 60, pointerEvents: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarCard
            initialDate={(() => {
              const ticket = currentTickets.find((t) => t.ticket_id === ticketSchedulePicker.ticketId);
              return ticket?.scheduled_date ? new Date(ticket.scheduled_date) : new Date();
            })()}
            minDate={new Date()}
            onSelect={(date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              const selectedDate = `${year}-${month}-${day}`;
              onScheduleTicket?.(ticketSchedulePicker.ticketId, selectedDate);
              setTicketSchedulePicker(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

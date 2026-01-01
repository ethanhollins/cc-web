"use client";

import React, { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import {
  AlertCircle,
  Archive,
  BookOpen,
  CalendarDays,
  CalendarMinus,
  CalendarPlus,
  Check,
  CheckSquare,
  ChevronDown,
  Clock,
  Diamond,
  Feather,
  Plus,
} from "lucide-react";
import { createTicket } from "@/api/tickets";
import { CalendarCard } from "@/components/calendar/CalendarCard";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket, TicketType } from "@/types/ticket";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogPortal, DialogTitle } from "@/ui/dialog";
import { ScrollArea } from "@/ui/scroll-area";

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
  onCreateTicket?: (ticket: Ticket, projectKey: string) => void;
  onUnselectCalendar?: () => void;
}

type TabType = "today" | "unscheduled" | "backlog";

function statusPillClasses(status: string) {
  if (status === "In Progress" || status === "In Review") return "bg-indigo-50 text-indigo-700";
  if (status === "Todo" || status === "Backlog") return "bg-gray-100 text-gray-700";
  if (status === "Blocked") return "bg-amber-50 text-amber-700";
  if (status === "Done") return "bg-emerald-50 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}

function ticketTypeIcon(type: TicketType, isDone: boolean) {
  const base = "h-3 w-3";
  if (isDone) return <Check className={`${base} text-emerald-600`} />;

  switch (type.toLowerCase()) {
    case "bug":
      return <AlertCircle className={`${base} text-red-600`} />;
    case "story":
      return <BookOpen className={`${base} text-green-600`} />;
    case "epic":
      return <Diamond className={`${base} text-purple-600`} />;
    case "subtask":
      return <CheckSquare className={`${base} text-blue-600`} />;
    case "event":
      return <CalendarDays className={`${base} text-gray-600`} />;
    default:
      return <CheckSquare className={`${base} text-blue-600`} />;
  }
}

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
  onCreateTicket,
  onUnselectCalendar,
}: TicketsSidebarProps) {
  const ticketsListRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>("unscheduled");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newTicketTitle, setNewTicketTitle] = React.useState("");
  const [isCreatingTicket, setIsCreatingTicket] = React.useState(false);
  const [newTicketType, setNewTicketType] = React.useState<TicketType>("task");
  const [newTicketProjectKey, setNewTicketProjectKey] = React.useState<string | undefined>(selectedProjectKey);
  const [newTicketScheduledDate, setNewTicketScheduledDate] = React.useState<string | null>(null);
  const [showCalendarPicker, setShowCalendarPicker] = React.useState(false);
  const [calendarPickerPosition, setCalendarPickerPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
    setNewTicketTitle("");
    setNewTicketType("task");
    setNewTicketScheduledDate(null);
    setShowCalendarPicker(false);
    setNewTicketProjectKey(selectedProjectKey ?? projects[0]?.project_key);
    setIsCreateModalOpen(true);
    onUnselectCalendar?.();
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewTicketTitle("");
    setNewTicketType("task");
    setNewTicketScheduledDate(null);
    setShowCalendarPicker(false);
  };

  const handleCreateTicketClick = async () => {
    if (!onCreateTicket || !newTicketTitle.trim()) return;

    const projectKey = newTicketProjectKey ?? selectedProjectKey;
    if (!projectKey) return;

    const project = projects.find((p) => p.project_key === projectKey);
    if (!project) {
      console.error("Selected project not found for ticket creation", selectedProjectKey);
      return;
    }

    try {
      setIsCreatingTicket(true);
      const created = await createTicket(
        {
          title: newTicketTitle.trim(),
          projectNotionId: project.notion_id,
          internalProjectId: project.project_id,
          type: newTicketType,
          scheduledDate: newTicketScheduledDate ?? undefined,
        },
        undefined,
      );

      onCreateTicket(created, project.project_key);
      setIsCreateModalOpen(false);
      setNewTicketTitle("");
      setNewTicketType("task");
      setNewTicketScheduledDate(null);
      onUnselectCalendar?.();
    } catch (error) {
      console.error("Failed to create ticket", error);
      // Simple fallback UX for now
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsCreatingTicket(false);
    }
  };

  // Filter tickets based on active tab
  const filteredTickets = React.useMemo(() => {
    // Normalize helper for ticket type
    const getType = (t: Ticket) => (t.ticket_type ? t.ticket_type.toLowerCase() : "");

    // Never show epic-type tickets in the sidebar lists
    const visibleTickets = currentTickets.filter((t) => getType(t) !== "epic");

    const statusRank: Record<string, number> = {
      "In Progress": 0,
      "In Review": 1,
      Ongoing: 2,
      Blocked: 3,
      Todo: 4,
      Backlog: 5,
      Done: 6,
      Removed: 7,
    };

    const sortTickets = (list: Ticket[]) => {
      return [...list].sort((a, b) => {
        const rankA = statusRank[a.ticket_status] ?? 999;
        const rankB = statusRank[b.ticket_status] ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return a.ticket_key.localeCompare(b.ticket_key);
      });
    };

    if (activeTab === "today") {
      // Use selectedDay when provided; otherwise default to today
      const day = selectedDay ? new Date(selectedDay) : new Date();
      day.setHours(0, 0, 0, 0);

      // Determine which tickets have calendar events on this day
      let eventTicketIdsForDay: Set<string> | undefined;
      if (events && events.length > 0) {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

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
      }

      const todayTickets = visibleTickets.filter((t) => {
        const status = t.ticket_status;
        const statusLower = status.toLowerCase();
        const isDone = statusLower === "done";

        // Exclude removed / backlog / blocked tickets from today view
        if (["removed", "backlog", "blocked"].includes(statusLower)) return false;

        // Event-type tickets: only show when there is a calendar event on this day
        if (getType(t) === "event") {
          if (!eventTicketIdsForDay) return false;
          return eventTicketIdsForDay.has(t.ticket_id);
        }

        if (!t.scheduled_date) return false;

        const scheduledDate = new Date(t.scheduled_date);
        scheduledDate.setHours(0, 0, 0, 0);

        if (isDone) {
          // Done tickets: only show on their exact scheduled date
          return scheduledDate.getTime() === day.getTime();
        }

        // Non-done tickets: show when scheduled for selected day or earlier
        return scheduledDate <= day;
      });

      return sortTickets(todayTickets);
    } else if (activeTab === "unscheduled") {
      // Show non-event tickets with no scheduled_date and not in backlog/blocked/done/removed
      return sortTickets(
        visibleTickets.filter((t) => getType(t) !== "event" && !t.scheduled_date && !["Backlog", "Blocked", "Done", "Removed"].includes(t.ticket_status)),
      );
    } else {
      // backlog - show non-event tickets with backlog or blocked status (excluding done/removed)
      return sortTickets(
        visibleTickets.filter(
          (t) => getType(t) !== "event" && ["Backlog", "Blocked"].includes(t.ticket_status) && !["Done", "Removed"].includes(t.ticket_status),
        ),
      );
    }
  }, [currentTickets, activeTab, selectedDay, events]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 space-y-3 px-4 pb-4 sm:pt-4">
        <div className="flex items-center gap-2">
          <Feather className="h-5 w-5 text-violet-800" />
          <h3 className="text-lg font-semibold text-violet-950">Project Tickets</h3>
        </div>
        {selectedDay && (
          <div className="text-sm text-gray-600">
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
            className="w-full appearance-none truncate rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          {/* Create ticket button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-600 transition-colors hover:bg-green-100"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Tab buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("today")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                activeTab === "today" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              )}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("unscheduled")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                activeTab === "unscheduled" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              )}
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("backlog")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                activeTab === "backlog" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
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
            <div className="p-4 text-center text-sm text-gray-500">{!selectedProjectKey ? "Select a project" : "No tickets available"}</div>
          ) : (
            filteredTickets.map((ticket) => {
              const isDone = ticket.ticket_status?.toLowerCase() === "done";
              const isEventToday = activeTab === "today" && ticket.ticket_type?.toLowerCase() === "event";
              return (
                <Card
                  key={ticket.ticket_id}
                  className={cn(
                    "rounded-lg border p-3",
                    !isEventToday && "draggable-ticket cursor-grab active:cursor-grabbing",
                    "touch-manipulation",
                    isEventToday
                      ? "border-gray-200 bg-gray-50 shadow-none" // Flat, non-draggable look for event tickets
                      : isDone
                        ? "border-gray-100 bg-gray-50 opacity-75 shadow-sm"
                        : "border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md",
                  )}
                  data-ticket-id={isEventToday ? undefined : ticket.ticket_id}
                  data-title={isEventToday ? undefined : ticket.title}
                  data-project-id={isEventToday ? undefined : ticket.project_id}
                  onClick={() => onTicketClick(ticket)}
                  style={{
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                    transform: "translateZ(0)",
                  }}
                >
                  {/* Ticket header: type icon + key + status pill */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{ticketTypeIcon(ticket.ticket_type, isDone)}</span>
                      <span className={cn("text-xs font-medium", isDone ? "text-gray-500" : "text-gray-600")}>{ticket.ticket_key}</span>
                    </div>
                    {!isEventToday && (
                      <Badge className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusPillClasses(ticket.ticket_status))}>
                        {ticket.ticket_status}
                      </Badge>
                    )}
                  </div>

                  {/* Ticket title */}
                  <p className={cn("mb-2 line-clamp-2 text-sm font-medium leading-tight", isDone ? "text-gray-500 line-through" : "text-gray-900")}>
                    {ticket.title}
                  </p>

                  {/* Epic + scheduled date and schedule controls row (matches legacy layout) */}
                  <div className="flex items-center justify-between">
                    {/* Epic on the left */}
                    <div className="flex min-w-0 flex-shrink items-center gap-2">
                      {ticket.epic && (
                        <>
                          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                            <Diamond className={cn("h-3 w-3", isDone ? "text-gray-400" : "text-purple-600")} />
                          </span>
                          <span className={cn("truncate text-xs", isDone ? "text-gray-400" : "text-gray-600")}>{ticket.epic}</span>
                        </>
                      )}
                    </div>

                    {/* Scheduled date + schedule/unschedule on the right */}
                    <div className="flex items-center gap-2">
                      {!isEventToday && (
                        <>
                          {ticket.scheduled_date && !isDone && (
                            <span className="flex-shrink-0 text-xs text-violet-600">
                              {new Date(ticket.scheduled_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}

                          {!isDone && ticket.scheduled_date && onUnscheduleTicket && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onUnscheduleTicket(ticket.ticket_id);
                              }}
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-orange-50 text-orange-600 transition-colors hover:bg-orange-100"
                            >
                              <CalendarMinus className="h-3 w-3" />
                            </button>
                          )}

                          {!isDone && onScheduleTicket && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
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

                                setTicketSchedulePicker({ ticketId: ticket.ticket_id, x, y });
                              }}
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
                            >
                              <CalendarPlus className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateModalOpen} onOpenChange={(open) => (open ? setIsCreateModalOpen(true) : handleCloseCreateModal())}>
        <DialogContent
          className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:max-w-lg sm:p-8"
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">Ticket Title</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <input
                type="text"
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleCreateTicketClick();
                  }
                }}
                placeholder="Enter ticket title..."
                autoFocus
                className="w-full rounded-xl border border-violet-400 px-3 py-2 text-sm shadow-[0_0_0_1px_rgba(129,140,248,0.4)] focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-gray-700">
              {/* Project dropdown */}
              <div className="flex items-center gap-1.5">
                <Feather className="h-3.5 w-3.5 text-gray-500" />
                <div className="relative">
                  <select
                    value={newTicketProjectKey}
                    onChange={(e) => setNewTicketProjectKey(e.target.value)}
                    className="w-[160px] cursor-pointer appearance-none rounded-full border border-gray-300 bg-white px-3 py-1 pr-7 text-[11px] font-medium text-gray-800 shadow-sm outline-none hover:border-gray-400 hover:bg-gray-50 sm:w-[220px]"
                  >
                    {projects.map((project) => (
                      <option key={project.project_key} value={project.project_key}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Type + calendar controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <select
                      value={newTicketType}
                      onChange={(e) => setNewTicketType(e.target.value as TicketType)}
                      className="w-[90px] cursor-pointer appearance-none rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 pr-6 text-center text-[11px] font-medium text-violet-700 outline-none hover:bg-violet-100"
                    >
                      <option value="task">Task</option>
                      <option value="story">Story</option>
                      <option value="bug">Bug</option>
                      <option value="event">Event</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-violet-500" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {newTicketScheduledDate && newTicketType !== "event" && (
                    <button
                      type="button"
                      onClick={() => setNewTicketScheduledDate(null)}
                      className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-900"
                    >
                      <span>
                        {new Date(newTicketScheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-gray-400">×</span>
                    </button>
                  )}

                  {newTicketType !== "event" && (
                    <button
                      type="button"
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
                      className={cn(
                        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-violet-100 text-violet-600 shadow-sm",
                        showCalendarPicker || newTicketScheduledDate ? "bg-violet-50" : "bg-white hover:bg-violet-50",
                      )}
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Button
                className="mb-4 h-11 w-full cursor-pointer justify-center rounded-xl bg-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-200"
                disabled={isCreatingTicket || !newTicketTitle.trim()}
                onClick={handleCreateTicketClick}
              >
                {isCreatingTicket ? "Creating..." : "Create Ticket"}
              </Button>

              <div className="flex items-center justify-center gap-3 pb-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <span className="h-px w-10 bg-gray-200 sm:w-16" />
                <span>or</span>
                <span className="h-px w-10 bg-gray-200 sm:w-16" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full justify-center rounded-xl border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                // TODO: Implement create-from-image flow
                disabled
              >
                Create from Image
              </Button>
            </div>
          </div>
        </DialogContent>
        {showCalendarPicker && newTicketType !== "event" && (
          <DialogPortal>
            <div
              className="fixed"
              style={{ left: `${calendarPickerPosition.x}px`, top: `${calendarPickerPosition.y}px`, zIndex: 60, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarCard
                initialDate={newTicketScheduledDate ? new Date(newTicketScheduledDate) : new Date()}
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
          </DialogPortal>
        )}
      </Dialog>

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

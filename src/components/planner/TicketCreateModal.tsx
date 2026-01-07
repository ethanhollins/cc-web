"use client";

import React from "react";
import { CalendarDays, ChevronDown, Feather } from "lucide-react";
import { createTicket } from "@/api/tickets";
import { CalendarCard } from "@/components/calendar/CalendarCard";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import type { Ticket, TicketType } from "@/types/ticket";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogPortal, DialogTitle } from "@/ui/dialog";
import { toTimezone } from "@/utils/date-utils";

interface TicketCreateModalProps {
  open: boolean;
  projects: Project[];
  selectedProjectKey?: string;
  initialDateRange?: { startDate: Date; endDate: Date } | null;
  onClose: () => void;
  onCreateTicket?: (ticket: Ticket, projectKey: string) => void;
}

export function TicketCreateModal({ open, projects, selectedProjectKey, initialDateRange, onClose, onCreateTicket }: TicketCreateModalProps) {
  const [newTicketTitle, setNewTicketTitle] = React.useState("");
  const [isCreatingTicket, setIsCreatingTicket] = React.useState(false);
  const [newTicketType, setNewTicketType] = React.useState<TicketType>("task");
  const [newTicketProjectKey, setNewTicketProjectKey] = React.useState<string | undefined>(selectedProjectKey);
  const [newTicketScheduledDate, setNewTicketScheduledDate] = React.useState<string | null>(null);
  const [newEventDateRange, setNewEventDateRange] = React.useState<{ startDate: Date; endDate: Date } | null>(null);
  const [showCalendarPicker, setShowCalendarPicker] = React.useState(false);
  const [calendarPickerPosition, setCalendarPickerPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset / initialize state when modal opens
  React.useEffect(() => {
    if (!open) return;
    setNewTicketTitle("");
    setNewTicketType(initialDateRange ? "event" : "task");
    setNewTicketScheduledDate(null);
    setNewEventDateRange(initialDateRange || null);
    setShowCalendarPicker(false);
    setNewTicketProjectKey(selectedProjectKey ?? projects[0]?.project_key);
  }, [open, selectedProjectKey, projects, initialDateRange]);

  const handleClose = () => {
    setShowCalendarPicker(false);
    onClose();
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
          // If we have event date range (from calendar), use start/end dates
          ...(newEventDateRange && {
            startDate: toTimezone(newEventDateRange.startDate),
            endDate: toTimezone(newEventDateRange.endDate),
          }),
          // Only use scheduled_date if there's no event date range (manually scheduled)
          ...(!newEventDateRange && newTicketScheduledDate && { scheduledDate: newTicketScheduledDate }),
        },
        undefined,
      );

      onCreateTicket(created, project.project_key);
      setNewTicketTitle("");
      setNewTicketType("task");
      setNewTicketScheduledDate(null);
      setNewEventDateRange(null);
      setShowCalendarPicker(false);
      handleClose();
    } catch (error) {
      console.error("Failed to create ticket", error);
      // Simple fallback UX for now
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsCreatingTicket(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : handleClose())}>
      <DialogContent
        className="max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-xl sm:max-w-lg sm:p-8"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-[var(--text)]">Ticket Title</DialogTitle>
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
              className="w-full rounded-xl border border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] shadow-[0_0_0_1px_var(--accent-soft)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
          </div>

          <div className="space-y-2">
            {/* First row: Project and Type selectors */}
            <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
              {/* Project dropdown */}
              <div className="flex items-center gap-1.5">
                <Feather className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <div className="relative">
                  <select
                    value={newTicketProjectKey}
                    onChange={(e) => setNewTicketProjectKey(e.target.value)}
                    className="w-[160px] cursor-pointer appearance-none rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1 pr-7 text-[11px] font-medium text-[var(--text)] shadow-sm outline-none hover:border-[var(--accent-soft)] hover:bg-[var(--accent-subtle)] sm:w-[220px]"
                  >
                    {projects.map((project) => (
                      <option key={project.project_key} value={project.project_key}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
              </div>

              {/* Type selector + calendar picker */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={newTicketType}
                    onChange={(e) => setNewTicketType(e.target.value as TicketType)}
                    className="w-[90px] cursor-pointer appearance-none rounded-full border border-[var(--accent-soft)] bg-[var(--accent-subtle)] px-2 py-0.5 pr-6 text-center text-[11px] font-medium text-[var(--accent)] outline-none hover:bg-[var(--accent-soft)]"
                  >
                    <option value="task">Task</option>
                    <option value="story">Story</option>
                    <option value="bug">Bug</option>
                    <option value="event">Event</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--accent)]" />
                </div>

                {newTicketType !== "event" && !newEventDateRange && !newTicketScheduledDate && (
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
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--accent-soft)] text-[var(--accent)] shadow-sm",
                      showCalendarPicker || newTicketScheduledDate ? "bg-[var(--accent-soft)]" : "bg-[var(--surface)] hover:bg-[var(--accent-subtle)]",
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Second row: Date/Time display on the right */}
            {(newEventDateRange || (newTicketScheduledDate && newTicketType !== "event")) && (
              <div className="flex justify-end">
                {newEventDateRange && (
                  <button
                    type="button"
                    onClick={() => setNewEventDateRange(null)}
                    className="hover:text-[var(--accent)]/90 flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
                  >
                    <span>
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
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">×</span>
                  </button>
                )}

                {newTicketScheduledDate && newTicketType !== "event" && !newEventDateRange && (
                  <button
                    type="button"
                    onClick={() => setNewTicketScheduledDate(null)}
                    className="hover:text-[var(--accent)]/90 flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
                  >
                    <span>
                      {new Date(newTicketScheduledDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">×</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pt-1">
            <Button
              className="hover:bg-[var(--accent)]/90 mb-4 h-11 w-full cursor-pointer justify-center rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--text-on-accent)]"
              disabled={isCreatingTicket || !newTicketTitle.trim()}
              onClick={handleCreateTicketClick}
            >
              {isCreatingTicket ? "Creating..." : "Create Ticket"}
            </Button>

            <div className="flex items-center justify-center gap-3 pb-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
              <span className="h-px w-10 bg-[var(--border-subtle)] sm:w-16" />
              <span>or</span>
              <span className="h-px w-10 bg-[var(--border-subtle)] sm:w-16" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-center rounded-xl border-[var(--border-subtle)] text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--accent-subtle)]"
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
  );
}

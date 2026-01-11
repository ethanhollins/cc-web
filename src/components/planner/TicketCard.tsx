"use client";

import React from "react";
import { AlertCircle, BookOpen, CalendarDays, CalendarMinus, CalendarPlus, Check, CheckSquare, Diamond, Video } from "lucide-react";
import { useEpicName } from "@/hooks/useEpics";
import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus, TicketType } from "@/types/ticket";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";
import { getAnchoredPopoverPosition } from "@/utils/calendar-popover-position";
import { statusPillClasses } from "@/utils/ticket-status-utils";
import { StatusSelect } from "./StatusSelect";

interface TicketCardProps {
  ticket: Ticket;
  tickets: Ticket[];
  isDone: boolean;
  isEventToday: boolean;
  onTicketClick: (ticket: Ticket) => void;
  onUnscheduleTicket?: (ticketId: string) => void;
  onOpenSchedulePicker?: (ticketId: string, position: { x: number; y: number }) => void;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  eventTimeRange?: string | null;
}

function ticketTypeIcon(type: TicketType, isDone: boolean) {
  const base = "h-3 w-3";
  if (isDone) return <Check className={`${base} text-[var(--success)]`} />;

  switch (type.toLowerCase()) {
    case "bug":
      return <AlertCircle className={`${base} text-[var(--danger)]`} />;
    case "story":
      return <BookOpen className={`${base} text-[var(--success)]`} />;
    case "epic":
      return <Diamond className={`${base} text-[var(--accent)]`} />;
    case "subtask":
      return <CheckSquare className={`${base} text-[var(--accent)]`} />;
    case "event":
      return <CalendarDays className={`${base} text-[var(--text-muted)]`} />;
    default:
      return <CheckSquare className={`${base} text-[var(--accent)]`} />;
  }
}

function ticketTypeStripClasses(type: TicketType, isDone: boolean) {
  if (isDone) return "bg-[var(--surface-muted)] text-[var(--text-muted)]";

  switch (type.toLowerCase()) {
    case "bug":
      return "bg-red-50 dark:bg-red-950/30 text-[var(--danger)]";
    case "story":
      return "bg-green-50 dark:bg-green-950/30 text-[var(--success)]";
    case "epic":
      return "bg-[var(--accent-subtle)] text-[var(--accent)]";
    case "subtask":
      return "bg-[var(--accent-subtle)] text-[var(--accent)]";
    case "event":
      return "bg-[var(--surface-muted)] text-[var(--text-muted)]";
    default:
      return "bg-[var(--accent-subtle)] text-[var(--accent)]";
  }
}

function meetingPlatformLabel(platform?: Ticket["meeting_platform"]): string {
  switch (platform) {
    case "google_meet":
      return "Meet";
    case "zoom":
      return "Zoom";
    case "teams":
      return "Teams";
    case "other":
      return "Call";
    default:
      return "Call";
  }
}

export function TicketCard({
  ticket,
  tickets,
  isDone,
  isEventToday,
  onTicketClick,
  onUnscheduleTicket,
  onOpenSchedulePicker,
  onStatusChange,
  eventTimeRange,
}: TicketCardProps) {
  const isEventTicket = ticket.ticket_type.toLowerCase() === "event";
  const codeLength = ticket.ticket_key.length;
  const codeTranslateY = codeLength * 7.3; // px offset to keep different lengths visually balanced
  const epicName = useEpicName(ticket, tickets);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (onStatusChange) {
      onStatusChange(ticket.ticket_id, newStatus);
    }
  };

  return (
    <Card
      key={ticket.ticket_id}
      className={cn(
        "relative rounded-xl border p-0",
        isEventTicket ? "min-h-[64px]" : "min-h-[80px]",
        !isEventToday && "draggable-ticket cursor-grab active:cursor-grabbing",
        "touch-manipulation",
        isEventToday
          ? "border-[var(--border-subtle)] bg-[var(--surface)] shadow-none"
          : isDone
            ? "border-[var(--border-subtle)] bg-[var(--surface)] opacity-75 shadow-sm"
            : "border-[var(--accent-subtle)] bg-[var(--surface-elevated)] shadow-sm hover:border-[var(--accent-soft)] hover:shadow-md",
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
      {/* Subtle ticket watermark */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-4 text-5xl opacity-[0.04]">
        🎟️
      </span>
      <div className="flex h-full items-stretch">
        {/* Left shaded strip with vertical icon + key */}
        <div
          className={cn(
            "relative flex w-11 flex-col items-center justify-start overflow-hidden rounded-l-xl py-2 text-[9px] font-semibold uppercase tracking-[0.18em]",
            ticketTypeStripClasses(ticket.ticket_type, isDone),
          )}
        >
          {/* Icon row */}
          <span className="flex h-5 w-5 items-center justify-center">{ticketTypeIcon(ticket.ticket_type, isDone)}</span>

          {/* Rotated ticket code with dynamic translateY based on length */}
          <span
            className="pointer-events-none absolute whitespace-nowrap font-mono text-[10px] leading-none tracking-[0.25em]"
            style={{ transform: `translate(0, ${codeTranslateY}px) rotate(90deg)` }}
          >
            {ticket.ticket_key}
          </span>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col p-3">
          {/* Epic + status / meeting row */}
          <div className="mb-2 flex items-start justify-between">
            <div className="flex min-h-4 min-w-0 flex-shrink items-center gap-2">
              {epicName && (
                <>
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                    <Diamond className={cn("h-3 w-3", isDone ? "text-[var(--text-muted)]" : "text-[var(--accent)]")} />
                  </span>
                  <span className={cn("truncate text-xs", isDone ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]")}>{epicName}</span>
                </>
              )}
            </div>

            {isEventTicket && ticket.meeting_url ? (
              <div className="flex items-center gap-1 rounded-full px-1.5 py-1 text-[11px] font-medium text-[var(--accent-meeting)]">
                <Video className="h-3.5 w-3.5 text-[var(--accent-meeting)]" />
                <span>{meetingPlatformLabel(ticket.meeting_platform)}</span>
              </div>
            ) : (
              !isEventToday &&
              (onStatusChange ? (
                <StatusSelect status={ticket.ticket_status} onStatusChange={handleStatusChange} />
              ) : (
                <Badge className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusPillClasses(ticket.ticket_status))}>{ticket.ticket_status}</Badge>
              ))
            )}
          </div>

          {/* Ticket title */}
          <p className={cn("mb-2 line-clamp-2 text-sm font-medium leading-tight", isDone ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]")}>
            {ticket.title}
          </p>

          {/* Tear line */}
          <div className="mb-2 border-t border-dashed border-[var(--accent-soft)]" />

          {/* Bottom row: event time range or schedule controls */}
          <div className="mt-auto flex items-center justify-end gap-2">
            {isEventToday && eventTimeRange ? (
              <span className="text-xs font-medium text-[var(--accent)]">{eventTimeRange}</span>
            ) : !isEventToday && !isDone && (ticket.scheduled_date || onOpenSchedulePicker) ? (
              <>
                {ticket.scheduled_date && (
                  <span className="flex-shrink-0 text-xs text-[var(--accent)]">
                    {new Date(ticket.scheduled_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}

                {ticket.scheduled_date && onUnscheduleTicket && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUnscheduleTicket(ticket.ticket_id);
                    }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--danger)] bg-[var(--surface)] text-[var(--danger)] transition-colors hover:bg-[var(--accent-subtle)]"
                  >
                    <CalendarMinus className="h-3 w-3" />
                  </button>
                )}

                {onOpenSchedulePicker && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                      const { x, y } = getAnchoredPopoverPosition(rect, 288, 320);

                      onOpenSchedulePicker(ticket.ticket_id, { x, y });
                    }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)]"
                  >
                    <CalendarPlus className="h-3 w-3" />
                  </button>
                )}
              </>
            ) : (
              // Add spacing when bottom section is empty to match height of other tickets
              <div className="h-4" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

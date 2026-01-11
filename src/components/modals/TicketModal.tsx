"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Video } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTicketContent, useTicketData, useTicketDocuments } from "@/hooks/useTicketData";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket } from "@/types/ticket";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";

interface LoadingSkeletonProps {
  className?: string;
  height?: string;
}

function LoadingSkeleton({ className = "", height = "h-4" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded bg-gray-200 ${height} ${className}`} />;
}

function DescriptionContentSkeleton() {
  return (
    <div className="space-y-2">
      <LoadingSkeleton className="w-full" />
      <LoadingSkeleton className="w-11/12" />
      <LoadingSkeleton className="w-4/5" />
      <LoadingSkeleton className="w-full" />
      <LoadingSkeleton className="w-3/4" />
    </div>
  );
}

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string | null;
  eventId: string | null;
  events: CalendarEvent[];
  onEventUpdate?: (updater: (prevEvents: CalendarEvent[]) => CalendarEvent[]) => void;
  projects: Project[];
  ticket?: Ticket | null;
}

// Map ticket type to badge styles (aligned with old modal)
function getTicketTypeClasses(type: string | undefined) {
  const t = (type ?? "task").toLowerCase();
  const map: Record<string, string> = {
    task: "bg-blue-100 text-blue-600",
    story: "bg-emerald-100 text-emerald-700",
    bug: "bg-rose-100 text-rose-600",
    epic: "bg-purple-100 text-purple-600",
    subtask: "bg-blue-100 text-blue-600",
  };
  return map[t] ?? "bg-gray-100 text-gray-700";
}

// Map ticket status to pill styles (aligned with old modal)
function getStatusClasses(status: string | undefined) {
  const s = status ?? "Unknown";
  const map: Record<string, string> = {
    Backlog: "bg-gray-100 text-gray-700",
    Todo: "bg-gray-200 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-600",
    "In Review": "bg-indigo-50 text-indigo-700",
    Blocked: "bg-amber-50 text-amber-700",
    Ongoing: "bg-pink-50 text-pink-700",
    Done: "bg-emerald-50 text-emerald-700",
    Removed: "bg-rose-50 text-rose-700",
    Unknown: "bg-gray-100 text-gray-800",
  };
  return map[s] ?? map.Unknown;
}

// Meeting block (simplified port of old MeetingUI)
function MeetingUI({ event }: { event: CalendarEvent | null }) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!event || !event.meeting_url) {
    return null;
  }

  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60_000);

  const msUntil = start.getTime() - now.getTime();
  const isOver = now.getTime() > end.getTime();
  const isOngoing = now >= start && now <= end;

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (hours >= 1) parts.push(`${hours}h`);
    if (minutes >= 1) parts.push(`${minutes}m`);
    if (seconds >= 1 || parts.length === 0) parts.push(String(seconds).padStart(2, "0") + "s");

    return parts.join(" ");
  };

  const countdown = formatDuration(Math.max(0, msUntil));

  const timeLabel = start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const durLabel = (() => {
    if (durationMinutes >= 60) {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `(${hours} hour${hours !== 1 ? "s" : ""}${minutes > 0 ? ` ${minutes}m` : ""})`;
    }
    return `(${durationMinutes}m)`;
  })();

  const disableJoin = msUntil > 5 * 60_000; // disable if more than 5 minutes away

  const locationLabel =
    event.meeting_platform === "google_meet"
      ? "Google Meet"
      : event.meeting_platform === "zoom"
        ? "Zoom"
        : event.meeting_platform === "teams"
          ? "Teams"
          : event.meeting_platform || "Meeting";

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Video className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-semibold text-gray-900">Meeting</span>
      </div>

      {/* Meeting Info */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          <span>{timeLabel}</span>
          <span className="text-gray-400">{durLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="h-3 w-3" />
          <span>{locationLabel}</span>
        </div>
      </div>

      {/* Status and Countdown */}
      <div className="mb-3 rounded-md bg-gray-50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">{isOver ? "Ended" : isOngoing ? "Started" : "Starts in"}</span>
          <span className="font-semibold text-gray-900">{isOver ? "—" : isOngoing ? "Now" : countdown}</span>
        </div>
      </div>

      {/* Join Button */}
      {disableJoin || isOver ? (
        <span
          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-400"
          aria-disabled
        >
          <Video className="h-4 w-4" />
          {isOver ? "Meeting Ended" : "Join Meeting"}
        </span>
      ) : (
        <a
          href={event.meeting_url || "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Video className="h-4 w-4" />
          Join Meeting
        </a>
      )}
    </div>
  );
}

/**
 * Modal for viewing ticket/event details (ported from old implementation, using shadcn Dialog)
 */
export function TicketModal({ open, onClose, ticketId, eventId, events, projects, ticket }: TicketModalProps) {
  const activeTicketId = ticket?.ticket_id ?? ticketId;

  const { data: ticketData, loading: _ticketLoading, error: _ticketError } = useTicketData(open ? (activeTicketId ?? null) : null);
  const { content: ticketContent, loading: contentLoading, error: contentError } = useTicketContent(open ? (activeTicketId ?? null) : null);
  const { documents: ticketDocuments, loading: _documentsLoading, error: _documentsError } = useTicketDocuments(open ? (activeTicketId ?? null) : null);
  const currentEvent = useMemo(() => {
    if (!events.length) return null;
    if (eventId) {
      return events.find((e) => e.google_id === eventId) ?? null;
    }
    if (ticketId) {
      return events.find((e) => e.ticket_id === ticketId) ?? null;
    }
    return null;
  }, [events, eventId, ticketId]);

  // Use event when available, otherwise fall back to the ticket passed from the sidebar
  const baseTicket: (CalendarEvent | Ticket) | null = useMemo(() => {
    if (currentEvent) return currentEvent;
    if (ticket) return ticket;
    return null;
  }, [currentEvent, ticket]);

  const typeClasses = getTicketTypeClasses(baseTicket?.ticket_type);
  const statusClasses = getStatusClasses(baseTicket?.ticket_status);

  const projectForTicket = useMemo(() => {
    if (!baseTicket) return null;
    if (baseTicket.project) return baseTicket.project;
    if (baseTicket.project_id) {
      return projects.find((p) => p.project_id === baseTicket.project_id) ?? null;
    }
    return null;
  }, [baseTicket, projects]);

  const assigneeInitials = (name?: string) =>
    (name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="h-[100svh] max-h-[100svh] w-full max-w-[100vw] overflow-hidden border border-gray-200 bg-white p-0 sm:h-auto sm:max-h-[92vh] sm:max-w-[920px]">
        <div className="flex h-full flex-col md:flex-row">
          {/* Left: main ticket content */}
          <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {baseTicket?.ticket_type && (
                <span className={`inline-flex h-6 items-center justify-center rounded-md px-2 text-xs font-semibold ${typeClasses}`}>
                  {baseTicket.ticket_type}
                </span>
              )}
              {baseTicket?.ticket_key && (
                <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 px-2 text-xs font-semibold text-gray-700">
                  {baseTicket.ticket_key}
                </span>
              )}
            </div>

            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-semibold text-gray-900">{baseTicket?.title ?? "Ticket"}</DialogTitle>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-600">Description</h4>
              {contentLoading ? (
                <DescriptionContentSkeleton />
              ) : contentError ? (
                <p className="text-sm text-red-600">Error loading description: {contentError}</p>
              ) : ticketContent ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{ticketContent}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No description</p>
              )}
            </div>

            {/* Subtasks - will be handled separately, hidden for now */}
            {ticketData && ticketData.subtasks && ticketData.subtasks.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-600">Subtasks</h4>
                <ul className="space-y-2">
                  {ticketData.subtasks.map((subtask, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <span className="truncate font-medium text-gray-900">{subtask}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Linked tickets - will be handled separately, hidden for now */}
            {ticketData && ticketData.linked_tickets && ticketData.linked_tickets.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-600">Linked tickets</h4>
                <ul className="space-y-2">
                  {ticketData.linked_tickets.map((linked, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <span className="truncate font-medium text-gray-900">{linked}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related documents - will be handled separately, hidden for now */}
            {ticketDocuments && (ticketDocuments.project.length > 0 || ticketDocuments.epic.length > 0 || ticketDocuments.ticket.length > 0) && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-600">Related documents</h4>
                <div className="space-y-2">
                  {ticketDocuments.project.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-600">Project</p>
                      <ul className="space-y-1">
                        {ticketDocuments.project.map((doc, index) => (
                          <li key={index}>
                            <a href={doc.notion_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-700 hover:underline">
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ticketDocuments.epic.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-600">Epic</p>
                      <ul className="space-y-1">
                        {ticketDocuments.epic.map((doc, index) => (
                          <li key={index}>
                            <a href={doc.notion_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-700 hover:underline">
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ticketDocuments.ticket.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-600">Ticket</p>
                      <ul className="space-y-1">
                        {ticketDocuments.ticket.map((doc, index) => (
                          <li key={index}>
                            <a href={doc.notion_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-700 hover:underline">
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar (stacked below on mobile) */}
          <aside className="flex w-full flex-shrink-0 flex-col border-t border-gray-100 bg-gray-50 p-4 md:w-80 md:border-l md:border-t-0 md:pb-4 md:pt-4">
            {/* Status pill */}
            <div className="mb-4 flex items-start">
              <div
                role="status"
                aria-label={`Status: ${baseTicket?.ticket_status ?? "Unknown"}`}
                className={`inline-flex max-w-[180px] items-center justify-center rounded-md px-3 py-1 text-sm font-semibold ${statusClasses}`}
              >
                {baseTicket?.ticket_status ?? "Unknown"}
              </div>
            </div>

            {/* Assignee / project / epic / priority block */}
            <div className="mb-4 min-w-0 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                  {assigneeInitials(baseTicket?.assignee ?? projectForTicket?.title)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{baseTicket?.assignee ?? projectForTicket?.title ?? "Unassigned"}</div>
                  <div className="text-xs text-gray-500">Assignee</div>
                </div>
              </div>

              <div className="mt-3 flex min-w-0 flex-col gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-gray-500">Project:</span>
                  <span className="min-w-0 truncate font-medium text-gray-900">{projectForTicket?.title ?? "-"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-gray-500">Epic:</span>
                  <span className="min-w-0 truncate font-medium text-gray-900">{baseTicket?.epic ?? "-"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-gray-500">Priority:</span>
                  <span className="min-w-0 truncate font-medium text-gray-900">{baseTicket?.priority ?? "-"}</span>
                </div>
              </div>
            </div>

            {/* Meeting UI (if applicable) */}
            <MeetingUI event={currentEvent} />

            {/* Notes section (UI only, no data yet) */}
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-600">Notes</h4>
                <button className="flex items-center gap-1.5 rounded-md bg-transparent px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  <span className="text-base leading-none">+</span>
                  <span>New Note</span>
                </button>
              </div>
              <div className="text-xs text-gray-400">No notes yet</div>
            </div>

            {/* Go to Notion - hidden for now since notion_url isn't in API response */}
            {baseTicket?.notion_url && (
              <div className="mt-auto">
                <a
                  href={baseTicket.notion_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Go to Notion"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Go to Notion
                </a>
              </div>
            )}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

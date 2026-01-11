"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, FileStack, FileText, Link as LinkIcon, MapPin, Plus, Video } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTicketContent, useTicketData, useTicketDocuments } from "@/hooks/useTicketData";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket } from "@/types/ticket";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { generateColorFromString } from "@/utils/color-utils";

interface LoadingSkeletonProps {
  className?: string;
  height?: string;
}

function LoadingSkeleton({ className = "", height = "h-4" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded bg-[var(--surface-muted)] ${height} ${className}`} />;
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
    task: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    story: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    bug: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    epic: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    subtask: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return map[t] ?? "bg-[var(--surface-muted)] text-[var(--text)]";
}

// Map ticket status to pill styles (aligned with old modal)
function getStatusClasses(status: string | undefined) {
  const s = status ?? "Unknown";
  const map: Record<string, string> = {
    Backlog: "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300",
    Todo: "bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300",
    "In Progress": "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    "In Review": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    Blocked: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    Ongoing: "bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
    Done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Removed: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    Unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-300",
  };
  return map[s] ?? map.Unknown;
}

// Meeting block (simplified port of old MeetingUI)
function MeetingUI({ event }: { event: CalendarEvent | null }) {
  const [now, setNow] = useState<Date>(new Date());
  const { data: ticketData } = useTicketData(event?.ticket_id ?? null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!event || !ticketData?.meeting_url) {
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
    ticketData.meeting_platform === "google_meet"
      ? "Google Meet"
      : ticketData.meeting_platform === "zoom"
        ? "Zoom"
        : ticketData.meeting_platform === "teams"
          ? "Teams"
          : ticketData.meeting_platform || "Meeting";

  return (
    <div className="mb-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Video className="h-4 w-4 text-[var(--accent)]" />
        <span className="text-sm font-semibold text-[var(--text)]">Meeting</span>
      </div>

      {/* Meeting Info */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Clock className="h-3 w-3" />
          <span>{timeLabel}</span>
          <span className="text-[var(--text-muted)] opacity-70">{durLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <MapPin className="h-3 w-3" />
          <span>{locationLabel}</span>
        </div>
      </div>

      {/* Status and Countdown */}
      <div className="mb-3 rounded-md bg-[var(--surface-muted)] p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">{isOver ? "Ended" : isOngoing ? "Started" : "Starts in"}</span>
          <span className="font-semibold text-[var(--text)]">{isOver ? "—" : isOngoing ? "Now" : countdown}</span>
        </div>
      </div>

      {/* Join Button */}
      {disableJoin || isOver ? (
        <span
          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] opacity-50"
          aria-disabled
        >
          <Video className="h-4 w-4" />
          {isOver ? "Meeting Ended" : "Join Meeting"}
        </span>
      ) : (
        <a
          href={ticketData.meeting_url || "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--text-on-accent)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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

  // State for tracking which sections are being added/edited
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isAddingLinkedTicket, setIsAddingLinkedTicket] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);

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
  console.log("Current Event:", currentEvent);

  // Determine if we have any substantial content
  const hasDescription = Boolean(ticketContent && ticketContent.trim().length > 0);
  const hasSubtasks = Boolean(ticketData?.subtasks && ticketData.subtasks.length > 0);
  const hasLinkedTickets = Boolean(ticketData?.linked_tickets && ticketData.linked_tickets.length > 0);
  const hasDocuments = Boolean(ticketDocuments && (ticketDocuments.project.length > 0 || ticketDocuments.epic.length > 0 || ticketDocuments.ticket.length > 0));

  // Compact mode: no description, no linked tickets, no documents, and not in "adding" mode
  const isCompactMode =
    !hasDescription && !hasSubtasks && !hasLinkedTickets && !hasDocuments && !isAddingDescription && !isAddingLinkedTicket && !isAddingDocument;

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

  const assigneeName = baseTicket?.assignee ?? "Ethan Hollins"; // Placeholder for assignee name
  const avatarColor = generateColorFromString(assigneeName);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset "adding" states when modal closes
          setIsAddingDescription(false);
          setIsAddingLinkedTicket(false);
          setIsAddingDocument(false);
          onClose();
        }
      }}
    >
      <DialogContent
        className={`h-[100svh] max-h-[100svh] w-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-0 ${
          isCompactMode ? "max-w-[100vw] sm:h-auto sm:max-h-[92vh] sm:max-w-[420px]" : "max-w-[100vw] sm:h-auto sm:max-h-[92vh] sm:max-w-[920px]"
        } overflow-hidden`}
      >
        {isCompactMode ? (
          // COMPACT MODE: Single column
          <div className="flex h-full flex-col overflow-auto p-6">
            {/* Header row: type/key on left, status on right */}
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {baseTicket?.ticket_type && (
                  <span className={`inline-flex h-6 items-center justify-center rounded-md px-2 text-xs font-semibold ${typeClasses}`}>
                    {baseTicket.ticket_type}
                  </span>
                )}
                {baseTicket?.ticket_key && (
                  <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)]">
                    {baseTicket.ticket_key}
                  </span>
                )}
              </div>
              <div
                role="status"
                aria-label={`Status: ${baseTicket?.ticket_status ?? "Unknown"}`}
                className={`mr-4 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
              >
                {baseTicket?.ticket_status ?? "Unknown"}
              </div>
            </div>

            {/* Title */}
            <DialogTitle className="mb-4 text-xl font-semibold text-[var(--text)]">{baseTicket?.title ?? "Ticket"}</DialogTitle>

            {/* Pill buttons to add content */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setIsAddingDescription(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <Plus className="h-3 w-3" />
                <span>Description</span>
              </button>
              <button
                onClick={() => setIsAddingLinkedTicket(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <Plus className="h-3 w-3" />
                <span>Link Ticket</span>
              </button>
              <button
                onClick={() => setIsAddingDocument(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <Plus className="h-3 w-3" />
                <span>Link Document</span>
              </button>
            </div>

            {/* Assignee / project / epic / priority */}
            <div className="mb-4 min-w-0 text-sm text-[var(--text)]">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {assigneeInitials(assigneeName)}
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{baseTicket?.assignee ?? "Ethan Hollins"}</div>
                  <div className="text-xs text-[var(--text-muted)]">Assignee</div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2 rounded-md bg-[var(--surface-muted)] p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Project:</span>
                  <span className="min-w-0 truncate font-medium text-[var(--text)]">{projectForTicket?.title ?? "-"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Epic:</span>
                  <span className="min-w-0 truncate font-medium text-[var(--text)]">{baseTicket?.epic ?? "-"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Priority:</span>
                  <span className="min-w-0 truncate font-medium text-[var(--text)]">{baseTicket?.priority ?? "-"}</span>
                </div>
              </div>
            </div>

            {/* Meeting UI */}
            <MeetingUI event={currentEvent} />

            {/* Notes section */}
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[var(--text-muted)]">Notes</h4>
                <button className="flex items-center gap-1.5 rounded-md bg-transparent px-2.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:cursor-pointer hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                  <span className="text-base leading-none">+</span>
                  <span>New Note</span>
                </button>
              </div>
              <div className="text-xs text-[var(--text-muted)] opacity-60">No notes yet</div>
            </div>

            {/* Go to Notion */}
            {baseTicket?.notion_url && (
              <div className="mt-auto">
                <a
                  href={baseTicket.notion_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Go to Notion"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-subtle)]"
                >
                  Go to Notion
                </a>
              </div>
            )}
          </div>
        ) : (
          // FULL MODE: Two-column layout
          <div className="flex h-full flex-col md:flex-row">
            {/* Left: main ticket content */}
            <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
                {baseTicket?.ticket_type && (
                  <span className={`inline-flex h-6 items-center justify-center rounded-md px-2 text-xs font-semibold ${typeClasses}`}>
                    {baseTicket.ticket_type}
                  </span>
                )}
                {baseTicket?.ticket_key && (
                  <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)]">
                    {baseTicket.ticket_key}
                  </span>
                )}
              </div>

              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-xl font-semibold text-[var(--text)]">{baseTicket?.title ?? "Ticket"}</DialogTitle>
                </div>
              </div>

              {/* Description */}
              {(hasDescription || isAddingDescription) && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Description</h4>
                    {isAddingDescription && !hasDescription && (
                      <button onClick={() => setIsAddingDescription(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                        Cancel
                      </button>
                    )}
                  </div>
                  {contentLoading ? (
                    <DescriptionContentSkeleton />
                  ) : contentError ? (
                    <p className="text-sm text-[var(--danger)]">Error loading description: {contentError}</p>
                  ) : hasDescription ? (
                    <div className="prose prose-sm max-w-none [&>*]:text-[var(--text)]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{ticketContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-center">
                      <FileText className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)] opacity-50" />
                      <p className="text-sm text-[var(--text-muted)]">Add a description for this ticket</p>
                    </div>
                  )}
                </div>
              )}

              {/* Subtasks */}
              {hasSubtasks && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">Subtasks</h4>
                  <ul className="space-y-2">
                    {ticketData!.subtasks!.map((subtask, index) => (
                      <li key={index} className="flex items-center justify-between rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <span className="truncate font-medium text-[var(--text)]">{subtask}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Linked tickets */}
              {(hasLinkedTickets || isAddingLinkedTicket) && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Linked Tickets</h4>
                    {isAddingLinkedTicket && !hasLinkedTickets && (
                      <button onClick={() => setIsAddingLinkedTicket(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                        Cancel
                      </button>
                    )}
                  </div>
                  {hasLinkedTickets ? (
                    <ul className="space-y-2">
                      {ticketData!.linked_tickets!.map((linked, index) => (
                        <li key={index} className="flex items-center gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm">
                          <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                          <span className="min-w-0 truncate font-medium text-[var(--text)]">{linked}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-center">
                      <LinkIcon className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)] opacity-50" />
                      <p className="text-sm text-[var(--text-muted)]">Add linked tickets</p>
                    </div>
                  )}
                </div>
              )}

              {/* Related documents */}
              {(hasDocuments || isAddingDocument) && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Related Documents</h4>
                    {isAddingDocument && !hasDocuments && (
                      <button onClick={() => setIsAddingDocument(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                        Cancel
                      </button>
                    )}
                  </div>
                  {hasDocuments ? (
                    <div className="space-y-3">
                      {ticketDocuments!.project.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-[var(--text-muted)]">Project</p>
                          <ul className="space-y-1.5">
                            {ticketDocuments!.project.map((doc, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <FileStack className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <a
                                  href={doc.notion_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="truncate text-sm font-medium text-[var(--accent)] hover:underline"
                                >
                                  {doc.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ticketDocuments!.epic.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-[var(--text-muted)]">Epic</p>
                          <ul className="space-y-1.5">
                            {ticketDocuments!.epic.map((doc, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <FileStack className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <a
                                  href={doc.notion_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="truncate text-sm font-medium text-[var(--accent)] hover:underline"
                                >
                                  {doc.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ticketDocuments!.ticket.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-[var(--text-muted)]">Ticket</p>
                          <ul className="space-y-1.5">
                            {ticketDocuments!.ticket.map((doc, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <FileStack className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <a
                                  href={doc.notion_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="truncate text-sm font-medium text-[var(--accent)] hover:underline"
                                >
                                  {doc.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-center">
                      <FileStack className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)] opacity-50" />
                      <p className="text-sm text-[var(--text-muted)]">Add related documents</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            <aside className="flex w-full flex-shrink-0 flex-col border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 md:w-80 md:border-l md:border-t-0 md:pb-4 md:pt-4">
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
              <div className="mb-4 min-w-0 text-sm text-[var(--text)]">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {assigneeInitials(assigneeName)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">{baseTicket?.assignee ?? "Ethan Hollins"}</div>
                    <div className="text-xs text-[var(--text-muted)]">Assignee</div>
                  </div>
                </div>

                <div className="mt-3 flex min-w-0 flex-col gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Project:</span>
                    <span className="min-w-0 truncate font-medium text-[var(--text)]">{projectForTicket?.title ?? "-"}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Epic:</span>
                    <span className="min-w-0 truncate font-medium text-[var(--text)]">{baseTicket?.epic ?? "-"}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Priority:</span>
                    <span className="min-w-0 truncate font-medium text-[var(--text)]">{baseTicket?.priority ?? "-"}</span>
                  </div>
                </div>
              </div>

              {/* Meeting UI (if applicable) */}
              <MeetingUI event={currentEvent} />

              {/* Notes section (UI only, no data yet) */}
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[var(--text-muted)]">Notes</h4>
                  <button className="flex items-center gap-1.5 rounded-md bg-transparent px-2.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:cursor-pointer hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                    <span className="text-base leading-none">+</span>
                    <span>New Note</span>
                  </button>
                </div>
                <div className="text-xs text-[var(--text-muted)] opacity-60">No notes yet</div>
              </div>

              {/* Go to Notion - hidden for now since notion_url isn't in API response */}
              {baseTicket?.notion_url && (
                <div className="mt-auto">
                  <a
                    href={baseTicket.notion_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Go to Notion"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-subtle)]"
                  >
                    Go to Notion
                  </a>
                </div>
              )}
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

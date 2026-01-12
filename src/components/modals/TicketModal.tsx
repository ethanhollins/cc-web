"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, FileStack, FileText, Link as LinkIcon, MapPin, Plus, Trash2, Video, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteTicket, updateTicketDescription, updateTicketTitle } from "@/api/tickets";
import { useTicketContent, useTicketData, useTicketDocuments } from "@/hooks/useTickets";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket, TicketStatus, TicketType } from "@/types/ticket";
import { ConfirmDialog } from "@/ui/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { EditableInput, EditableTextarea } from "@/ui/editable-field";
import { VerticalDotsMenu } from "@/ui/vertical-dots-menu";
import { generateColorFromString } from "@/utils/color-utils";
import { EpicSelect } from "../planner/EpicSelect";
import { PrioritySelect } from "../planner/PrioritySelect";
import { ProjectSelect } from "../planner/ProjectSelect";
import { StatusSelect } from "../planner/StatusSelect";
import { TypeSelect } from "../planner/TypeSelect";

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
  tickets: Ticket[];
  ticket?: Ticket | null;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  onTypeChange?: (ticketId: string, newType: TicketType) => void;
  onProjectChange?: (ticketId: string, newProjectId: string) => void;
  onEpicChange?: (ticketId: string, newEpicId: string) => void;
  onPriorityChange?: (ticketId: string, newPriority: string) => void;
  onTicketDelete?: (ticketId: string) => void;
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
export function TicketModal({
  open,
  onClose,
  ticketId,
  eventId,
  events,
  projects,
  tickets,
  ticket,
  onStatusChange,
  onTypeChange,
  onProjectChange,
  onEpicChange,
  onPriorityChange,
  onTicketDelete,
}: TicketModalProps) {
  const activeTicketId = ticket?.ticket_id ?? ticketId;

  const { data: ticketData, loading: _ticketLoading, error: _ticketError } = useTicketData(open ? (activeTicketId ?? null) : null);
  const {
    content: ticketContent,
    loading: contentLoading,
    error: contentError,
    setContent: setTicketContent,
  } = useTicketContent(open ? (activeTicketId ?? null) : null);
  const { documents: ticketDocuments, loading: _documentsLoading, error: _documentsError } = useTicketDocuments(open ? (activeTicketId ?? null) : null);

  // State for tracking which sections are being added/edited
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isAddingLinkedTicket, setIsAddingLinkedTicket] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Filter tickets to only those from the current ticket's project for epic selection
  const projectTickets = useMemo(() => {
    if (!baseTicket?.project_id) return tickets;
    const filtered = tickets.filter((t) => t.project_id === baseTicket.project_id);
    return filtered;
  }, [tickets, baseTicket]);

  // Determine if we have any substantial content
  const hasDescription = Boolean(ticketContent && ticketContent.trim().length > 0);
  const hasSubtasks = Boolean(ticketData?.subtasks && ticketData.subtasks.length > 0);
  const hasLinkedTickets = Boolean(ticketData?.linked_tickets && ticketData.linked_tickets.length > 0);
  const hasDocuments = Boolean(ticketDocuments && (ticketDocuments.project.length > 0 || ticketDocuments.epic.length > 0 || ticketDocuments.ticket.length > 0));

  // Compact mode: no description, no linked tickets, no documents, and not in "adding" mode
  const isCompactMode =
    !hasDescription && !hasSubtasks && !hasLinkedTickets && !hasDocuments && !isAddingDescription && !isAddingLinkedTicket && !isAddingDocument;

  // Initialize edited description when content loads or when adding description
  useEffect(() => {
    if (ticketContent !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedDescription(ticketContent || "");
    }
  }, [ticketContent]);

  // Initialize edited title when modal opens or baseTicket changes
  useEffect(() => {
    if (baseTicket?.title) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedTitle(baseTicket.title);
    }
  }, [baseTicket?.title]);

  useEffect(() => {
    if (isAddingDescription && !hasDescription) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditingDescription(true);
    }
  }, [isAddingDescription, hasDescription]);

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

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (onStatusChange && activeTicketId) {
      onStatusChange(activeTicketId, newStatus);
    }
  };

  const handleTypeChange = (newType: TicketType) => {
    if (onTypeChange && activeTicketId) {
      onTypeChange(activeTicketId, newType);
    }
  };

  const handleProjectChange = (newProjectId: string) => {
    if (onProjectChange && activeTicketId) {
      const projectId = newProjectId === "none" ? "" : newProjectId;
      onProjectChange(activeTicketId, projectId);
    }
  };

  const handleEpicChange = (newEpicId: string | null) => {
    if (onEpicChange && activeTicketId) {
      const epicId = newEpicId === "none" || !newEpicId ? "" : newEpicId;
      onEpicChange(activeTicketId, epicId);
    }
  };

  const handlePriorityChange = (newPriority: string | null) => {
    if (onPriorityChange && activeTicketId) {
      const priority = newPriority === "none" || !newPriority ? "" : newPriority;
      onPriorityChange(activeTicketId, priority);
    }
  };

  const handleSaveDescription = async () => {
    if (!activeTicketId) return;

    // Store previous content for rollback on error
    const previousContent = ticketContent;

    try {
      // Optimistically update the content
      setTicketContent(editedDescription);

      // Exit editing mode immediately for responsive UI
      setIsEditingDescription(false);
      setIsAddingDescription(false);

      // Make the API call
      await updateTicketDescription(activeTicketId, editedDescription);
    } catch (error) {
      console.error("Error updating description:", error);
      // Rollback to previous content on error
      setTicketContent(previousContent);
      // TODO: Show error toast/notification
    }
  };

  const handleCancelDescription = () => {
    // Revert to original content
    setEditedDescription(ticketContent || "");
    setIsEditingDescription(false);

    // If there's no description, go back to compact mode
    if (!hasDescription) {
      setIsAddingDescription(false);
    }
  };

  const handleDescriptionClick = () => {
    if (hasDescription && !isEditingDescription) {
      setIsEditingDescription(true);
    }
  };

  const handleSaveTitle = async () => {
    if (!activeTicketId || !editedTitle.trim()) return;

    // Store previous title for rollback on error
    const previousTitle = baseTicket?.title;

    try {
      // Exit editing mode immediately for responsive UI
      setIsEditingTitle(false);

      // Make the API call
      await updateTicketTitle(activeTicketId, editedTitle.trim());
    } catch (error) {
      console.error("Error updating title:", error);
      // Rollback to previous title on error
      if (previousTitle) {
        setEditedTitle(previousTitle);
      }
      // TODO: Show error toast/notification
    }
  };

  const handleCancelTitle = () => {
    // Revert to original title
    setEditedTitle(baseTicket?.title || "");
    setIsEditingTitle(false);
  };

  const handleTitleClick = () => {
    if (!isEditingTitle) {
      setIsEditingTitle(true);
    }
  };

  const handleDeleteTicket = async () => {
    if (!activeTicketId) return;

    try {
      await deleteTicket(activeTicketId);
      // Close the modal first
      onClose();
      // Notify parent component to remove from list
      onTicketDelete?.(activeTicketId);
    } catch (error) {
      console.error("Error deleting ticket:", error);
      // TODO: Show error toast/notification
    }
  };

  const menuItems = [
    {
      label: "Permanently Delete",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "danger" as const,
      onClick: () => setShowDeleteConfirm(true),
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset "adding" and "editing" states when modal closes
          setIsAddingDescription(false);
          setIsAddingLinkedTicket(false);
          setIsAddingDocument(false);
          setIsEditingDescription(false);
          setEditedDescription("");
          setIsEditingTitle(false);
          setEditedTitle("");
          onClose();
        }
      }}
    >
      <DialogContent
        className={`h-[100svh] max-h-[100svh] w-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-0 ${
          isCompactMode ? "max-w-[100vw] sm:h-auto sm:max-h-[92vh] sm:max-w-[420px]" : "max-w-[100vw] sm:h-auto sm:max-h-[92vh] sm:max-w-[920px]"
        } overflow-hidden [&>button]:hidden`}
        onInteractOutside={(e) => {
          // Prevent dialog from closing when interacting with select dropdowns
          // which are portaled outside the dialog
          e.preventDefault();
        }}
      >
        {isCompactMode ? (
          // COMPACT MODE: Single column
          <div className="flex h-full flex-col overflow-auto p-6">
            {/* Header row: type/key on left, status on right */}
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {baseTicket?.ticket_type && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <TypeSelect type={baseTicket.ticket_type} onTypeChange={handleTypeChange} disabled={baseTicket.ticket_type?.toLowerCase() === "epic"} />
                  </div>
                )}
                {baseTicket?.ticket_key && (
                  <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)]">
                    {baseTicket.ticket_key}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {baseTicket?.ticket_status && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusSelect status={baseTicket.ticket_status} onStatusChange={handleStatusChange} />
                  </div>
                )}
                <VerticalDotsMenu items={menuItems} />
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            {isEditingTitle ? (
              <div className="mb-4">
                <EditableInput
                  value={editedTitle}
                  onChange={setEditedTitle}
                  onSave={handleSaveTitle}
                  onCancel={handleCancelTitle}
                  placeholder="Enter ticket title..."
                />
              </div>
            ) : (
              <DialogTitle
                onClick={handleTitleClick}
                className="mb-4 cursor-pointer rounded-md p-2 text-xl font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"
              >
                {baseTicket?.title ?? "Ticket"}
              </DialogTitle>
            )}

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
                  <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                    <ProjectSelect projectId={baseTicket?.project_id} projects={projects} onProjectChange={handleProjectChange} />
                  </div>
                </div>
                {baseTicket?.ticket_type?.toLowerCase() !== "epic" && (
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Epic:</span>
                    <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                      <EpicSelect epicId={baseTicket?.epic_id} tickets={tickets} projectId={baseTicket?.project_id} onEpicChange={handleEpicChange} />
                    </div>
                  </div>
                )}
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Priority:</span>
                  <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                    <PrioritySelect priority={baseTicket?.priority} onPriorityChange={handlePriorityChange} />
                  </div>
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
                  <div onClick={(e) => e.stopPropagation()}>
                    <TypeSelect type={baseTicket.ticket_type} onTypeChange={handleTypeChange} disabled={baseTicket.ticket_type?.toLowerCase() === "epic"} />
                  </div>
                )}
                {baseTicket?.ticket_key && (
                  <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)]">
                    {baseTicket.ticket_key}
                  </span>
                )}
              </div>

              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditingTitle ? (
                    <EditableInput
                      value={editedTitle}
                      onChange={setEditedTitle}
                      onSave={handleSaveTitle}
                      onCancel={handleCancelTitle}
                      placeholder="Enter ticket title..."
                    />
                  ) : (
                    <DialogTitle
                      onClick={handleTitleClick}
                      className="cursor-pointer truncate rounded-md p-2 text-xl font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      {baseTicket?.title ?? "Ticket"}
                    </DialogTitle>
                  )}
                </div>
              </div>

              {/* Description */}
              {(hasDescription || isAddingDescription) && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Description</h4>
                  </div>
                  {contentLoading ? (
                    <DescriptionContentSkeleton />
                  ) : contentError ? (
                    <p className="text-sm text-[var(--danger)]">Error loading description: {contentError}</p>
                  ) : isEditingDescription ? (
                    <EditableTextarea
                      value={editedDescription}
                      onChange={setEditedDescription}
                      onSave={handleSaveDescription}
                      onCancel={handleCancelDescription}
                      placeholder="Add a description..."
                    />
                  ) : hasDescription ? (
                    <div onClick={handleDescriptionClick} className="cursor-pointer rounded-md p-3 transition-colors hover:bg-[var(--surface-muted)]">
                      <div className="prose prose-sm max-w-none [&>*]:text-[var(--text)]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{ticketContent}</ReactMarkdown>
                      </div>
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
              {/* Status pill and menu */}
              <div className="mb-4 flex items-start justify-between">
                {baseTicket?.ticket_status && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusSelect status={baseTicket.ticket_status} onStatusChange={handleStatusChange} />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <VerticalDotsMenu items={menuItems} />
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
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
                    <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                      <ProjectSelect projectId={baseTicket?.project_id} projects={projects} onProjectChange={handleProjectChange} />
                    </div>
                  </div>
                  {baseTicket?.ticket_type?.toLowerCase() !== "epic" && (
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Epic:</span>
                      <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                        <EpicSelect epicId={baseTicket?.epic_id} tickets={projectTickets} projectId={baseTicket?.project_id} onEpicChange={handleEpicChange} />
                      </div>
                    </div>
                  )}
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">Priority:</span>
                    <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                      <PrioritySelect priority={baseTicket?.priority} onPriorityChange={handlePriorityChange} />
                    </div>
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

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Ticket"
        description="Are you sure you want to permanently delete this ticket? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteTicket}
      />
    </Dialog>
  );
}

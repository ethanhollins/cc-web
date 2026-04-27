"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Image, Plus, X } from "lucide-react";
import { createBreak, createEvent, createMarker, updateEvent } from "@/api/calendar";
import { createProject } from "@/api/projects";
import { DEFAULT_CALENDAR_ID, createTicket, searchTickets } from "@/api/tickets";
import { CreationMode, CreationModeToggle } from "@/components/planner/CreationModeToggle";
import { EpicSelect } from "@/components/planner/EpicSelect";
import { FocusStatusSelect } from "@/components/planner/FocusStatusSelect";
import { PrioritySelect } from "@/components/planner/PrioritySelect";
import { ProjectSelect } from "@/components/planner/ProjectSelect";
import { StatusSelect } from "@/components/planner/StatusSelect";
import { TypeSelect } from "@/components/planner/TypeSelect";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket, TicketStatus, TicketType } from "@/types/ticket";
import { generateFocusKey } from "@/utils/generate-focus-key";

const DEFAULT_MARKER_COLOUR = "#2980b9";

interface CreationHotbarProps {
  open: boolean;
  projects: Project[];
  allTickets?: Ticket[];
  selectedProjectKey?: string;
  defaultType?: TicketType;
  initialDateRange?: { startDate: Date; endDate: Date } | null;
  defaultMode?: CreationMode;
  breakEventId?: string | null;
  markerEventId?: string | null;
  initialColour?: string;
  disableModeSwitch?: boolean;
  initialTitle?: string;
  onClose: () => void;
  onClearDateRange?: () => void;
  onBreakCreate?: () => void;
  onBreakUpdate?: (eventId: string, title: string, startDate?: Date, endDate?: Date) => void;
  onMarkerCreate?: () => void;
  onMarkerUpdate?: (eventId: string, title: string, colour: string) => void;
  onTicketAdd?: (ticket: Ticket) => void;
  onTicketRemove?: (ticketId: string) => void;
  onEventAdd?: (event: CalendarEvent) => void;
  onEventRemove?: (eventId: string) => void;
}

/**
 * Hotbar-style creation interface for tickets and focuses
 * Appears centered on screen with no background blur
 * Quick, temporary feel with click-outside-to-dismiss
 */
export function CreationHotbar({
  open,
  projects,
  allTickets = [],
  selectedProjectKey,
  defaultType = "task",
  initialDateRange,
  defaultMode = "ticket",
  breakEventId = null,
  markerEventId = null,
  initialColour,
  disableModeSwitch = false,
  initialTitle,
  onClose,
  onClearDateRange,
  onBreakCreate,
  onBreakUpdate,
  onMarkerCreate,
  onMarkerUpdate,
  onTicketAdd,
  onTicketRemove,
  onEventAdd,
  onEventRemove,
}: CreationHotbarProps) {
  const [mode, setMode] = useState<CreationMode>(defaultMode);
  const [title, setTitle] = useState(
    initialTitle || (defaultMode === "break" ? "Break" : defaultMode === "marker" ? "Marker" : ""),
  );
  const [projectKey, setProjectKey] = useState<string | undefined>(selectedProjectKey ?? projects[0]?.project_key);
  const [ticketType, setTicketType] = useState<TicketType>(defaultType);
  const [status, setStatus] = useState<string>(defaultMode === "focus" ? "not started" : "To Do");
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [epicId, setEpicId] = useState<string | undefined>(undefined);
  const [focusKeyOverride, setFocusKeyOverride] = useState<string>("");
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState("");
  const [colour, setColour] = useState(defaultMode === "marker" ? initialColour || DEFAULT_MARKER_COLOUR : "");
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedExistingTicket, setSelectedExistingTicket] = useState<Ticket | null>(null);
  const hotbarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Auto-generate focus key from title
  const focusKey = mode === "focus" ? generateFocusKey(title, focusKeyOverride) : "";

  // Debounced ticket search – only active in ticket mode with a time range
  useEffect(() => {
    if (mode !== "ticket" || !initialDateRange || selectedExistingTicket) return;

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!title.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        const result = await searchTickets(title.trim(), 10, controller.signal);
        setSearchResults(result.tickets ?? []);
      } catch {
        // Ignore abort errors
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [title, mode, initialDateRange, selectedExistingTicket]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setMode(defaultMode);
        setTitle(initialTitle || (defaultMode === "break" ? "Break" : defaultMode === "marker" ? "Marker" : ""));
        setProjectKey(selectedProjectKey ?? projects[0]?.project_key);
        setTicketType(defaultType);
        setStatus(defaultMode === "focus" ? "not started" : "To Do");
        setPriority(undefined);
        setEpicId(undefined);
        setFocusKeyOverride("");
        setExpandedOptions(defaultMode === "marker" ? new Set(["colour"]) : new Set());
        setDescription("");
        setColour(defaultMode === "marker" ? initialColour || DEFAULT_MARKER_COLOUR : "");
        setSearchResults([]);
        setIsSearching(false);
        setSelectedExistingTicket(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, selectedProjectKey, projects, defaultType, defaultMode, initialTitle, initialColour]);

  // Update status when mode changes
  useEffect(() => {
    if (mode === "focus") {
      setStatus("not started");
    } else if (mode === "ticket") {
      setStatus("To Do");
    } else if (mode === "marker") {
      // Default marker colour to blue when switching to marker mode
      setColour((prev) => prev || initialColour || DEFAULT_MARKER_COLOUR);
      setExpandedOptions((prev) => (prev.has("colour") ? prev : new Set(prev).add("colour")));
    }
    // No status change needed for "break" or "marker" mode
  }, [mode, initialColour]);

  // Click outside handler
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking inside the hotbar
      if (hotbarRef.current && !hotbarRef.current.contains(target)) {
        // Don't close if clicking inside a select dropdown (radix portals)
        const isSelectDropdown = (target as Element).closest('[role="listbox"], [role="dialog"], [data-radix-popper-content-wrapper]');
        if (isSelectDropdown) return;

        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // Toggle expanded option
  const toggleOption = useCallback((option: string) => {
    setExpandedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return next;
    });
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    try {
      if (mode === "break") {
        if (!initialDateRange) {
          console.error("Cannot create/update break without date range");
          return;
        }

        if (breakEventId) {
          // Update existing break event
          await updateEvent(breakEventId, {
            title: title.trim(),
            start_date: initialDateRange.startDate.toISOString(),
            end_date: initialDateRange.endDate.toISOString(),
          });
          onBreakUpdate?.(breakEventId, title.trim(), initialDateRange.startDate, initialDateRange.endDate);
        } else {
          // Create new break event
          await createBreak({
            title: title.trim(),
            start_date: initialDateRange.startDate.toISOString(),
            end_date: initialDateRange.endDate.toISOString(),
          });
          onBreakCreate?.();
        }
      } else if (mode === "marker") {
        if (!initialDateRange) {
          console.error("Cannot create/update marker without date range");
          return;
        }

        const markerColour = colour || DEFAULT_MARKER_COLOUR;

        if (markerEventId) {
          // Update existing marker event (title and colour)
          await updateEvent(markerEventId, {
            title: title.trim(),
            date: initialDateRange.startDate.toISOString(),
            colour: markerColour,
          });
          onMarkerUpdate?.(markerEventId, title.trim(), markerColour);
        } else {
          // Create new marker event (point in time)
          await createMarker({
            title: title.trim(),
            date: initialDateRange.startDate.toISOString(),
            colour: markerColour,
          });
          onMarkerCreate?.();
        }
      } else if (mode === "ticket" && selectedExistingTicket && initialDateRange) {
        // Schedule an existing ticket into the selected time range
        const optimisticEventId = `optimistic-event-${Date.now()}`;
        const optimisticEvent: CalendarEvent = {
          ...selectedExistingTicket,
          google_id: optimisticEventId,
          start_date: initialDateRange.startDate.toISOString(),
          end_date: initialDateRange.endDate.toISOString(),
          google_calendar_id: DEFAULT_CALENDAR_ID,
          isOptimistic: true,
        };
        onEventAdd?.(optimisticEvent);

        try {
          const result = await createEvent({
            calendar_id: DEFAULT_CALENDAR_ID,
            start_date: initialDateRange.startDate.toISOString(),
            end_date: initialDateRange.endDate.toISOString(),
            ticket_data: {
              ticket_id: selectedExistingTicket.ticket_id,
              title: selectedExistingTicket.title,
            },
          });

          onEventRemove?.(optimisticEventId);
          onEventAdd?.({
            ...selectedExistingTicket,
            google_id: result.event_id,
            start_date: initialDateRange.startDate.toISOString(),
            end_date: initialDateRange.endDate.toISOString(),
            google_calendar_id: DEFAULT_CALENDAR_ID,
          });
        } catch (error) {
          onEventRemove?.(optimisticEventId);
          console.error("Failed to schedule existing ticket:", error);
          // TODO: Show error toast
          throw error;
        }
      } else if (mode === "ticket" && projectKey) {
        const project = projects.find((p) => p.project_key === projectKey);
        if (!project) return;

        // Generate optimistic IDs
        const optimisticTicketId = `optimistic-${Date.now()}`;
        const optimisticEventId = initialDateRange ? `optimistic-event-${Date.now()}` : null;

        // Create optimistic ticket
        const optimisticTicket: Ticket = {
          ticket_id: optimisticTicketId,
          ticket_key: `${projectKey}-???`,
          title: title.trim(),
          ticket_type: ticketType,
          ticket_status: status as TicketStatus, // Status is string, can be ticket or focus status
          project_id: project.project_id,
          project,
          priority: priority || undefined,
          colour: colour || undefined,
          epic_id: epicId || undefined,
          scheduled_date: initialDateRange ? initialDateRange.startDate.toISOString().split("T")[0] : undefined,
        };

        // Create optimistic event if date range is provided (but not for epics)
        let optimisticEvent: CalendarEvent | null = null;
        if (initialDateRange && optimisticEventId && ticketType !== "epic") {
          optimisticEvent = {
            ...optimisticTicket,
            google_id: optimisticEventId,
            start_date: initialDateRange.startDate.toISOString(),
            end_date: initialDateRange.endDate.toISOString(),
            google_calendar_id: DEFAULT_CALENDAR_ID,
            isOptimistic: true,
          };
          onEventAdd?.(optimisticEvent);
        }

        // Add optimistic ticket to store
        onTicketAdd?.(optimisticTicket);

        try {
          // Create ticket with all fields
          const response = await createTicket({
            title: title.trim(),
            description: description || undefined,
            projectId: project.project_id,
            ticketType: ticketType,
            ticketStatus: status,
            priority: priority || undefined,
            colour: colour || undefined,
            epicId: epicId || undefined,
            ...(initialDateRange &&
              ticketType !== "epic" && {
                startDate: initialDateRange.startDate.toISOString(),
                endDate: initialDateRange.endDate.toISOString(),
                googleCalendarId: DEFAULT_CALENDAR_ID,
              }),
          });

          // Replace optimistic ticket with real data
          onTicketRemove?.(optimisticTicketId);
          onTicketAdd?.({ ...response, project });

          // Replace optimistic event with real data if it exists (but not for epics)
          if (optimisticEventId && response.google_id && ticketType !== "epic") {
            onEventRemove?.(optimisticEventId);
            onEventAdd?.({
              ...response,
              project,
              start_date: initialDateRange!.startDate.toISOString(),
              end_date: initialDateRange!.endDate.toISOString(),
              google_calendar_id: DEFAULT_CALENDAR_ID,
              google_id: response.google_id,
            });
          }
        } catch (error) {
          // Remove optimistic updates on error
          onTicketRemove?.(optimisticTicketId);
          if (optimisticEventId) {
            onEventRemove?.(optimisticEventId);
          }
          console.error("Failed to create ticket:", error);
          // TODO: Show error toast
          throw error;
        }
      } else if (mode === "focus") {
        // Create focus (project/epic)
        await createProject({
          title: title.trim(),
          description: description || undefined,
          colour: colour || undefined,
          projectStatus: status,
          projectKey: focusKeyOverride || undefined,
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to create:", error);
      // TODO: Show error toast
    }
  }, [
    mode,
    title,
    description,
    projectKey,
    projects,
    ticketType,
    status,
    priority,
    colour,
    epicId,
    initialDateRange,
    focusKeyOverride,
    breakEventId,
    markerEventId,
    selectedExistingTicket,
    onBreakCreate,
    onBreakUpdate,
    onMarkerCreate,
    onMarkerUpdate,
    onClose,
    onTicketAdd,
    onTicketRemove,
    onEventAdd,
    onEventRemove,
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: "none" }}>
      <div
        ref={hotbarRef}
        className="relative w-full max-w-2xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-2xl"
        style={{ pointerEvents: "auto" }}
      >
        {/* Main input section */}
        <div
          className={cn(
            "mx-5 mb-4 mt-5 flex items-center gap-3 border-b pb-3",
            mode === "focus"
              ? "border-purple-500"
              : mode === "break"
                ? "border-gray-400 dark:border-gray-600"
                : mode === "marker"
                  ? "border-blue-500"
                  : "border-[var(--accent)]",
          )}
        >
          {/* Ticket key badge shown when an existing ticket is selected */}
          {selectedExistingTicket && (
            <span
              className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white"
              style={{ backgroundColor: selectedExistingTicket.project?.colour || "var(--accent)" }}
            >
              {selectedExistingTicket.ticket_key}
            </span>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (selectedExistingTicket) {
                setSelectedExistingTicket(null);
                setSearchResults([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              } else if (e.key === "Escape") {
                if (selectedExistingTicket) {
                  setSelectedExistingTicket(null);
                  setSearchResults([]);
                } else {
                  onClose();
                }
              }
            }}
            placeholder={
              mode === "ticket"
                ? "Enter your Ticket title..."
                : mode === "break"
                  ? "Enter break title..."
                  : mode === "marker"
                    ? "Enter marker title..."
                    : "Enter your Focus title..."
            }
            autoFocus
            className="flex-1 bg-transparent text-lg font-medium text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent-soft)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]"
            title="Create from image (coming soon)"
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
              title.trim()
                ? mode === "focus"
                  ? "border-purple-500 bg-purple-500 text-white hover:border-green-500 hover:bg-green-500"
                  : mode === "break"
                    ? "border-gray-500 bg-gray-500 text-white hover:border-green-500 hover:bg-green-500"
                    : mode === "marker"
                      ? "border-blue-500 bg-blue-500 text-white hover:border-green-500 hover:bg-green-500"
                      : "border-[var(--accent)] bg-[var(--accent)] text-white hover:border-green-500 hover:bg-green-500"
                : "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-disabled)] opacity-50",
            )}
            title="Create"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>

        {/* Ticket search results – shown only in ticket mode with a time range when not already selected */}
        {mode === "ticket" && initialDateRange && !selectedExistingTicket && (searchResults.length > 0 || isSearching) && (
          <div className="mx-5 mb-3">
            {isSearching && searchResults.length === 0 ? (
              <div className="flex items-center gap-2 py-2 text-xs text-[var(--text-muted)]">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-[var(--border-subtle)] border-t-[var(--accent)]" />
                Searching…
              </div>
            ) : (
              <div className="max-h-[11.5rem] overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]">
                {searchResults.map((ticket) => {
                  const projectColour = ticket.project?.colour || "var(--accent)";
                  return (
                    <button
                      key={ticket.ticket_id}
                      type="button"
                      onClick={() => {
                        setSelectedExistingTicket(ticket);
                        setTitle(ticket.title);
                        setSearchResults([]);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--surface-hover)] focus:outline-none"
                    >
                      {/* Ticket key pill */}
                      <span
                        className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white"
                        style={{ backgroundColor: projectColour }}
                      >
                        {ticket.ticket_key}
                      </span>

                      {/* Ticket title */}
                      <span className="min-w-0 flex-1 truncate text-[var(--text)]">{ticket.title}</span>

                      {/* Type and project pills */}
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-0.5 text-xs capitalize text-[var(--text-muted)]">
                          {ticket.ticket_type}
                        </span>
                        {ticket.project?.title && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: projectColour }}
                          >
                            {ticket.project.title}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Options row with mode toggle and dropdowns */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto py-1 pb-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Mode toggle */}
          <div className="ml-5 flex-shrink-0">
            <CreationModeToggle mode={mode} onModeChange={setMode} disabled={disableModeSwitch} hasTimeRange={!!initialDateRange} />
          </div>

          {/* Time range display */}
          {initialDateRange && (mode === "ticket" || mode === "break" || mode === "marker") && (mode !== "ticket" || ticketType !== "epic") && (
            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
              <span>
                {initialDateRange.startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                {mode !== "marker" && (
                  <>
                    {" "}
                    -{" "}
                    {initialDateRange.endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </>
                )}
              </span>
              {onClearDateRange && mode !== "break" && mode !== "marker" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearDateRange();
                  }}
                  className="flex h-3 w-3 items-center justify-center rounded-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          )}

          {mode === "ticket" && !selectedExistingTicket && (
            <>
              {/* Focus dropdown */}
              <div className="flex-shrink-0">
                <ProjectSelect
                  projectId={projects.find((p) => p.project_key === projectKey)?.project_id}
                  projects={projects}
                  onProjectChange={(projectId) => {
                    const project = projects.find((p) => p.project_id === projectId);
                    if (project) setProjectKey(project.project_key);
                  }}
                  className="h-auto rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-xs hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)]"
                />
              </div>

              {/* Type dropdown */}
              <div className="flex-shrink-0">
                <TypeSelect type={ticketType} onTypeChange={setTicketType} className="h-auto rounded-full px-2 py-0.5 text-xs" includeEpic />
              </div>

              {/* Status dropdown */}
              <div className="flex-shrink-0">
                <StatusSelect status={status as TicketStatus} onStatusChange={setStatus} className="h-auto rounded-full px-2 py-0.5 text-xs" />
              </div>

              {/* Epic dropdown - only for non-epic tickets */}
              {ticketType !== "epic" && (
                <div className="flex-shrink-0">
                  <EpicSelect
                    epicId={epicId}
                    tickets={allTickets}
                    projectId={projects.find((p) => p.project_key === projectKey)?.project_id}
                    onEpicChange={(id) => setEpicId(id ?? undefined)}
                    className="h-auto rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-xs hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)]"
                    placeholder="Select Epic"
                  />
                </div>
              )}

              {/* Priority dropdown */}
              <div className="flex-shrink-0">
                <PrioritySelect
                  priority={priority}
                  onPriorityChange={(p) => setPriority(p ?? undefined)}
                  className="h-auto rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-xs hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)]"
                  placeholder="Priority"
                />
              </div>

              {/* + Colour button - only for epic tickets */}
              {ticketType === "epic" && (
                <button
                  type="button"
                  onClick={() => toggleOption("colour")}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs transition-colors",
                    expandedOptions.has("colour")
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--accent-soft)] bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent-soft)]",
                  )}
                >
                  {expandedOptions.has("colour") ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  Colour
                </button>
              )}

              {/* + Description button */}
              <button
                type="button"
                onClick={() => toggleOption("description")}
                className={cn(
                  "mr-5 flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs transition-colors",
                  expandedOptions.has("description")
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--accent-soft)] bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent-soft)]",
                )}
              >
                {expandedOptions.has("description") ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                Description
              </button>
            </>
          )}

          {mode === "marker" && (
            <>
              {/* + Colour button (same selector pattern as focus mode) */}
              <button
                type="button"
                onClick={() => toggleOption("colour")}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs transition-colors",
                  expandedOptions.has("colour")
                    ? "border-purple-500 bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                    : "border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-950",
                )}
              >
                {expandedOptions.has("colour") ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                Colour
              </button>
            </>
          )}

          {mode === "focus" && (
            <>
              {/* Key preview */}
              <button
                type="button"
                onClick={() => toggleOption("key")}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)]"
              >
                <span>Key: {focusKey || "Auto"}</span>
              </button>

              {/* Status dropdown */}
              <div className="flex-shrink-0">
                <FocusStatusSelect status={status} onStatusChange={setStatus} className="h-auto rounded-full px-2 py-0.5 text-xs" />
              </div>

              {/* + Colour button */}
              <button
                type="button"
                onClick={() => toggleOption("colour")}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs transition-colors",
                  expandedOptions.has("colour")
                    ? "border-purple-500 bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                    : "border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-950",
                )}
              >
                {expandedOptions.has("colour") ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                Colour
              </button>

              {/* + Description button */}
              <button
                type="button"
                onClick={() => toggleOption("description")}
                className={cn(
                  "mr-5 flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs transition-colors",
                  expandedOptions.has("description")
                    ? "border-purple-500 bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                    : "border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-950",
                )}
              >
                {expandedOptions.has("description") ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                Description
              </button>
            </>
          )}
        </div>

        {/* Expandable options content area */}
        {expandedOptions.size > 0 && (
          <div className="mx-5 mb-5 mt-4 space-y-3">
            {expandedOptions.has("key") && (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="key-input" className="text-sm text-[var(--text-muted)]">
                    Key Override:
                  </label>
                  <input
                    id="key-input"
                    type="text"
                    value={focusKeyOverride}
                    onChange={(e) => setFocusKeyOverride(e.target.value)}
                    placeholder="e.g., ABC"
                    className="flex-1 rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-sm text-[var(--text)] outline-none"
                  />
                </div>
              </div>
            )}

            {expandedOptions.has("description") && (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                />
              </div>
            )}

            {expandedOptions.has("colour") && (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="colour-input" className="text-sm text-[var(--text-muted)]">
                    Colour:
                  </label>
                  <input
                    id="colour-input"
                    type="color"
                    value={colour || DEFAULT_MARKER_COLOUR}
                    onChange={(e) => setColour(e.target.value)}
                    className="h-8 w-16 cursor-pointer rounded border border-[var(--border-subtle)]"
                  />
                  <input
                    type="text"
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                    placeholder={DEFAULT_MARKER_COLOUR}
                    className="flex-1 rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-sm text-[var(--text)] outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Clock, Diamond01, MarkerPin01, Package, Ticket01, VideoRecorder } from "@untitledui/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Project } from "@/app/home-screen";
import { useTicketDocuments, useTicketNotionContent, useTicketNotionData } from "@/hooks/use-ticket-notion-data";
import { DescriptionContentSkeleton, SidebarSkeleton, TicketDataSkeleton } from "./LoadingComponents";

export type TicketDetail = {
    ticket_id: string;
    ticket_key: string;
    title: string;
    ticket_type?: string;
    ticket_status?: string;
    project?: Project;
    epic?: string;
    notion_url?: string;
    description?: string;
    assignee?: string;
    priority?: "Lowest" | "Low" | "Medium" | "High" | "Highest";
    labels?: string[];
    comments?: { id: string; author: string; text: string; timeISO: string }[];
    createdAtISO?: string;
    updatedAtISO?: string;

    // added subtasks & linked tickets
    subtasks?: { ticket_id: string; ticket_key: string; title: string; ticket_status?: string; notion_url?: string }[];
    linkedTickets?: { ticket_id: string; ticket_key: string; title: string; relation?: string; notion_url?: string }[];
};

type Props = {
    open: boolean;
    ticketId: string | null;
    onClose: () => void;
    events?: any[]; // Add events prop
};

// Helper component for meeting UI in the sidebar
function MeetingUI({ ticketId, events }: { ticketId: string | null; events?: any[] }) {
    const [now, setNow] = useState<Date>(new Date());
    const [meetingEvent, setMeetingEvent] = useState<any>(null);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Update meeting event when events or ticketId changes
    useEffect(() => {
        if (events && events.length > 0 && ticketId) {
            const foundMeeting = events.find((event) => {
                return event.ticket_id === ticketId && event.meeting_url;
            });
            setMeetingEvent(foundMeeting || null);
        } else {
            setMeetingEvent(null);
        }
    }, [events, ticketId]);

    if (!meetingEvent) {
        return null; // No meeting for this ticket
    }

    const start = new Date(meetingEvent.start_date);
    const end = new Date(meetingEvent.end_date);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60_000);

    const msUntil = start.getTime() - now.getTime();
    const isOver = now.getTime() > end.getTime();
    const isOngoing = now >= start && now <= end;

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts = [];

        if (hours >= 1) {
            parts.push(`${hours}h`);
        }
        if (minutes >= 1) {
            parts.push(`${minutes}m`);
        }
        if (seconds >= 1 || parts.length === 0) {
            parts.push(`${String(seconds).padStart(2, "0")}s`);
        }

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
        } else {
            return `(${durationMinutes}m)`;
        }
    })();

    const disableJoin = msUntil > 5 * 60_000; // disable if more than 5 minutes away

    const locationLabel =
        meetingEvent.meeting_platform === "google_meet"
            ? "Google Meet"
            : meetingEvent.meeting_platform === "zoom"
              ? "Zoom"
              : meetingEvent.meeting_platform === "teams"
                ? "Teams"
                : meetingEvent.meeting_platform || "Meeting";

    return (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
                <VideoRecorder className="size-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-900">Meeting</span>
            </div>

            {/* Meeting Info */}
            <div className="mb-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="size-3" />
                    <span>{timeLabel}</span>
                    <span className="text-gray-400">{durLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MarkerPin01 className="size-3" />
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
                    aria-disabled={true}
                >
                    <VideoRecorder className="size-4" />
                    {isOver ? "Meeting Ended" : "Join Meeting"}
                </span>
            ) : (
                <a
                    href={meetingEvent.meeting_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    <VideoRecorder className="size-4" />
                    Join Meeting
                </a>
            )}
        </div>
    );
}

export default function TicketModal({ open, ticketId, onClose, events = [] }: Props) {
    // Fetch ticket data and content from the APIs
    const { data: ticketData, loading: ticketLoading, error: ticketError } = useTicketNotionData(open ? ticketId : null);
    const { content: ticketContent, loading: contentLoading, error: contentError } = useTicketNotionContent(open ? ticketId : null);
    const { documents: ticketDocuments, loading: documentsLoading, error: documentsError } = useTicketDocuments(open ? ticketId : null);

    // State for collapsible sections
    const [expandedSections, setExpandedSections] = useState({
        project: true,
        epic: true,
        ticket: true,
    });

    const toggleSection = (section: "project" | "epic" | "ticket") => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // helper to render initials and avatar circle
    const initials = (name?: string) =>
        (name ?? "")
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    const Avatar = ({ name, size = 8 }: { name?: string; size?: number }) => (
        <div
            className={`flex-shrink-0 h-${size} w-${size} flex items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700`}
            title={name ?? "Unknown"}
            aria-hidden="true"
        >
            {initials(name)}
        </div>
    );

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    // Show loading skeleton if still loading initial data
    if (ticketLoading || !ticketData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative z-10 mx-4 flex max-h-[92vh] w-[920px] max-w-full transform flex-row overflow-hidden rounded-xl bg-white shadow-2xl">
                    <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
                        <TicketDataSkeleton />
                    </div>
                    <aside className="flex w-80 flex-shrink-0 flex-col border-l border-gray-100 bg-gray-50 p-4">
                        <SidebarSkeleton />
                    </aside>
                </div>
            </div>
        );
    }

    // Show error state
    if (ticketError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative z-10 mx-4 flex max-h-[92vh] w-[920px] max-w-full transform flex-row overflow-hidden rounded-xl bg-white shadow-2xl">
                    <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
                        <div className="text-center text-red-600">
                            <p>Error loading ticket data: {ticketError}</p>
                            <button onClick={onClose} className="mt-4 rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                className="relative z-10 mx-4 flex max-h-[92vh] w-[920px] max-w-full transform flex-row overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left: main ticket content */}
                <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        {(() => {
                            const t = (ticketData.ticket_type ?? "task") as string;
                            const map: Record<string, string> = {
                                task: "bg-blue-100 text-blue-600",
                                story: "bg-emerald-100 text-emerald-700",
                                bug: "bg-rose-100 text-rose-600",
                                epic: "bg-purple-100 text-purple-600",
                                subtask: "bg-blue-100 text-blue-600",
                            };
                            const cls = map[t.toLowerCase()] ?? "bg-gray-100 text-gray-700";
                            return <span className={`inline-flex h-6 items-center justify-center rounded-md px-2 text-xs font-semibold ${cls}`}>{t}</span>;
                        })()}
                        <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 px-2 text-xs font-semibold text-gray-700">
                            {ticketData.ticket_key}
                        </span>
                    </div>
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <h2 className="min-w-0 text-xl font-semibold text-gray-900">{ticketData.title}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-md font-semibold text-gray-600">Description</h4>

                        {contentLoading ? (
                            <DescriptionContentSkeleton />
                        ) : contentError ? (
                            <div className="text-sm text-red-600">Error loading description: {contentError}</div>
                        ) : ticketContent ? (
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{ticketContent}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400">No description</div>
                        )}
                    </div>

                    {/* Subtasks */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-md font-semibold text-gray-600">Subtasks</h4>
                        {ticketData.subtasks && ticketData.subtasks.length > 0 ? (
                            <ul className="space-y-2">
                                {ticketData.subtasks.map((subtask, index) => (
                                    <li key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                            <span className="truncate font-medium text-gray-900">{subtask}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-gray-400">No subtasks</div>
                        )}
                    </div>

                    {/* Linked Tickets */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-md font-semibold text-gray-600">Linked tickets</h4>
                        {ticketData.linked_tickets && ticketData.linked_tickets.length > 0 ? (
                            <ul className="space-y-2">
                                {ticketData.linked_tickets.map((linkedTicket, index) => (
                                    <li key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                            <span className="truncate font-medium text-gray-900">{linkedTicket}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-gray-400">No linked tickets</div>
                        )}
                    </div>

                    {/* Documents Hierarchy */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-md font-semibold text-gray-600">Related documents</h4>
                        {documentsLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        ) : documentsError ? (
                            <div className="text-sm text-red-600">Error loading documents: {documentsError}</div>
                        ) : ticketDocuments && (ticketDocuments.project.length > 0 || ticketDocuments.epic.length > 0 || ticketDocuments.ticket.length > 0) ? (
                            <div className="space-y-2">
                                {/* Project Documents */}
                                {ticketDocuments.project.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => toggleSection("project")}
                                            className="mb-2 flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left transition-colors hover:bg-gray-50"
                                        >
                                            {expandedSections.project ? (
                                                <ChevronDown className="h-3 w-3 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                            )}
                                            <Package className="h-3 w-3 text-purple-500" />
                                            <span className="truncate text-xs font-semibold text-gray-700" title={ticketData.project_title}>
                                                {ticketData.project_title || "Project"}
                                            </span>
                                            <span className="ml-auto text-xs text-gray-400">({ticketDocuments.project.length})</span>
                                        </button>
                                        {expandedSections.project && (
                                            <div className="ml-4 space-y-1">
                                                {ticketDocuments.project.map((doc, index) => (
                                                    <a
                                                        key={index}
                                                        href={doc.notion_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
                                                    >
                                                        <svg
                                                            className="h-4 w-4 text-gray-400 group-hover:text-blue-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        <span className="truncate font-medium text-gray-900 group-hover:text-blue-700" title={doc.title}>
                                                            {doc.title}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Epic Documents */}
                                {ticketDocuments.epic.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => toggleSection("epic")}
                                            className="mb-2 flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left transition-colors hover:bg-gray-50"
                                        >
                                            <div className="ml-4"></div>
                                            {expandedSections.epic ? (
                                                <ChevronDown className="h-3 w-3 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                            )}
                                            <Diamond01 className="h-3 w-3 text-indigo-500" />
                                            <span className="truncate text-xs font-semibold text-gray-700" title={ticketData.epic}>
                                                {ticketData.epic || "Epic"}
                                            </span>
                                            <span className="ml-auto text-xs text-gray-400">({ticketDocuments.epic.length})</span>
                                        </button>
                                        {expandedSections.epic && (
                                            <div className="ml-8 space-y-1">
                                                {ticketDocuments.epic.map((doc, index) => (
                                                    <a
                                                        key={index}
                                                        href={doc.notion_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
                                                    >
                                                        <svg
                                                            className="h-4 w-4 text-gray-400 group-hover:text-blue-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        <span className="truncate font-medium text-gray-900 group-hover:text-blue-700" title={doc.title}>
                                                            {doc.title}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Ticket Documents */}
                                {ticketDocuments.ticket.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => toggleSection("ticket")}
                                            className="mb-2 flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left transition-colors hover:bg-gray-50"
                                        >
                                            <div className="ml-8"></div>
                                            {expandedSections.ticket ? (
                                                <ChevronDown className="h-3 w-3 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                            )}
                                            <Ticket01 className="h-3 w-3 text-blue-500" />
                                            <span className="truncate text-xs font-semibold text-gray-700" title={ticketData.title}>
                                                {ticketData.title}
                                            </span>
                                            <span className="ml-auto text-xs text-gray-400">({ticketDocuments.ticket.length})</span>
                                        </button>
                                        {expandedSections.ticket && (
                                            <div className="ml-12 space-y-1">
                                                {ticketDocuments.ticket.map((doc, index) => (
                                                    <a
                                                        key={index}
                                                        href={doc.notion_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
                                                    >
                                                        <svg
                                                            className="h-4 w-4 text-gray-400 group-hover:text-blue-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        <span className="truncate font-medium text-gray-900 group-hover:text-blue-700" title={doc.title}>
                                                            {doc.title}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400">No related documents</div>
                        )}
                    </div>
                </div>

                {/* Right: sidebar */}
                <aside className="flex w-80 flex-shrink-0 flex-col border-l border-gray-100 bg-gray-50 p-4">
                    {/* Status box at top of sidebar */}
                    <div className="mb-4">
                        {(() => {
                            const s = ticketData.ticket_status ?? "Unknown";
                            // colour mapping aligned with TicketsCard.tsx
                            const map: Record<string, string> = {
                                Backlog: "bg-gray-100 text-gray-700",
                                Todo: "bg-gray-200 text-gray-700",
                                "In Progress": "bg-blue-100 text-blue-600",
                                "In Review": "bg-indigo-50 text-indigo-700",
                                Blocked: "bg-amber-50 text-amber-700",
                                Done: "bg-emerald-50 text-emerald-700",
                                Removed: "bg-rose-50 text-rose-700",
                                Unknown: "bg-gray-100 text-gray-800",
                            };
                            const cls = map[s] ?? "bg-gray-100 text-gray-800";
                            return (
                                <div
                                    role="status"
                                    aria-label={`Status: ${s}`}
                                    className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-semibold ${cls} max-w-[180px]`}
                                >
                                    {s}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Project & Priority (plain text, not boxed) */}
                    <div className="mb-4 min-w-0 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                                    {initials(ticketData.assignee)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{ticketData.assignee ?? "Unassigned"}</div>
                                <div className="text-xs text-gray-500">Assignee</div>
                            </div>
                        </div>

                        <div className="mt-3 flex min-w-0 flex-col gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex-shrink-0 text-xs text-gray-500">Project:</span>
                                <span className="min-w-0 truncate font-medium text-gray-900">{ticketData.project_title ?? "-"}</span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex-shrink-0 text-xs text-gray-500">Epic:</span>
                                <span className="min-w-0 truncate font-medium text-gray-900">{ticketData.epic ?? "-"}</span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex-shrink-0 text-xs text-gray-500">Priority:</span>
                                <span className="min-w-0 truncate font-medium text-gray-900">{ticketData.priority ?? "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Go to Notion button at bottom */}
                    <div className="mt-auto">
                        <div className="mt-3 mb-4 text-xs text-gray-500">
                            <div>Created: {ticketData.created_time ? new Date(ticketData.created_time).toLocaleString() : "-"}</div>
                            <div className="mt-1">Updated: {ticketData.last_edited_time ? new Date(ticketData.last_edited_time).toLocaleString() : "-"}</div>
                        </div>

                        {/* Meeting UI */}
                        <MeetingUI ticketId={ticketId} events={events} />

                        <a
                            href={ticketData.notion_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Go to Notion"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                            Go to Notion
                        </a>
                    </div>
                </aside>
            </div>
        </div>
    );
}

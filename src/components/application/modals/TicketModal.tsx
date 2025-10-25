"use client";

import React, { useEffect, useState } from "react";
import { Project } from "@/app/home-screen";

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
    ticket: TicketDetail | null;
    onClose: () => void;
};

export default function TicketModal({ open, ticket, onClose }: Props) {
    const [local, setLocal] = useState<TicketDetail | null>(null);

    useEffect(() => {
        setLocal(ticket ? { ...ticket } : null);
    }, [ticket]);

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

    if (!open || !local) return null;

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
                            const t = (local.ticket_type ?? "task") as string;
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
                            {local.ticket_key}
                        </span>
                    </div>
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <h2 className="min-w-0 text-lg font-semibold text-gray-900">{local.title}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-md font-semibold text-gray-600">Description</h4>

                        {local.description ? (
                            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-800">{local.description}</div>
                        ) : (
                            <div className="text-sm text-gray-400">No description</div>
                        )}
                    </div>

                    {/* Subtasks */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-md font-semibold text-gray-600">Subtasks</h4>
                        {local.subtasks && local.subtasks.length > 0 ? (
                            <ul className="space-y-2">
                                {local.subtasks.map((st) => (
                                    <li key={st.ticket_id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                            <a
                                                href={st.notion_url ?? "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate font-medium text-gray-900 hover:underline"
                                            >
                                                {st.ticket_key} — {st.title}
                                            </a>
                                            <div className="text-xs text-gray-500">{st.ticket_status ?? ""}</div>
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
                        {local.linkedTickets && local.linkedTickets.length > 0 ? (
                            <ul className="space-y-2">
                                {local.linkedTickets.map((lt) => (
                                    <li key={lt.ticket_id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                            <a
                                                href={lt.notion_url ?? "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate font-medium text-gray-900 hover:underline"
                                            >
                                                {lt.ticket_key} — {lt.title}
                                            </a>
                                            <div className="text-xs text-gray-500">{lt.relation ?? ""}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-gray-400">No linked tickets</div>
                        )}
                    </div>

                    {/* Activity (comments) - moved here from the sidebar */}
                    <div className="mb-4">
                        <h5 className="text-md font-semibold text-gray-600">Comments</h5>
                        <div className="mt-2 max-h-[220px] overflow-auto pr-1 text-sm">
                            {(local.comments ?? []).length === 0 ? (
                                <div className="text-xs text-gray-400">No comments yet</div>
                            ) : (
                                (local.comments ?? [])
                                    .slice()
                                    .reverse()
                                    .map((c) => (
                                        <div key={c.id} className="mb-3">
                                            <div className="flex items-start gap-3">
                                                {/* avatar */}
                                                <div className="flex-shrink-0">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                                                        {initials(c.author)}
                                                    </div>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="truncate text-sm font-medium text-gray-800">{c.author}</div>
                                                        <div className="flex-shrink-0 text-xs text-gray-400">{new Date(c.timeISO).toLocaleString()}</div>
                                                    </div>
                                                    <div className="mt-1 text-sm whitespace-pre-wrap text-gray-700">{c.text}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: sidebar */}
                <aside className="flex w-80 flex-shrink-0 flex-col border-l border-gray-100 bg-gray-50 p-4">
                    {/* Status box at top of sidebar */}
                    <div className="mb-4">
                        {(() => {
                            const s = local.ticket_status ?? "Unknown";
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
                                    {initials(local.assignee)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{local.assignee ?? "Unassigned"}</div>
                                <div className="text-xs text-gray-500">Assignee</div>
                            </div>
                        </div>

                        <div className="mt-3 flex min-w-0 flex-col gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex-shrink-0 text-xs text-gray-500">Project:</span>
                                <span className="min-w-0 truncate font-medium text-gray-900">{local.project?.title ?? local.project?.project_key ?? "-"}</span>
                                {local.project?.project_key && local.project?.title && (
                                    <span className="ml-2 flex-shrink-0 text-xs text-gray-500">({local.project?.project_key})</span>
                                )}
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex-shrink-0 text-xs text-gray-500">Epic:</span>
                                <span className="min-w-0 truncate font-medium text-gray-900">{local.epic ?? "-"}</span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex-shrink-0 text-xs text-gray-500">Priority:</span>
                                <span className="min-w-0 truncate font-medium text-gray-900">{local.priority ?? "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Go to Notion button at bottom */}

                    <div className="mt-auto">
                        <div className="mt-3 mb-4 text-xs text-gray-500">
                            <div>Created: {local.createdAtISO ? new Date(local.createdAtISO).toLocaleString() : "-"}</div>
                            <div className="mt-1">Updated: {local.updatedAtISO ? new Date(local.updatedAtISO).toLocaleString() : "-"}</div>
                        </div>
                        <a
                            href={local.notion_url}
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

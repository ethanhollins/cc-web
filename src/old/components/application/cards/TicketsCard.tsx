"use client";

import React from "react";
import { AlertCircle, BookOpen01, CalendarDate, CheckDone02, CheckSquare, ChevronDown, Diamond01, Feather } from "@untitledui/icons";
import { Project, Ticket, TicketStatus, TicketType } from "@/old/app/home-screen";
import { Card } from "./Card";
import { CardHeader } from "./CardHeader";

type Props = {
    items: Record<string, Ticket[]>;
    projects: Project[];
    selectedProjectKey?: string;
    onProjectChange?: (projectKey: string) => void;
    onItemClick?: (ticket: Ticket) => void;
};

const statusRank: Record<TicketStatus, number> = {
    "In Progress": 0,
    Ongoing: 1,
    "In Review": 2,
    Blocked: 3,
    Todo: 4,
    Backlog: 5,
    Done: 6,
    Removed: 7,
};

function typeIcon(t: TicketType) {
    const base = "size-3";
    switch (t) {
        case "bug":
            return <AlertCircle className={`${base} text-red-600`} />;
        case "story":
            return <BookOpen01 className={`${base} text-green-600`} />;
        case "epic":
            return <Diamond01 className={`${base} text-purple-600`} />;
        case "subtask":
            return <CheckDone02 className={`${base} text-blue-600`} />;
        case "event":
            return <CalendarDate className={`${base} text-gray-600`} />;
        default:
            return <CheckSquare className={`${base} text-blue-600`} />; // task
    }
}

function statusPillClasses(status: TicketStatus) {
    // Subtle colored pills by bucket
    if (status === "In Progress" || status === "In Review") return "bg-indigo-50 text-indigo-700";
    if (status === "Todo" || status === "Backlog") return "bg-gray-100 text-gray-700";
    if (status === "Blocked") return "bg-amber-50 text-amber-700";
    if (status === "Ongoing") return "bg-pink-50 text-pink-700";
    if (status === "Done") return "bg-emerald-50 text-emerald-700";
    return "bg-rose-50 text-rose-700"; // Removed
}

export default function TicketsCard({ items, projects, selectedProjectKey, onProjectChange, onItemClick }: Props) {
    const [projectKey, setProjectKey] = React.useState<string>(selectedProjectKey || (projects[0]?.project_key ?? ""));

    React.useEffect(() => {
        if (selectedProjectKey && selectedProjectKey !== projectKey) {
            setProjectKey(selectedProjectKey);
        }
    }, [selectedProjectKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        setProjectKey(v);
        onProjectChange?.(v);
    };

    const projectTickets =
        items[projectKey]?.filter(
            (ticket) => ticket.ticket_type.toLowerCase() !== "epic" && !["done", "removed"].includes(ticket.ticket_status.toLowerCase()),
        ) || [];

    const sorted = [...projectTickets].sort((a, b) => {
        const ar = statusRank[a.ticket_status] ?? 99;
        const br = statusRank[b.ticket_status] ?? 99;
        if (ar !== br) return ar - br;
        // Stable secondary sort: newest first by key/id if you like; here alphabetical by key
        return parseInt(b.ticket_key.split("-")[1]) - parseInt(a.ticket_key.split("-")[1]);
    });

    return (
        <Card className="mb-2 min-w-[400px] flex-10">
            <CardHeader title="Project Tickets" className="text-violet-950" headerIcon={<Feather className="size-5 text-violet-800" />}>
                <div className="relative">
                    <select
                        value={projectKey}
                        onChange={handleChange}
                        className="max-w-[200px] appearance-none truncate rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-3 text-sm font-medium whitespace-nowrap text-gray-900 shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    >
                        {projects
                            .sort((a, b) => a.project_key.localeCompare(b.project_key))
                            .map((p) => (
                                <option key={p.project_key} value={p.project_key}>
                                    {p.project_key} — {p.title}
                                </option>
                            ))}
                        {projects.length === 0 && <option value="">No projects</option>}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
            </CardHeader>
            <ul>
                {sorted.map((t, idx) => {
                    return (
                        <li key={t.ticket_id} onClick={() => onItemClick?.(t)} className="cursor-pointer hover:bg-gray-50/50">
                            <div className="flex items-center justify-between gap-2 px-4 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">{typeIcon(t.ticket_type)}</span>
                                    <p className="text-xs whitespace-nowrap text-gray-900">{t.ticket_key}</p>
                                    <p className="truncate overflow-hidden text-[15px] font-medium whitespace-nowrap text-gray-900">{t.title}</p>
                                </div>

                                <div className="ml-4 flex items-center gap-3">
                                    <span
                                        className={[
                                            "rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                                            statusPillClasses(t.ticket_status),
                                        ].join(" ")}
                                    >
                                        {t.ticket_status}
                                    </span>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}

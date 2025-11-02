"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Sun, Ticket01 } from "@untitledui/icons";

export type Project = {
    project_id: string;
    project_key: string;
    project_status: string;
    title: string;
    colour?: string;
};

export type TicketType = "task" | "story" | "bug" | "epic" | "subtask" | "event";

export type TicketStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Blocked" | "Done" | "Removed";

export type Ticket = {
    ticket_id: string;
    ticket_key: string;
    ticket_type: TicketType;
    title: string;
    ticket_status: TicketStatus;
    epic?: string;
    project_id?: string;
    project?: Project;
    notion_url?: string;
    colour?: string;
    google_id?: string;
    scheduled_date?: string; // ISO date string for when ticket is scheduled
};

export interface TicketEvent extends Ticket {
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    all_day?: boolean;
    google_calendar_id: string;
}

type JustInTimeCoverProps = {
    imageUrl?: string;
    temperature?: number | string; // e.g., 22 or "72°F"
    unit?: "C" | "F" | "raw"; // raw = don't append unit if temperature is already a string w/ unit
    condition?: string; // e.g., "sunny"
    events?: TicketEvent[]; // Array of events for the current day
    className?: string;
};

// Helper functions to determine event state
const isEventActive = (event: TicketEvent, currentTime: Date): boolean => {
    // Skip all-day events for "currently working on" status
    if (event.all_day) return false;

    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    return currentTime >= start && currentTime <= end;
};

const getActiveEvent = (events: TicketEvent[], currentTime: Date): TicketEvent | null => {
    return events.find((event) => isEventActive(event, currentTime)) || null;
};

const getNextUpcomingEvent = (events: TicketEvent[], currentTime: Date): TicketEvent | null => {
    const upcomingEvents = events
        .filter((event) => !event.all_day && new Date(event.start_date) > currentTime)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    return upcomingEvents[0] || null;
};

const formatTimeUntil = (eventStart: string, currentTime: Date): string => {
    const start = new Date(eventStart);
    const diffMs = start.getTime() - currentTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
        return `in ${diffMinutes} minutes`;
    } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `in ${hours}h ${minutes}m`;
    }
};

const formatEventTime = (eventStart: string): string => {
    return new Date(eventStart).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Generate a daily seed for consistent background throughout the day
const getDailySeed = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
};

// Generate Lorem Picsum URL with daily seed
const generateDailyBackgroundUrl = (width: number = 1200, height: number = 400): string => {
    const seed = getDailySeed();
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

export default function JustInTimeCover({
    imageUrl = generateDailyBackgroundUrl(),
    temperature = 22,
    unit = "C",
    condition = "sunny",
    events = [],
    className = "",
}: JustInTimeCoverProps) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const timeText = useMemo(
        () =>
            now.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        [now],
    );

    const dateText = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }).format(now),
        [now],
    );

    const tempText = useMemo(() => {
        if (typeof temperature === "string") return temperature;
        if (unit === "raw") return String(temperature);
        if (unit === "F") return `${temperature}\u00B0F`;
        return `${temperature}\u00B0C`;
    }, [temperature, unit]);

    // Determine current event state
    const { activeEvent, upcomingEvent, isDoneForDay } = useMemo(() => {
        const active = getActiveEvent(events, now);
        const upcoming = active ? null : getNextUpcomingEvent(events, now);
        const done = !active && !upcoming;

        return {
            activeEvent: active,
            upcomingEvent: upcoming,
            isDoneForDay: done,
        };
    }, [events, now]);

    const statusClass = useMemo(() => {
        const base =
            "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden";

        const status = activeEvent?.ticket_status || upcomingEvent?.ticket_status || "";

        switch (status.toLowerCase()) {
            case "done":
                return `${base} bg-emerald-500/80 text-white`;
            case "blocked":
                return `${base} bg-rose-500/80 text-white`;
            case "in progress":
            default:
                return `${base} bg-blue-500/80 text-white`;
        }
    }, [activeEvent, upcomingEvent]);

    return (
        <div className={`relative h-full overflow-hidden rounded-lg ${className}`}>
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-[0%_30%]" style={{ backgroundImage: `url(${imageUrl})` }} aria-hidden>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
            </div>

            {/* Foreground */}
            <div className="relative flex h-full flex-col justify-between p-8 text-white">
                {/* Top Row */}
                <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Sun className="size-8" aria-hidden />
                        <div>
                            <div className="text-4xl">{tempText}</div>
                            <div className="capitalize opacity-90">{condition}</div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl tabular-nums">{timeText}</div>
                        <div className="opacity-90">{dateText}</div>
                    </div>
                </div>

                {/* Bottom Card */}
                <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    {activeEvent ? (
                        <>
                            <Ticket01 className="size-4" aria-hidden />
                            <div className="flex-1">
                                <div className="text-sm opacity-75">Currently Working On</div>
                                <h3 className="mt-1 leading-tight font-medium">{activeEvent.title}</h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm">{activeEvent.ticket_key}</span>
                                    <span data-slot="badge" className={statusClass}>
                                        {activeEvent.ticket_status}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : upcomingEvent ? (
                        <>
                            <Clock className="size-4" aria-hidden />
                            <div className="flex-1">
                                <div className="text-sm opacity-75">
                                    Up Next - {formatEventTime(upcomingEvent.start_date)} ({formatTimeUntil(upcomingEvent.start_date, now)})
                                </div>
                                <h3 className="mt-1 leading-tight font-medium">{upcomingEvent.title}</h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm">{upcomingEvent.ticket_key}</span>
                                    <span data-slot="badge" className={statusClass}>
                                        {upcomingEvent.ticket_status}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Sun className="size-4" aria-hidden />
                            <div className="flex-1">
                                <div className="text-sm opacity-75">Great Job!</div>
                                <h3 className="mt-1 leading-tight font-medium">You're all done for the day</h3>
                                <div className="mt-2 text-sm opacity-90">No more scheduled tasks today. Time to relax! 🎉</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/*
USAGE (Next.js):

1) Install icons (once):
   npm install lucide-react

2) Ensure Tailwind is set up in your Next app.

3) Drop this file at: app/components/WeatherHeroCard.tsx (or anywhere under src/)

4) Import & use in a Client Page/Component:

   "use client";
   import WeatherHeroCard from "@/components/WeatherHeroCard";

   export default function Page() {
     return (
       <main className="p-6">
         <WeatherHeroCard
           imageUrl="https://images.unsplash.com/photo-1627817783271-1b8d21266a74?auto=format&fit=crop&w=1600&q=80"
           temperature={22}
           unit="C"
           condition="sunny"
           projectTitle="Implement dashboard analytics"
           ticketKey="PROJ-1234"
           status="In Progress"
         />
       </main>
     );
   }
*/

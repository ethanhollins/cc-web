"use client";

import { useEffect, useMemo, useState } from "react";
import { Sun, Ticket01 } from "@untitledui/icons";

type Status = "In Progress" | "Blocked" | "Done" | string;

type JustInTimeCoverProps = {
    imageUrl?: string;
    temperature?: number | string; // e.g., 22 or "72°F"
    unit?: "C" | "F" | "raw"; // raw = don't append unit if temperature is already a string w/ unit
    condition?: string; // e.g., "sunny"
    projectTitle?: string;
    ticketKey?: string; // e.g., PROJ-1234
    status?: Status;
    className?: string;
};

export default function JustInTimeCover({
    imageUrl = "https://images.unsplash.com/photo-1627817783271-1b8d21266a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5ueSUyMHdlYXRoZXIlMjBza3l8ZW58MXx8fHwxNzU5NjM0ODMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    temperature = 22,
    unit = "C",
    condition = "sunny",
    projectTitle = "Implement dashboard analytics",
    ticketKey = "PROJ-1234",
    status = "In Progress",
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

    const statusClass = useMemo(() => {
        const base =
            "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden";
        switch (status.toLowerCase()) {
            case "done":
                return `${base} bg-emerald-500/80 text-white`;
            case "blocked":
                return `${base} bg-rose-500/80 text-white`;
            case "in progress":
            default:
                return `${base} bg-blue-500/80 text-white`;
        }
    }, [status]);

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
                    <Ticket01 className="size-4" aria-hidden />
                    <div className="flex-1">
                        <div className="text-sm opacity-75">Currently Working On</div>
                        <h3 className="mt-1 leading-tight font-medium">{projectTitle}</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">{ticketKey}</span>
                            <span data-slot="badge" className={statusClass}>
                                {status}
                            </span>
                        </div>
                    </div>
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

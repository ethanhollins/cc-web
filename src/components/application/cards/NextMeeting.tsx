"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clock, MarkerPin01, VideoRecorder } from "@untitledui/icons";
import { Card } from "./Card";
import { CardHeader } from "./CardHeader";

type Props = {
    meetingTitle: string;
    startTimeISO: string; // e.g. "2025-10-06T14:00:00"
    durationMinutes: number; // e.g. 60
    locationLabel?: string; // e.g. "Zoom"
    joinUrl: string;
    nextUp?: { title: string; time: string; location: string }[]; // e.g. [{ title: "Design Sync", time: "3:00pm", location: "Zoom" }, ...]
};

export default function NextMeetingCard({ meetingTitle, startTimeISO, durationMinutes, locationLabel = "Zoom", joinUrl, nextUp = [] }: Props) {
    const start = useMemo(() => new Date(startTimeISO), [startTimeISO]);
    const end = useMemo(() => new Date(start.getTime() + durationMinutes * 60_000), [start, durationMinutes]);

    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const msUntil = start.getTime() - now.getTime();
    const hasStarted = msUntil <= 0;
    const isOver = now.getTime() > end.getTime();

    const countdown = formatDuration(Math.max(0, msUntil));

    const timeLabel = start.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
    const durLabel = `(${Math.round(durationMinutes / 60) || 1} hour${
        durationMinutes === 60 ? "" : durationMinutes % 60 === 0 ? "" : " " + (durationMinutes % 60) + "m"
    })`;
    const disableJoin = msUntil > 5 * 60_000; // disable if more than 5 minutes away

    return (
        <Card className="my-[10px]">
            <CardHeader title="Next Meeting" className="text-yellow-900" headerIcon={<VideoRecorder className="size-5 text-yellow-500" />}></CardHeader>
            <div className="px-5">
                <div className="flex flex-row items-center gap-8">
                    <div className="min-w-0 flex-1">
                        {/* Title */}
                        <h3 className="text-l my-3 font-semibold tracking-tight text-black">{meetingTitle}</h3>

                        {/* Meta */}
                        <div className="mb-3 flex flex-col flex-wrap gap-x-6 gap-y-2 text-gray-700">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span className="text-md">{timeLabel}</span>
                                <span className="text-md text-gray-500"> {durLabel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MarkerPin01 className="size-4" />
                                <span className="mb-0.5 text-md">{locationLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Countdown + Button */}
                <div className="min-w-[260px] flex-shrink-0 rounded-2xl bg-gray-100">
                    <div className="flex flex-col items-center justify-center gap-4 p-3">
                        <div className="flex w-full flex-row items-baseline justify-between">
                            <p className="ml-5 flex-1 text-md font-medium text-gray-600">{isOver ? "Ended" : hasStarted ? "Started" : "Starts in"}</p>
                            <p className="flex-2 text-center text-3xl font-semibold tracking-tight text-gray-900">
                                {isOver ? "—" : hasStarted ? "Now" : countdown}
                            </p>
                        </div>

                        {disableJoin ? (
                            <span
                                rel="noreferrer"
                                className={`inline-flex w-[100%] items-center justify-center gap-2 rounded-xl px-3 py-2 text-base font-semibold shadow-sm focus:ring-2 focus:ring-gray-400 focus:outline-none ${msUntil > 5 * 60_000 ? "cursor-not-allowed bg-gray-300 text-gray-400 hover:bg-gray-300" : "bg-black text-white hover:bg-gray-900"}`}
                                aria-disabled={disableJoin}
                            >
                                <VideoRecorder className="size-4" />
                                {hasStarted && !isOver ? "Join Meeting" : "Join Meeting"}
                            </span>
                        ) : (
                            <a
                                href={joinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex w-[100%] items-center justify-center gap-2 rounded-xl px-3 py-2 text-base font-semibold shadow-sm focus:ring-2 focus:ring-gray-400 focus:outline-none ${msUntil > 5 * 60_000 ? "cursor-not-allowed bg-gray-300 text-gray-400 hover:bg-gray-300" : "bg-black text-white hover:bg-gray-900"}`}
                                aria-disabled={disableJoin}
                            >
                                <VideoRecorder className="size-4" />
                                {hasStarted && !isOver ? "Join Meeting" : "Join Meeting"}
                            </a>
                        )}
                    </div>
                </div>

                {/* Next Up List */}
                <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Next Up</p>
                    {nextUp.length === 0 ? (
                        <div className="flex h-16 items-center justify-center">
                            <span className="text-sm font-medium text-gray-400">No more meetings</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {nextUp.map((meeting, idx) => (
                                <li key={idx} className="grid grid-cols-3 items-center gap-2 rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-600">
                                    <span className="truncate font-medium text-gray-900">{meeting.title}</span>
                                    <span className="text-center">{meeting.time}</span>
                                    <span className="text-right text-gray-500">{meeting.location}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Card>
    );
}

function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clock, MarkerPin01, VideoRecorder } from "@untitledui/icons";
import { Card } from "./Card";
import { CardHeader } from "./CardHeader";

// Import TicketEvent type from parent component
export interface TicketEvent {
    ticket_id: string;
    ticket_key: string;
    ticket_type: string;
    title: string;
    ticket_status: string;
    epic?: string;
    project_id?: string;
    project?: any;
    notion_url?: string;
    colour?: string;
    google_id?: string;
    scheduled_date?: string;
    meeting_url?: string;
    meeting_platform?: "google_meet" | "zoom" | "teams" | "other";
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    all_day?: boolean;
    google_calendar_id: string;
}

type Props = {
    events: TicketEvent[];
};

export default function NextMeetingCard({ events }: Props) {
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Filter events to only include meetings (those with meeting_url) for today
    const todayMeetings = useMemo(() => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        return events
            .filter((event) => event.meeting_url) // Only events with meeting URLs
            .filter((event) => {
                const eventStart = new Date(event.start_date);
                return eventStart >= startOfDay && eventStart < endOfDay;
            })
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }, [events]);

    // Find current and next meetings
    const { currentMeeting, nextMeeting, remainingMeetings } = useMemo(() => {
        let current = null;
        let next = null;
        const remaining = [];

        for (const meeting of todayMeetings) {
            const start = new Date(meeting.start_date);
            const end = new Date(meeting.end_date);
            const isOngoing = now >= start && now <= end;
            const isPast = now > end;
            const isFuture = now < start;

            if (isOngoing) {
                current = meeting;
            } else if (isFuture && !next) {
                next = meeting;
                // Also add the next meeting to remaining so it shows in "Next Up" list
                remaining.push(meeting);
            } else if (isFuture) {
                remaining.push(meeting);
            }
        }

        return { currentMeeting: current, nextMeeting: next, remainingMeetings: remaining };
    }, [todayMeetings, now]);

    // Determine what to display
    const displayMeeting = currentMeeting || nextMeeting;
    const hasNoMeetings = !displayMeeting;

    // Default values for when there are no meetings
    const start = displayMeeting ? new Date(displayMeeting.start_date) : new Date();
    const end = displayMeeting ? new Date(displayMeeting.end_date) : new Date();
    const durationMinutes = displayMeeting ? Math.round((end.getTime() - start.getTime()) / 60_000) : 0;

    const msUntil = displayMeeting ? start.getTime() - now.getTime() : 0;
    const hasStarted = displayMeeting ? msUntil <= 0 : false;
    const isOver = displayMeeting ? now.getTime() > end.getTime() : false;
    const isCurrentMeeting = currentMeeting !== null;

    const countdown = displayMeeting ? formatDuration(Math.max(0, msUntil)) : "";

    const timeLabel = displayMeeting
        ? start.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
          })
        : "—";
    const durLabel = displayMeeting
        ? `(${Math.round(durationMinutes / 60) || 1} hour${durationMinutes === 60 ? "" : durationMinutes % 60 === 0 ? "" : " " + (durationMinutes % 60) + "m"})`
        : "";
    const disableJoin = hasNoMeetings || (displayMeeting && msUntil > 5 * 60_000); // disable if no meetings or more than 5 minutes away

    const locationLabel = hasNoMeetings
        ? "No meetings"
        : (() => {
              const platform = displayMeeting!.meeting_platform;
              console.log("Meeting platform:", platform); // Debug log

              switch (platform) {
                  case "google_meet":
                      return "Google Meet";
                  case "zoom":
                      return "Zoom";
                  case "teams":
                      return "Teams";
                  case "other":
                      return "Meeting";
                  default:
                      return platform || "Meeting";
              }
          })();

    return (
        <Card className="my-[10px]">
            <CardHeader title="Next Meeting" className="text-yellow-900" headerIcon={<VideoRecorder className="size-5 text-yellow-500" />}></CardHeader>
            <div className="px-5">
                <div className="flex flex-row items-center gap-8">
                    <div className="min-w-0 flex-1">
                        {/* Title */}
                        <h3 className="text-l my-3 font-semibold tracking-tight text-black">
                            {hasNoMeetings ? "No more meetings today" : displayMeeting!.title}
                        </h3>

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
                            <p className="ml-5 flex-1 text-md font-medium text-gray-600">
                                {hasNoMeetings ? "Status" : isOver ? "Ended" : isCurrentMeeting ? "Started" : "Starts in"}
                            </p>
                            <p className="flex-2 text-center text-3xl font-semibold tracking-tight text-gray-900">
                                {hasNoMeetings ? "—" : isOver ? "—" : isCurrentMeeting ? "Now" : countdown}
                            </p>
                        </div>

                        {/* Show next meeting info when current meeting is running */}
                        {isCurrentMeeting && nextMeeting && (
                            <div className="w-full text-center">
                                <p className="text-sm text-gray-500">
                                    {formatDuration(Math.max(0, new Date(nextMeeting.start_date).getTime() - now.getTime()))} until {nextMeeting.title}
                                </p>
                            </div>
                        )}

                        {disableJoin || hasNoMeetings ? (
                            <span
                                className="inline-flex w-[100%] cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-300 px-3 py-2 text-base font-semibold text-gray-400 shadow-sm hover:bg-gray-300"
                                aria-disabled={true}
                            >
                                <VideoRecorder className="size-4" />
                                {hasNoMeetings ? "No Meeting" : "Join Meeting"}
                            </span>
                        ) : (
                            <a
                                href={displayMeeting!.meeting_url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-[100%] items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-gray-900 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            >
                                <VideoRecorder className="size-4" />
                                Join Meeting
                            </a>
                        )}
                    </div>
                </div>

                {/* Next Up List */}
                <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Next Up</p>
                    {remainingMeetings.length === 0 ? (
                        <div className="flex h-16 items-center justify-center">
                            <span className="text-sm font-medium text-gray-400">No more meetings today</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {remainingMeetings.map((meeting, idx) => {
                                const meetingStart = new Date(meeting.start_date);
                                const platform =
                                    meeting.meeting_platform === "google_meet"
                                        ? "Google Meet"
                                        : meeting.meeting_platform === "zoom"
                                          ? "Zoom"
                                          : meeting.meeting_platform === "teams"
                                            ? "Teams"
                                            : "Meeting";

                                return (
                                    <li
                                        key={meeting.ticket_id || idx}
                                        className="grid grid-cols-3 items-center gap-2 rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-600"
                                    >
                                        <span className="truncate font-medium text-gray-900">{meeting.title}</span>
                                        <span className="text-center">
                                            {meetingStart.toLocaleTimeString([], {
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        <span className="text-right text-gray-500">{platform}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </Card>
    );
}

function formatDuration(ms: number) {
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
        // Always show seconds if it's the only unit or if > 0
        parts.push(`${String(seconds).padStart(2, "0")}s`);
    }

    return parts.join(" ");
}

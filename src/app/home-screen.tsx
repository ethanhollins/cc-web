"use client";

import { useState } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import { CalendarCheck01, Home03, Package } from "@untitledui/icons";
import moment from "moment-timezone";
import JustInTimeCover from "@/components/application/JustInTimeCover";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import DayCalendar from "@/components/application/calendars/DayCalendar";
import NextMeetingCard from "@/components/application/cards/NextMeeting";
import { JournalSection } from "@/components/application/journal/JournalSection";
import TicketModal from "@/components/application/modals/TicketModal";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useProjects } from "@/hooks/use-projects";
import { handleDeleteEvent, handleEventChange, handleEventDrop } from "@/utils/calendar-event-handlers";

export type Project = {
    project_id: string;
    project_key: string;
    project_status: string;
    notion_id: string;
    title: string;
    colour?: string;
};

export type TicketType = "task" | "story" | "bug" | "epic" | "subtask" | "event";

export type TicketStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Blocked" | "Ongoing" | "Done" | "Removed";

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
    meeting_url?: string;
    meeting_platform?: "google_meet" | "zoom" | "teams" | "other";
};

export interface TicketEvent extends Ticket {
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    google_calendar_id: string;
    all_day?: boolean;
    completed?: boolean;
}

export const HomeScreen = () => {
    const [openedTicket, setOpenedTicket] = useState<Ticket | null>(null);
    const [openedEventId, setOpenedEventId] = useState<string | null>(null);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date>(startOfDay);

    // Use shared hooks
    const { projects } = useProjects();
    const { events, updateEvents } = useCalendarEvents(calendarSelectedDate);

    const handleDateChange = (selectDate: Date) => {
        const selectedDay = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());
        setCalendarSelectedDate(selectedDay);
    };

    const handleEventClick = (eventId: string) => {
        console.log("Event clicked:", eventId);
        const event = eventId ? events.find((e) => e.google_id === eventId) : null;
        setOpenedTicket(event || null);
        setOpenedEventId(eventId); // Store the google_id that was passed in
    };

    const handleEventDropWrapper = (dropInfo: any) => {
        handleEventDrop(dropInfo, updateEvents);
    };

    const handleEventChangeWrapper = (resizeInfo: any) => {
        handleEventChange(resizeInfo, updateEvents);
    };

    const handleDeleteEventWrapper = (eventId: string) => {
        handleDeleteEvent(eventId, events, updateEvents);
    };

    return (
        <div className="fullscreen flex h-[100%] flex-col bg-white">
            <SidebarNavigationSlim
                activeUrl="/"
                items={[
                    { label: "Home", icon: Home03, href: "/" },
                    { label: "Planner", icon: CalendarCheck01, href: "/planner" },
                    { label: "Projects", icon: Package, href: "/projects" },
                ]}
            />
            <div className="pt-2s ml-[68px] flex min-h-0 flex-1 flex-col bg-white px-4 pt-2">
                <div className="h-[33%]">
                    <JustInTimeCover events={events} />
                </div>
                <div className="flex h-[67%] flex-1">
                    <DayCalendar
                        events={events.map((event) => {
                            const calendarEvent: EventInput = {
                                id: event.google_id,
                                title: event.title,
                                start: moment(event.start_date).tz("Australia/Sydney").format(),
                                end: moment(event.end_date).tz("Australia/Sydney").format(),
                                allDay: event.all_day,
                                extendedProps: {
                                    showBand: event.epic !== null && event.epic !== "" && event.epic !== undefined,
                                    bandColor: event.colour,
                                    ticket_id: event.ticket_id,
                                    ticket_key: event.ticket_key,
                                    ticket_status: event.ticket_status,
                                    google_calendar_id: event.google_calendar_id,
                                    completed: event.completed || false,
                                    project: event.project || projects.find((p) => p.project_id === event.project_id),
                                },
                            };
                            return calendarEvent;
                        })}
                        onDateChange={handleDateChange}
                        onEventClick={handleEventClick}
                        onEventDrop={handleEventDropWrapper}
                        onEventChange={handleEventChangeWrapper}
                        onDeleteEvent={handleDeleteEventWrapper}
                        onUpdateEvents={updateEvents}
                    />
                    <div className="flex flex-1 justify-between">
                        <div className="flex flex-col justify-between">
                            <NextMeetingCard events={events} />
                        </div>
                        <div className="flex flex-1">
                            <JournalSection />
                        </div>
                    </div>
                </div>
            </div>
            <TicketModal
                open={openedTicket !== null}
                onClose={() => {
                    setOpenedTicket(null);
                    setOpenedEventId(null);
                }}
                ticketId={openedTicket?.ticket_id || null}
                eventId={openedEventId}
                events={events}
                onEventUpdate={updateEvents}
            />
        </div>
    );
};

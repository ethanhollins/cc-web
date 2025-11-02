"use client";

import { useState } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import { CalendarCheck01, Home03, Package } from "@untitledui/icons";
import moment from "moment-timezone";
import JustInTimeCover from "@/components/application/JustInTimeCover";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import DayCalendar from "@/components/application/calendars/DayCalendar";
import NextMeetingCard from "@/components/application/cards/NextMeeting";
import NotificationsCard from "@/components/application/cards/NotificationsCard";
import TicketsCard from "@/components/application/cards/TicketsCard";
import TicketModal from "@/components/application/modals/TicketModal";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useProjects } from "@/hooks/use-projects";
import { useTickets } from "@/hooks/use-tickets";
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

export const HomeScreen = () => {
    const [openedTicket, setOpenedTicket] = useState<Ticket | null>(null);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date>(startOfDay);

    // Use shared hooks
    const { events, updateEvents } = useCalendarEvents(calendarSelectedDate);
    const { projects, selectedProjectKey, selectProject } = useProjects();
    const { tickets, updateTickets } = useTickets(selectedProjectKey, projects);

    const handleProjectChange = (key: string) => {
        selectProject(key);
    };

    const handleDateChange = (selectDate: Date) => {
        const selectedDay = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());
        setCalendarSelectedDate(selectedDay);
    };

    const handleEventClick = (eventId: string) => {
        console.log("Event clicked:", eventId);
        const ticket = eventId ? events.find((e) => e.ticket_id === eventId) : null;
        setOpenedTicket(ticket || null);
    };

    const handleTicketClick = (ticket: Ticket) => {
        setOpenedTicket(ticket);
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
        <div className="fullscreen flex h-[100%] flex-col">
            <SidebarNavigationSlim
                activeUrl="/"
                items={[
                    { label: "Home", icon: Home03, href: "/" },
                    { label: "Planner", icon: CalendarCheck01, href: "/planner" },
                    { label: "Projects", icon: Package, href: "/projects" },
                ]}
            />
            <div className="pt-2s ml-[68px] flex min-h-0 flex-1 flex-col px-4 pt-2">
                <div className="h-[33%] flex-1">
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
                    />
                    <div className="flex flex-1 justify-between">
                        <div className="flex flex-col justify-between">
                            <NotificationsCard
                                items={[
                                    {
                                        id: "1",
                                        type: "ticket",
                                        title: "PROJ-1235 assigned to you",
                                        timeAgo: "5 min ago",
                                        unread: true,
                                    },
                                    {
                                        id: "2",
                                        type: "chat",
                                        title: "John Doe messages you",
                                        timeAgo: "12 min ago",
                                        unread: true,
                                    },
                                    {
                                        id: "3",
                                        type: "mail",
                                        title: "Weekly team update",
                                        timeAgo: "1 hour ago",
                                        unread: false,
                                    },
                                    {
                                        id: "4",
                                        type: "mail",
                                        title: "Weekly team update",
                                        timeAgo: "1 hour ago",
                                        unread: false,
                                    },
                                    {
                                        id: "5",
                                        type: "mail",
                                        title: "Weekly team update",
                                        timeAgo: "1 hour ago",
                                        unread: false,
                                    },
                                    {
                                        id: "6",
                                        type: "mail",
                                        title: "Weekly team update",
                                        timeAgo: "1 hour ago",
                                        unread: false,
                                    },
                                    {
                                        id: "7",
                                        type: "mail",
                                        title: "Weekly team update",
                                        timeAgo: "1 hour ago",
                                        unread: false,
                                    },
                                    {
                                        id: "8",
                                        type: "mail",
                                        title: "Weekly team update",
                                        timeAgo: "1 hour ago",
                                        unread: false,
                                    },
                                ]}
                                newCount={2}
                            />
                            <TicketsCard
                                projects={projects}
                                items={tickets}
                                selectedProjectKey={selectedProjectKey}
                                onProjectChange={handleProjectChange}
                                onItemClick={handleTicketClick}
                            />
                        </div>
                        <div className="flex flex-col justify-between">
                            <NextMeetingCard
                                meetingTitle="Product Planning Session"
                                startTimeISO={new Date(new Date().getTime() + 6 * 60 * 1000).toISOString()}
                                durationMinutes={60}
                                locationLabel="Google Meet"
                                joinUrl="https://meet.google.com/"
                                nextUp={[
                                    { title: "Design Sync", time: "3:00pm", location: "Zoom" },
                                    { title: "Sprint Planning", time: "4:30pm", location: "Teams" },
                                    { title: "Client Call", time: "6:00pm", location: "Google Meet" },
                                    { title: "Retrospective", time: "Tomorrow", location: "Zoom" },
                                    { title: "Retrospective", time: "Tomorrow", location: "Zoom" },
                                    { title: "Retrospective", time: "Tomorrow", location: "Zoom" },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <TicketModal open={openedTicket !== null} onClose={() => setOpenedTicket(null)} ticketId={openedTicket?.ticket_id || null} />
        </div>
    );
};

"use client";

import { useState } from "react";
import { EventInput } from "@fullcalendar/core/index.js";
import { CalendarCheck01, Home03, Lightbulb04, Package } from "@untitledui/icons";
import moment from "moment-timezone";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import WeekCalendar from "@/components/application/calendars/WeekCalendar";
import TicketModal from "@/components/application/modals/TicketModal";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useProjects } from "@/hooks/use-projects";
import { useTickets } from "@/hooks/use-tickets";
import { handleDeleteEvent, handleEventChange, handleEventDrop } from "@/utils/calendar-event-handlers";
import { Ticket } from "../home-screen";

const PlannerScreen = () => {
    const [openedTicket, setOpenedTicket] = useState<Ticket | null>(null);
    const [openedEventId, setOpenedEventId] = useState<string | null>(null);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date>(startOfDay);

    // Use shared hooks
    const { events, updateEvents } = useCalendarEvents(calendarSelectedDate);
    const { projects, selectedProjectKey, selectProject } = useProjects();
    const { tickets, updateTickets } = useTickets(selectedProjectKey, projects);

    const handleDateChange = (date: Date) => {
        console.log("Date changed to:", date);
        setCalendarSelectedDate(date);
    };

    const handleEventClick = (eventId: string) => {
        console.log("Event clicked:", eventId);
        const event = eventId ? events.find((e) => e.google_id === eventId) : null;
        setOpenedTicket(event || null);
        setOpenedEventId(eventId); // Store the google_id that was passed in
    };

    const handleProjectChange = (projectKey: string) => {
        selectProject(projectKey);
    };

    const handleTicketClick = (ticket: Ticket) => {
        setOpenedTicket(ticket);
        setOpenedEventId(null); // Clear event ID when opening from ticket list (not from calendar event)
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

    const handleScheduleTicketWrapper = (ticketId: string, scheduledDate: string) => {
        // Update the local ticket state to reflect the scheduled date
        if (selectedProjectKey && tickets[selectedProjectKey]) {
            const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
                ticket.ticket_id === ticketId ? { ...ticket, scheduled_date: scheduledDate } : ticket,
            );
            updateTickets(selectedProjectKey, updatedTickets);
        }
    };

    const handleUnscheduleTicketWrapper = (ticketId: string) => {
        // Update the local ticket state to remove the scheduled date
        if (selectedProjectKey && tickets[selectedProjectKey]) {
            const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
                ticket.ticket_id === ticketId ? { ...ticket, scheduled_date: undefined } : ticket,
            );
            updateTickets(selectedProjectKey, updatedTickets);
        }
    };

    const handleCreateTicketWrapper = (createdTicket: Ticket, projectKey: string) => {
        // Update the local ticket state to add the new ticket from API response
        if (tickets[projectKey]) {
            const updatedTickets = [...tickets[projectKey], createdTicket];
            updateTickets(projectKey, updatedTickets);
        }
    };

    return (
        <div className="fullscreen flex h-[100%] flex-col">
            <SidebarNavigationSlim
                activeUrl="/planner"
                items={[
                    { label: "Home", icon: Home03, href: "/" },
                    { label: "Planner", icon: CalendarCheck01, href: "/planner" },
                    { label: "Projects", icon: Package, href: "/projects" },
                    { label: "Skills", icon: Lightbulb04, href: "/skills" },
                ]}
            />
            <div className="ml-[68px] flex min-h-0 flex-1 flex-col px-4">
                <WeekCalendar
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
                    tickets={tickets}
                    projects={projects}
                    selectedProjectKey={selectedProjectKey}
                    onDateChange={handleDateChange}
                    onEventClick={handleEventClick}
                    onProjectChange={handleProjectChange}
                    onTicketClick={handleTicketClick}
                    onScheduleTicket={handleScheduleTicketWrapper}
                    onUnscheduleTicket={handleUnscheduleTicketWrapper}
                    onEventDrop={handleEventDropWrapper}
                    onEventChange={handleEventChangeWrapper}
                    onDeleteEvent={handleDeleteEventWrapper}
                    onCreateTicket={handleCreateTicketWrapper}
                    onUpdateEvents={updateEvents}
                />
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

export default PlannerScreen;

import type { EventInput } from "@fullcalendar/core";
import moment from "moment-timezone";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";

/**
 * Transform calendar events from API format to FullCalendar format
 */

export function transformEventsToCalendarFormat(events: CalendarEvent[], projects: Project[]): EventInput[] {
  // Determine, for each ticket, which event has the latest end time so that
  // we can restrict yield icon rendering to that final instance.
  const latestEventByTicket = new Map<string, { endTime: number; eventId: string }>();

  events.forEach((event) => {
    const ticketId = event.ticket_id;
    if (!ticketId || !event.end_date) return;

    const endTime = new Date(event.end_date).getTime();
    const current = latestEventByTicket.get(ticketId);

    if (!current || endTime > current.endTime) {
      latestEventByTicket.set(ticketId, { endTime, eventId: event.google_id });
    }
  });

  return events.map((event) => {
    const isLatestForTicket = latestEventByTicket.get(event.ticket_id)?.eventId === event.google_id;

    const calendarEvent: EventInput = {
      id: event.google_id,
      title: event.title,
      start: moment(event.start_date).tz("Australia/Sydney").format(),
      end: moment(event.end_date).tz("Australia/Sydney").format(),
      allDay: event.all_day,
      classNames: [],
      extendedProps: {
        showBand: event.epic !== null && event.epic !== "" && event.epic !== undefined,
        bandColor: event.colour,
        ticket_id: event.ticket_id,
        ticket_key: event.ticket_key,
        ticket_status: event.ticket_status,
        google_calendar_id: event.google_calendar_id,
        completed: event.completed || false,
        project: event.project || projects.find((p) => p.project_id === event.project_id),
        score: event.score,
        yields: event.yields,
        // Only the latest-ending event for a given ticket should show yields.
        showYieldsOnEvent: isLatestForTicket,
      },
    };

    return calendarEvent;
  });
}

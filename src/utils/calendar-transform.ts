import type { EventInput } from "@fullcalendar/core";
import moment from "moment-timezone";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";

/**
 * Transform calendar events from API format to FullCalendar format
 */

export function transformEventsToCalendarFormat(events: CalendarEvent[], projects: Project[]): EventInput[] {
  return events.map((event) => {
    const calendarEvent: EventInput = {
      id: event.google_id,
      title: event.title,
      start: moment(event.start_date).tz("Australia/Sydney").format(),
      end: moment(event.end_date).tz("Australia/Sydney").format(),
      allDay: event.all_day,
      editable: !event.isOptimistic, // Disable editing for optimistic events
      extendedProps: {
        showBand: event.epic !== null && event.epic !== "" && event.epic !== undefined,
        bandColor: event.colour,
        ticket_id: event.ticket_id,
        ticket_key: event.ticket_key,
        ticket_status: event.ticket_status,
        google_calendar_id: event.google_calendar_id,
        completed: event.completed || false,
        project: event.project || projects.find((p) => p.project_id === event.project_id),
        isOptimistic: event.isOptimistic,
      },
    };

    return calendarEvent;
  });
}

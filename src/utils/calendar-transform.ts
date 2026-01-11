import type { EventInput } from "@fullcalendar/core";
import moment from "moment-timezone";
import type { CalendarEvent } from "@/types/calendar";
import type { Project } from "@/types/project";
import type { Ticket } from "@/types/ticket";

/**
 * Transform calendar events from API format to FullCalendar format
 */

export function transformEventsToCalendarFormat(events: CalendarEvent[], projects: Project[], allTickets: Record<string, Ticket[]> = {}): EventInput[] {
  return events.map((event) => {
    // Find the ticket for this event to get epic information
    let epicColor: string | undefined;
    let ticket: Ticket | undefined;

    if (event.ticket_id) {
      const project = projects.find((p) => p.project_id === event.project_id);
      const projectTickets = allTickets[project?.project_key || ""];
      // Search through all project tickets to find the ticket
      ticket = projectTickets?.find((t) => t.ticket_id === event.ticket_id);

      // If ticket has an epic, find the epic ticket to get its color
      let epicTicket: Ticket | undefined;
      if (ticket?.epic_id) {
        // Find epic by ticket_id or legacy notion_id
        epicTicket = projectTickets.find((t) => ticket?.epic_id === t.ticket_id || ticket?.epic_id === t.notion_id);
        epicColor = epicTicket?.colour;
      }
    }

    const calendarEvent: EventInput = {
      id: event.google_id,
      title: event.title,
      start: moment(event.start_date).tz("Australia/Sydney").format(),
      end: moment(event.end_date).tz("Australia/Sydney").format(),
      allDay: event.all_day,
      editable: !event.isOptimistic, // Disable editing for optimistic events
      extendedProps: {
        showBand: event.epic || event.epic_id,
        bandColor: epicColor, // Epic's color for the band
        ticket_id: event.ticket_id,
        ticket_key: event.ticket_key,
        ticket_status: event.ticket_status,
        google_calendar_id: event.google_calendar_id,
        completed: event.completed || false,
        project: event.project || projects.find((p) => p.project_id === event.project_id),
        isOptimistic: event.isOptimistic,
        is_break: event.is_break,
        epic_id: ticket?.epic_id,
        epic: ticket?.epic,
      },
    };

    return calendarEvent;
  });
}

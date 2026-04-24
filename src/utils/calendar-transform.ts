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
    // Detect event type using new event_type field, falling back to legacy is_break
    const isBreak = event.event_type === "break" || event.is_break === true;
    const isMarker = event.event_type === "marker";

    // Find the ticket for this event to get epic information
    let epicColor: string | undefined;
    let ticket: Ticket | undefined;

    if (event.ticket_id && !isBreak && !isMarker) {
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

    // Markers: render as background events at the point in time with a 5-minute display window
    if (isMarker) {
      const markerStart = moment(event.start_date).tz("Australia/Sydney").format();
      // Use a 5-minute window so the bar is visible but thin
      const markerEnd = moment(event.start_date).add(5, "minutes").tz("Australia/Sydney").format();
      const markerColour = event.marker_colour || event.colour || "#2563eb";

      return {
        id: event.google_id,
        title: event.title,
        start: markerStart,
        end: markerEnd,
        display: "background",
        backgroundColor: markerColour,
        classNames: ["event-marker"],
        editable: false,
        extendedProps: {
          is_marker: true,
          event_type: "marker" as const,
          marker_colour: markerColour,
          google_calendar_id: event.google_calendar_id,
        },
      } as EventInput;
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
        is_break: isBreak,
        event_type: event.event_type,
        epic_id: ticket?.epic_id,
        epic: ticket?.epic,
      },
    };

    return calendarEvent;
  });
}

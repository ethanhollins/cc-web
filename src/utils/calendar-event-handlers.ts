import moment from "moment-timezone";
import { Ticket, TicketEvent } from "@/app/home-screen";

const DEFAULT_CALENDAR_ID = "ethanjohol@gmail.com";

/**
 * Handle event drop (ticket dragged onto calendar)
 */
export async function handleEventDrop(dropInfo: any, updateEvents: (updater: (prevEvents: TicketEvent[]) => TicketEvent[]) => void) {
    console.log("Event dropped:", dropInfo);
    console.log("Ticket:", dropInfo.ticket);
    console.log("Drop date:", dropInfo.date);
    console.log("Drop date ISO:", dropInfo.date.toISOString());

    const ticket = dropInfo.ticket;
    if (ticket === null) return;

    // Take the UTC date and replace timezone to Australia/Sydney
    const sydneyStartDate = moment(dropInfo.dateStr).tz("Australia/Sydney").format();
    const sydneyEndDate = moment(dropInfo.dateStr).tz("Australia/Sydney").add(30, "minutes").format();

    // Create a new event from the dropped ticket
    const newEvent: TicketEvent = {
        ticket_id: ticket.ticket_id,
        ticket_key: ticket.ticket_key,
        ticket_type: ticket.ticket_type,
        title: ticket.title,
        ticket_status: ticket.ticket_status,
        project: ticket.project,
        start_date: sydneyStartDate,
        end_date: sydneyEndDate,
        colour: ticket.colour,
        epic: ticket.epic,
        google_calendar_id: DEFAULT_CALENDAR_ID,
    };

    try {
        const response = await fetch("https://iwuzz82ao4.execute-api.ap-southeast-2.amazonaws.com/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                calendar_id: DEFAULT_CALENDAR_ID,
                start_date: sydneyStartDate,
                end_date: sydneyEndDate,
                ticket_data: {
                    ticket_id: ticket.ticket_id,
                    title: ticket.title,
                },
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create event");
        }

        const res = await response.json();
        console.log("Created event:", res);

        // Add the new event to the events list
        updateEvents((prev) => [...prev, { ...newEvent, google_id: res.event_id }]);
    } catch (error) {
        console.error("Error creating event:", error);
    }
}

/**
 * Handle event resize/change (event duration or time changed)
 */
export async function handleEventChange(resizeInfo: any, updateEvents: (updater: (prevEvents: TicketEvent[]) => TicketEvent[]) => void) {
    console.log("Event resized:", resizeInfo);

    const startDateStr = resizeInfo.startDate.slice(0, 19); // Get YYYY-MM-DDTHH:mm:ss
    const endDateStr = resizeInfo.endDate.slice(0, 19);
    const sydneyStartDate = moment(startDateStr).tz("Australia/Sydney").format();
    const sydneyEndDate = moment(endDateStr).tz("Australia/Sydney").format();
    console.log("Sydney Start Date:", sydneyStartDate, "Sydney End Date:", sydneyEndDate);

    try {
        const response = await fetch(`https://iwuzz82ao4.execute-api.ap-southeast-2.amazonaws.com/events/${resizeInfo.eventId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                calendar_id: resizeInfo.google_calendar_id,
                start_date: sydneyStartDate,
                end_date: sydneyEndDate,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update event");
        }

        const res = await response.json();
        console.log("Updated event:", res);

        // Update the event in the events list
        updateEvents((prev) =>
            prev.map((e) =>
                e.google_id === resizeInfo.eventId
                    ? {
                          ...e,
                          start_date: sydneyStartDate,
                          end_date: sydneyEndDate,
                      }
                    : e,
            ),
        );
    } catch (error) {
        console.error("Error updating event:", error);
    }
}

/**
 * Handle ticket scheduling
 */
export async function handleScheduleTicket(ticketId: string, scheduledDate: string) {
    console.log("Scheduling ticket:", ticketId, "for date:", scheduledDate);

    try {
        const response = await fetch(`https://iwuzz82ao4.execute-api.ap-southeast-2.amazonaws.com/tickets/${ticketId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                scheduled_date: scheduledDate,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to schedule ticket");
        }

        const result = await response.json();
        console.log("Successfully scheduled ticket:", result);
        return result;
    } catch (error) {
        console.error("Error scheduling ticket:", error);
        throw error;
    }
}

/**
 * Handle event deletion
 */
export async function handleDeleteEvent(eventId: string, events: TicketEvent[], updateEvents: (updater: (prevEvents: TicketEvent[]) => TicketEvent[]) => void) {
    console.log("Delete event requested for:", eventId);

    // Find the event to get the google_id
    const event = events.find((e) => e.google_id === eventId);
    if (!event?.google_id) return;

    try {
        const response = await fetch(`https://iwuzz82ao4.execute-api.ap-southeast-2.amazonaws.com/events/${event.google_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ calendar_id: event.google_calendar_id }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete event");
        }

        console.log("Deleted event:", eventId);

        // Remove the event from the events list
        updateEvents((prev) => prev.filter((e) => e.google_id !== eventId));
    } catch (error) {
        console.error("Error deleting event:", error);
    }
}

/**
 * Skills API – Calendar Events interface
 *
 * High-level wrappers around the host application's calendar event API calls.
 * Skills import from @skills-api rather than calling the raw API client directly.
 */

import { fetchEvents, createEvent, updateEvent, deleteEvent } from "@/api/calendar";
import type { CalendarEvent } from "@/types/calendar";
import type { SkillEvent, CreateEventPayload, UpdateEventPayload } from "./types";

function mapToSkillEvent(raw: CalendarEvent): SkillEvent {
  return {
    id: raw.google_id ?? "",
    title: raw.title,
    startDate: raw.start_date,
    endDate: raw.end_date,
    projectId: raw.project_id,
    ticketId: raw.ticket_id,
    colour: raw.colour,
    isBreak: raw.is_break,
  };
}

/**
 * Fetch calendar events within the given date range.
 *
 * @param startDate - ISO date string for the start of the range
 * @param endDate   - ISO date string for the end of the range
 */
export async function getEvents(startDate: string, endDate: string): Promise<SkillEvent[]> {
  const response = await fetchEvents(startDate, endDate);
  return (response.events ?? []).map(mapToSkillEvent);
}

/**
 * Create a new calendar event linked to a ticket.
 *
 * @param payload - Event creation payload
 * @returns The id of the newly created event
 */
export async function createSkillEvent(payload: CreateEventPayload): Promise<{ eventId: string }> {
  const result = await createEvent({
    calendar_id: payload.calendarId,
    start_date: payload.startDate,
    end_date: payload.endDate,
    ticket_data: {
      ticket_id: payload.ticketId,
      title: payload.title,
    },
  });
  return { eventId: result.event_id };
}

/**
 * Update an existing calendar event.
 *
 * @param eventId - The google_id of the event
 * @param updates - Fields to update
 */
export async function updateSkillEvent(eventId: string, updates: UpdateEventPayload): Promise<void> {
  await updateEvent(eventId, {
    start_date: updates.startDate,
    end_date: updates.endDate,
    title: updates.title,
    colour: updates.colour,
  });
}

/**
 * Delete a calendar event.
 *
 * @param eventId    - The google_id of the event
 * @param calendarId - The calendar the event belongs to
 */
export async function deleteSkillEvent(eventId: string, calendarId: string): Promise<void> {
  await deleteEvent(eventId, calendarId);
}

import type { EventsResponse } from "@/types/calendar";
import { apiClient } from "./client";

/**
 * API functions for calendar events
 */

export async function fetchEvents(startDate: string, endDate: string, signal?: AbortSignal): Promise<EventsResponse> {
  const response = await apiClient.get("/events", { params: { start_date: startDate, end_date: endDate }, signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  return response.data as EventsResponse;
}

export async function updateEvent(
  eventId: string,
  updates: {
    start_date?: string;
    end_date?: string;
    title?: string;
    calendar_id?: string;
  },
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiClient.patch(`/events/${eventId}`, updates, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to update event: ${response.status}`);
  }
}

export async function createEvent(
  eventData: {
    calendar_id: string;
    start_date: string;
    end_date: string;
    ticket_data: {
      ticket_id: string;
      title: string;
    };
  },
  signal?: AbortSignal,
): Promise<{ event_id: string }> {
  const response = await apiClient.post("/events", eventData, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to create event: ${response.status}`);
  }

  return response.data as { event_id: string };
}

export async function deleteEvent(eventId: string, calendarId: string, signal?: AbortSignal): Promise<void> {
  const response = await apiClient.delete(`/events/${eventId}`, {
    data: { calendar_id: calendarId },
    signal,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to delete event: ${response.status}`);
  }
}

export async function createBreak(
  breakData: {
    title: string;
    start_date: string;
    end_date: string;
    calendar_id?: string;
  },
  signal?: AbortSignal,
): Promise<{ event_id: string }> {
  const response = await apiClient.post("/events/breaks", breakData, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to create break: ${response.status}`);
  }

  return response.data as { event_id: string };
}

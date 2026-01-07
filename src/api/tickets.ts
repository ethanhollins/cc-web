import type { Ticket, TicketsResponse } from "@/types/ticket";
import { apiClient } from "./client";

export const DEFAULT_CALENDAR_ID = "ethanjohol@gmail.com";

/**
 * API functions for tickets
 */

export async function fetchTickets(projectId: string, signal?: AbortSignal): Promise<TicketsResponse> {
  const response = await apiClient.get(`/projects/${projectId}/tickets`, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch tickets: ${response.status}`);
  }

  return response.data as TicketsResponse;
}

// TODO: Extend payload to support scheduled tickets and calendar events
export async function createTicket(
  data: {
    title: string;
    projectNotionId: string;
    internalProjectId: string;
    type?: string;
    scheduledDate?: string;
    startDate?: string;
    endDate?: string;
  },
  signal?: AbortSignal,
): Promise<Ticket> {
  const payload = {
    title: data.title,
    project_id: data.projectNotionId,
    internal_project_id: data.internalProjectId,
    // API expects capitalized type strings like "Task" / "Event"
    type: (data.type ?? "task").charAt(0).toUpperCase() + (data.type ?? "task").slice(1),
    ...(data.scheduledDate && { scheduled_date: data.scheduledDate }),
    ...(data.startDate &&
      data.endDate && {
        start_date: data.startDate,
        end_date: data.endDate,
        google_calendar_id: DEFAULT_CALENDAR_ID,
      }),
  };

  const response = await apiClient.post("/tickets", payload, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to create ticket: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function scheduleTicket(ticketId: string, scheduledDate: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      scheduled_date: scheduledDate,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to schedule ticket: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function unscheduleTicket(ticketId: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      scheduled_date: null,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to unschedule ticket: ${response.status}`);
  }

  return response.data as Ticket;
}

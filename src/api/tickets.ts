import type { Ticket, TicketDetailsResponse, TicketsResponse } from "@/types/ticket";
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

export async function createTicket(
  data: {
    title: string;
    description?: string;
    projectId: string;
    ticketType?: string;
    ticketStatus?: string;
    priority?: string;
    colour?: string;
    epicId?: string;
    scheduledDate?: string;
    startDate?: string;
    endDate?: string;
    googleCalendarId?: string;
  },
  signal?: AbortSignal,
): Promise<Ticket> {
  const payload = {
    title: data.title,
    ...(data.description && { description: data.description }),
    project_id: data.projectId,
    // Backend expects lowercase type strings and normalizes them
    ticket_type: (data.ticketType ?? "task").toLowerCase(),
    ...(data.ticketStatus && { ticket_status: data.ticketStatus }),
    ...(data.priority && { priority: data.priority.toLowerCase() }),
    ...(data.colour && { colour: data.colour }),
    ...(data.epicId && { epic_id: data.epicId }),
    ...(data.scheduledDate && { scheduled_date: data.scheduledDate }),
    ...(data.startDate && { start_date: data.startDate }),
    ...(data.endDate && { end_date: data.endDate }),
    ...(data.googleCalendarId && { google_calendar_id: data.googleCalendarId }),
  };

  const response = await apiClient.post("/tickets", payload, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to create ticket: ${response.status}`);
  }

  // API returns { ticket: <ticket data> }
  const responseData = response.data as { ticket: Ticket };
  return responseData.ticket;
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

export async function updateTicketStatus(ticketId: string, status: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      ticket_status: status,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket status: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function updateTicketType(ticketId: string, type: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      ticket_type: type,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket type: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function updateTicketProject(ticketId: string, projectId: string | null, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      project_id: projectId,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket project: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function updateTicketEpic(ticketId: string, epicId: string | null, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      epic_id: epicId,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket epic: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function updateTicketPriority(ticketId: string, priority: string | null, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      priority: priority,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket priority: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function updateTicketTitle(ticketId: string, title: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      title: title,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket title: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function updateTicketDescription(ticketId: string, description: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await apiClient.patch(
    `/tickets/${ticketId}`,
    {
      description: description,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update ticket description: ${response.status}`);
  }

  return response.data as Ticket;
}

export async function fetchTicketDetails(ticketId: string, signal?: AbortSignal): Promise<TicketDetailsResponse> {
  const response = await apiClient.get(`/tickets/${ticketId}/details`, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ticket details: ${response.status}`);
  }

  return response.data as TicketDetailsResponse;
}

export async function deleteTicket(ticketId: string, signal?: AbortSignal): Promise<void> {
  const response = await apiClient.delete(`/tickets/${ticketId}`, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to delete ticket: ${response.status}`);
  }
}

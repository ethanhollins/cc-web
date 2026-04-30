/**
 * Skills API – Tickets interface
 *
 * High-level wrappers around the host application's ticket API calls.
 * Skills import from @skills-api rather than calling the raw API client directly.
 */

import {
  fetchTickets,
  createTicket as apiCreateTicket,
  updateTicket as apiUpdateTicket,
  deleteTicket as apiDeleteTicket,
} from "@/api/tickets";
import type { SkillTicket, CreateTicketPayload, UpdateTicketPayload } from "./types";
import type { Ticket } from "@/types/ticket";

function mapToSkillTicket(raw: Ticket): SkillTicket {
  return {
    id: raw.ticket_id,
    key: raw.ticket_key,
    title: raw.title,
    status: raw.ticket_status,
    type: raw.ticket_type,
    projectId: raw.project_id,
    colour: raw.colour,
    priority: raw.priority,
    epicId: raw.epic_id,
    scheduledDate: raw.scheduled_date,
  };
}

/**
 * Fetch all tickets for the given project.
 *
 * @param projectId - The project_id to fetch tickets for
 */
export async function getTickets(projectId: string): Promise<SkillTicket[]> {
  const response = await fetchTickets(projectId);
  return (response.tickets ?? []).map(mapToSkillTicket);
}

/**
 * Create a new ticket.
 *
 * @param payload - Ticket creation payload
 * @returns The newly created ticket
 */
export async function createTicket(payload: CreateTicketPayload): Promise<SkillTicket> {
  const ticket = await apiCreateTicket({
    title: payload.title,
    projectId: payload.projectId,
    ticketType: payload.ticketType,
    ticketStatus: payload.ticketStatus,
    priority: payload.priority,
    colour: payload.colour,
    description: payload.description,
    epicId: payload.epicId,
    scheduledDate: payload.scheduledDate,
  });
  return mapToSkillTicket(ticket);
}

/**
 * Update one or more fields of an existing ticket in a single API call.
 *
 * @param ticketId - The ticket's unique id
 * @param updates  - Fields to update
 */
export async function updateTicket(ticketId: string, updates: UpdateTicketPayload): Promise<void> {
  await apiUpdateTicket(ticketId, {
    title: updates.title,
    description: updates.description,
    ticketStatus: updates.ticketStatus,
    ticketType: updates.ticketType,
    priority: updates.priority,
    epicId: updates.epicId,
    projectId: updates.projectId,
    scheduledDate: updates.scheduledDate,
  });
}

/**
 * Delete a ticket.
 *
 * @param ticketId - The ticket's unique id
 */
export async function deleteTicket(ticketId: string): Promise<void> {
  await apiDeleteTicket(ticketId);
}


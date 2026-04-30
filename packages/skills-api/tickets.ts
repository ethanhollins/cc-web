/**
 * Skills API – Tickets interface
 *
 * High-level wrappers around the host application's ticket API calls.
 * Skills import from @skills-api rather than calling the raw API client directly.
 */

import { fetchTickets, updateTicketStatus as apiUpdateTicketStatus } from "@/api/tickets";
import type { SkillTicket } from "./types";

function mapToSkillTicket(raw: {
  ticket_id: string;
  ticket_key: string;
  title: string;
  ticket_status: string;
  ticket_type: string;
  project_id?: string;
  colour?: string;
  priority?: string;
}): SkillTicket {
  return {
    id: raw.ticket_id,
    key: raw.ticket_key,
    title: raw.title,
    status: raw.ticket_status,
    type: raw.ticket_type,
    projectId: raw.project_id,
    colour: raw.colour,
    priority: raw.priority,
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
 * Update the status of a ticket.
 *
 * @param ticketId  - The ticket's unique id
 * @param newStatus - The new status to set
 */
export async function updateTicketStatus(ticketId: string, newStatus: string): Promise<void> {
  await apiUpdateTicketStatus(ticketId, newStatus);
}

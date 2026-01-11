import { useMemo } from "react";
import type { Ticket } from "@/types/ticket";

/**
 * Hook for getting epics from a list of tickets
 * Filters tickets by ticket_type === "epic" and optionally by project_id
 *
 * @param tickets - Array of tickets to filter
 * @param projectId - Optional project ID to filter epics by
 * @returns Object containing filtered epics array
 */
export function useEpics(tickets: Ticket[] | undefined, projectId?: string): { epics: Ticket[]; loading: boolean; error: string | null } {
  const epics = useMemo(() => {
    if (!tickets) {
      return [];
    }
    const filtered = tickets.filter((ticket) => {
      const isEpic = ticket.ticket_type?.toLowerCase() === "epic";
      const matchesProject = !projectId || ticket.project_id === projectId;
      return isEpic && matchesProject;
    });
    return filtered;
  }, [tickets, projectId]);

  return {
    epics,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get the epic display name for a ticket
 * Uses epic_id (ticket_id of epic) to find the epic ticket from tickets array
 * Falls back to legacy epic field (epic name) if epic_id doesn't resolve
 */
export function useEpicName(ticket: Ticket | undefined, tickets: Ticket[] | undefined): string | undefined {
  const { epics } = useEpics(tickets);

  if (!ticket) {
    return undefined;
  }

  // Try to find epic by epic_id first (preferred method)
  if (ticket.epic_id) {
    const epicTicket = epics.find((e) => e.ticket_id === ticket.epic_id);
    if (epicTicket) {
      return epicTicket.title;
    }
  }

  // Fallback to legacy epic field (epic name directly stored)
  if (ticket.epic) {
    return ticket.epic;
  }

  return undefined;
}

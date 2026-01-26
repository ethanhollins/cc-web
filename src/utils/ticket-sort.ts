import type { Ticket } from "@/types/ticket";

/**
 * Sort tickets by status priority, type, and ticket key
 * Order:
 * - Blocked tickets at the very top
 * - Active tickets (In Review → In Progress → Todo → Ongoing)
 * - Done tickets at the bottom
 * - Removed tickets below Done (very bottom)
 * - By type: Story → Task → Bug → Event
 * - Finally by ticket key
 */
export function sortTickets(list: Ticket[]): Ticket[] {
  const typeRank: Record<string, number> = {
    story: 0,
    task: 1,
    bug: 2,
    event: 3,
  };

  const statusRank: Record<string, number> = {
    "in review": 0,
    "in progress": 1,
    todo: 2,
    ongoing: 3,
    blocked: 4,
  };

  return [...list].sort((a, b) => {
    const aStatusLower = a.ticket_status?.toLowerCase();
    const bStatusLower = b.ticket_status?.toLowerCase();
    const aTypeLower = (a.ticket_type || "").toLowerCase();
    const bTypeLower = (b.ticket_type || "").toLowerCase();

    // Blocked tickets at the very top
    const aIsBlocked = aStatusLower === "blocked";
    const bIsBlocked = bStatusLower === "blocked";
    if (aIsBlocked && !bIsBlocked) return -1; // a is Blocked, goes to top
    if (!aIsBlocked && bIsBlocked) return 1; // b is Blocked, goes to top

    // Done and Removed tickets at the bottom (Removed below Done)
    const aIsDone = aStatusLower === "done";
    const bIsDone = bStatusLower === "done";
    const aIsRemoved = aStatusLower === "removed";
    const bIsRemoved = bStatusLower === "removed";

    if (aIsRemoved && !bIsRemoved) return 1; // a is Removed, goes to bottom
    if (!aIsRemoved && bIsRemoved) return -1; // b is Removed, goes to bottom
    if (aIsDone && !bIsDone && !bIsRemoved) return 1; // a is Done, goes below non-completed
    if (!aIsDone && bIsDone && !aIsRemoved) return -1; // b is Done, goes below non-completed

    // Then by type: Story, Task, Bug, Event
    const aTypeRank = typeRank[aTypeLower] ?? 999;
    const bTypeRank = typeRank[bTypeLower] ?? 999;
    if (aTypeRank !== bTypeRank) return aTypeRank - bTypeRank;

    // Then by status: In Review, In Progress, Todo, Ongoing, Blocked
    const aStatusRank = statusRank[aStatusLower] ?? 999;
    const bStatusRank = statusRank[bStatusLower] ?? 999;
    if (aStatusRank !== bStatusRank) return aStatusRank - bStatusRank;

    // Finally by ticket key
    if (!a.ticket_key && !b.ticket_key) return 0;
    if (!a.ticket_key) return 1;
    if (!b.ticket_key) return -1;
    return a.ticket_key.localeCompare(b.ticket_key);
  });
}

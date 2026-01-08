import type { Ticket } from "@/types/ticket";

/**
 * Sort tickets by Done status (last), type, status, and ticket key
 * Order:
 * - Done tickets at the bottom
 * - By type: Story → Task → Bug → Event
 * - By status: In Review → In Progress → Todo → Ongoing → Blocked
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
    const aStatusLower = a.ticket_status.toLowerCase();
    const bStatusLower = b.ticket_status.toLowerCase();
    const aTypeLower = (a.ticket_type || "").toLowerCase();
    const bTypeLower = (b.ticket_type || "").toLowerCase();

    // Done tickets at the bottom
    const aIsDone = aStatusLower === "done";
    const bIsDone = bStatusLower === "done";
    if (aIsDone !== bIsDone) return aIsDone ? 1 : -1;

    // Then by type: Story, Task, Bug, Event
    const aTypeRank = typeRank[aTypeLower] ?? 999;
    const bTypeRank = typeRank[bTypeLower] ?? 999;
    if (aTypeRank !== bTypeRank) return aTypeRank - bTypeRank;

    // Then by status: In Review, In Progress, Todo, Ongoing, Blocked
    const aStatusRank = statusRank[aStatusLower] ?? 999;
    const bStatusRank = statusRank[bStatusLower] ?? 999;
    if (aStatusRank !== bStatusRank) return aStatusRank - bStatusRank;

    // Finally by ticket key
    return a.ticket_key.localeCompare(b.ticket_key);
  });
}

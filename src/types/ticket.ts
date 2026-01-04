import type { Project } from "./project";

/**
 * Ticket type definitions
 */

export type TicketType = "task" | "story" | "bug" | "epic" | "subtask" | "event";

export type TicketStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Blocked" | "Ongoing" | "Done" | "Removed";

export type TicketYieldRarity = "common" | "uncommon" | "rare";

export interface TicketYield {
  id: string;
  label: string;
  /**
   * Path to the yield icon asset (e.g. /coaches/streak_yield.png).
   * This allows different surfaces (tickets, events, modals) to render
   * a consistent visual for the yield.
   */
  icon: string;
  rarity: TicketYieldRarity;
  /** How many of this yield the user has earned for this ticket/program. */
  count: number;
}

export interface Ticket {
  ticket_id: string;
  ticket_key: string;
  ticket_type: TicketType;
  title: string;
  ticket_status: TicketStatus;
  assignee?: string;
  epic?: string;
  project_id?: string;
  project?: Project;
  notion_url?: string;
  colour?: string;
  google_id?: string;
  scheduled_date?: string; // ISO date string for when ticket is scheduled
  meeting_url?: string;
  meeting_platform?: "google_meet" | "zoom" | "teams" | "other";
  priority?: string;
  created_time?: string;
  last_edited_time?: string;
  /** Optional coach score for this ticket when it is part of a coach-managed program. */
  score?: number;
  /** Optional yields awarded/associated with this ticket (coach-managed domains only). */
  yields?: TicketYield[];
}

export interface TicketsResponse {
  tickets: Ticket[];
}

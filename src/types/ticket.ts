import type { Project } from "./project";

/**
 * Ticket type definitions
 */

export type TicketType = "task" | "story" | "bug" | "epic" | "subtask" | "event";

export type TicketStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Blocked" | "Ongoing" | "Done" | "Removed";

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
  completion_date?: string; // ISO date string for when ticket was completed (Done/Removed only)
  meeting_url?: string;
  meeting_platform?: "google_meet" | "zoom" | "teams" | "other";
  priority?: string;
  created_time?: string;
  last_edited_time?: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
}

export interface TicketDetailsResponse {
  ticket: {
    ticket_id: string;
    title: string;
    project_id?: string;
    ticket_type: TicketType;
    ticket_status: TicketStatus;
    ticket_key: string;
    colour?: string;
    epic_id?: string;
    scheduled_date?: string;
    start_date?: string;
    end_date?: string;
    google_calendar_id?: string;
    completion_date?: string;
    description?: string;
    meeting_url?: string;
    meeting_platform?: "google_meet" | "zoom" | "teams" | "other";
  };
}

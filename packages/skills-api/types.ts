/**
 * Skills API – type definitions
 *
 * These types mirror the core app types but are re-exported here so skill
 * components only need to import from @skills-api rather than from the
 * internals of the host application.
 */

export interface SkillEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  projectId?: string;
  ticketId?: string;
  colour?: string;
  isBreak?: boolean;
}

export interface SkillTicket {
  id: string;
  key: string;
  title: string;
  status: string;
  type: string;
  projectId?: string;
  colour?: string;
  priority?: string;
  description?: string;
  epicId?: string;
  scheduledDate?: string;
}

export interface CreateTicketPayload {
  title: string;
  projectId: string;
  ticketType?: string;
  ticketStatus?: string;
  priority?: string;
  colour?: string;
  description?: string;
  epicId?: string;
  scheduledDate?: string;
}

export interface UpdateTicketPayload {
  title?: string;
  ticketStatus?: string;
  ticketType?: string;
  priority?: string;
  description?: string;
  epicId?: string;
  projectId?: string;
  scheduledDate?: string | null;
}

export interface CreateEventPayload {
  calendarId: string;
  startDate: string;
  endDate: string;
  ticketId: string;
  title: string;
}

export interface UpdateEventPayload {
  startDate?: string;
  endDate?: string;
  title?: string;
  colour?: string;
}

export interface SkillDataRecord {
  /** Required row identifier — the skill defines this */
  id: string;
  /** Flexible columns (NoSQL-style) */
  [key: string]: unknown;
}

export type SkillDataScope = "global" | "focus" | "skill";

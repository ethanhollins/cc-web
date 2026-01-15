import type { Project } from "./project";
import type { Ticket, TicketYield } from "./ticket";

/**
 * Calendar and event type definitions
 */

export interface CalendarEvent extends Ticket {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  google_calendar_id: string;
  all_day?: boolean;
  completed?: boolean;
  isOptimistic?: boolean;
  is_break?: boolean;
}

export interface EventsResponse {
  events: CalendarEvent[];
}

export interface BreakEvent {
  google_id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_break: true;
}

export interface CreateBreakResponse {
  break: BreakEvent;
}

export interface CalendarEventExtendedProps {
  showBand?: boolean;
  bandColor?: string;
  ticket_id?: string;
  ticket_key?: string;
  ticket_status?: string;
  google_calendar_id?: string;
  completed?: boolean;
  project?: Project;
  is_break?: boolean;
  epic?: string; // Legacy epic name
  epic_id?: string; // Epic ticket_id
  /** Optional coach score for events that come from coach-managed tickets. */
  score?: number;
  /** Optional yields associated with the underlying ticket/program. */
  yields?: TicketYield[];
  /**
   * Whether this particular calendar event instance should visually display
   * ticket yields. Used when a ticket has multiple events so that only the
   * latest-ending event shows the yield icons.
   */
  showYieldsOnEvent?: boolean;
}

export type CalendarView = "timeGridWeek" | "timeGridDay" | "dayGridMonth";

export interface CalendarViewConfig {
  initialView: CalendarView;
  headerToolbar?: boolean;
  allDaySlot?: boolean;
  slotMinTime?: string;
  slotMaxTime?: string;
  slotDuration?: string;
  expandRows?: boolean;
  stickyHeaderDates?: boolean;
  dayHeaderFormat?: { weekday: string; day: string; omitCommas: boolean };
  slotLabelFormat?: { hour: string; minute: string; meridiem: boolean };
}

export interface CalendarContextMenuState {
  show: boolean;
  x: number;
  y: number;
  eventId: string | null;
  date: Date | null;
}

export interface CalendarDatePickerState {
  show: boolean;
  x: number;
  y: number;
  onSelect?: (date: Date) => void;
}

export type CalendarResizeArg = {
  event: {
    id: string;
    start: Date | null;
    end: Date | null;
    extendedProps?: {
      google_calendar_id?: string;
    };
  };
  revert: () => void;
};

import type { Project } from "./project";
import type { Ticket } from "./ticket";

/**
 * Calendar and event type definitions
 */

export type EventType = "standard" | "break" | "marker";

export interface CalendarEvent extends Ticket {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  google_calendar_id: string;
  all_day?: boolean;
  completed?: boolean;
  isOptimistic?: boolean;
  is_break?: boolean; // Legacy field – prefer event_type
  event_type?: EventType; // New field replacing is_break
  marker_colour?: string; // Marker colour (default blue)
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
  event_type?: "break";
}

export interface CreateBreakResponse {
  break: BreakEvent;
}

export interface MarkerEvent {
  google_id: string;
  title: string;
  start_date: string;
  end_date: string;
  event_type: "marker";
  colour?: string;
}

export interface CreateMarkerResponse {
  marker: MarkerEvent;
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
  is_marker?: boolean;
  event_type?: EventType;
  marker_colour?: string;
  epic?: string; // Legacy epic name
  epic_id?: string; // Epic ticket_id
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

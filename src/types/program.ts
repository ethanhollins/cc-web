import type { Ticket } from "./ticket";

export interface ProgramMilestone {
  id: string;
  /** Human-readable label for the milestone, e.g. "Week 1 - Establish baseline". */
  title: string;
  /** Optional short description of the milestone focus for that week. */
  description?: string;
  /** Week index within the program (1-based, 1-4 weeks). */
  weekNumber: number;
  /** Optional list of tickets that belong to this milestone. */
  tickets?: Ticket[];
}

export interface ProgramStateSnapshot {
  /** Short headline describing the state, e.g. "Inconsistent training". */
  headline: string;
  /** Optional richer description of the state. */
  description?: string;
}

export interface CoachProgram {
  /** Program identifier from backend. */
  id: string;
  /** Title of the program, e.g. "2-Week Consistency Reset". */
  title: string;
  /** The primary coach running this program. */
  coachName: string;
  /** Optional image for the coach running this program. */
  coachImageSrc?: string;
  /** Domain or theme the program belongs to, e.g. "Training". */
  domain: string;
  /** Optional display label for when this program is due to complete. */
  dueDateLabel?: string;
  /** Optional list of yield icon image paths representing rewards from this program. */
  yieldIconPaths?: string[];
  /** High-level objective statement for the 2-4 week program. */
  objective: string;
  /** Snapshot of the user's current state before the program. */
  currentState: ProgramStateSnapshot;
  /** Target state the program is working toward. */
  targetState: ProgramStateSnapshot;
  /** Weekly milestone goals for the duration of the program. */
  milestones: ProgramMilestone[];
  /** Criteria that define when the program has been successful. */
  successCriteria: string[];
  /** Additional notes from the coach about the program. */
  coachNotes?: string;
}

export interface CoachProgramResponse {
  /** What the coach says back to the user in this turn. */
  message: string;
  /** Structured program data used to render the visual program view. */
  program: CoachProgram;
}

/**
 * @skills-api
 *
 * High-level library for skill components to interact with the host
 * application. Skills should import exclusively from this package rather
 * than reaching into the host application's internals.
 *
 * Modules:
 *   events     – Calendar event CRUD
 *   tickets    – Ticket read/update operations
 *   skill-data – Persistent NoSQL-style data storage (global/focus/skill scope)
 *   types      – Shared TypeScript types
 */

// Types
export type {
  SkillEvent,
  SkillTicket,
  CreateEventPayload,
  UpdateEventPayload,
  CreateTicketPayload,
  UpdateTicketPayload,
  SkillDataRecord,
  SkillDataScope,
} from "./types";

// Calendar events
export { getEvents, createSkillEvent, updateSkillEvent, deleteSkillEvent } from "./events";

// Tickets
export { getTickets, createTicket, updateTicket, deleteTicket } from "./tickets";

// Persistent data – global scope
export { getGlobalData, listGlobalData, setGlobalData, createGlobalData, updateGlobalData, deleteGlobalData } from "./skill-data";

// Persistent data – focus scope
export { getFocusData, listFocusData, setFocusData, createFocusData, updateFocusData, deleteFocusData } from "./skill-data";

// Persistent data – skill scope
export { getSkillData, listSkillData, setSkillData, createSkillData, updateSkillData, deleteSkillData } from "./skill-data";

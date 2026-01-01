import { Ticket } from "@/old/app/home-screen";

/**
 * Extended Ticket type with position for skills graph
 */
export type TicketWithPosition = Ticket & {
  position?: { x: number; y: number };
};

/**
 * Mock tickets for skills graph
 */
export const MOCK_TICKETS_FOR_SKILLS: TicketWithPosition[] = [
  {
    ticket_id: "ticket-1",
    ticket_key: "CC-101",
    ticket_type: "task",
    title: "Implement RAG system for documentation",
    ticket_status: "In Progress",
    project_id: "proj-1",
    colour: "#3b82f6",
    position: { x: 808, y: -56 },
  },
  {
    ticket_id: "ticket-2",
    ticket_key: "CC-102",
    ticket_type: "story",
    title: "Research prompt engineering patterns",
    ticket_status: "Done",
    project_id: "proj-1",
    colour: "#10b981",
    position: { x: 640, y: 174 },
  },
  {
    ticket_id: "ticket-3",
    ticket_key: "CC-103",
    ticket_type: "task",
    title: "Build AI-powered code review assistant",
    ticket_status: "Todo",
    project_id: "proj-1",
    colour: "#3b82f6",
    position: { x: 1342, y: -147 },
  },
  {
    ticket_id: "ticket-4",
    ticket_key: "CC-201",
    ticket_type: "epic",
    title: "Rebuild frontend architecture with Next.js",
    ticket_status: "In Progress",
    project_id: "proj-2",
    colour: "#8b5cf6",
    position: { x: 436, y: 360 },
  },
  {
    ticket_id: "ticket-5",
    ticket_key: "CC-202",
    ticket_type: "task",
    title: "Implement real-time data synchronization",
    ticket_status: "In Review",
    project_id: "proj-2",
    colour: "#3b82f6",
    position: { x: 984, y: 330 },
  },
  {
    ticket_id: "ticket-6",
    ticket_key: "CC-301",
    ticket_type: "story",
    title: "Conduct user interviews for feature validation",
    ticket_status: "In Progress",
    project_id: "proj-3",
    colour: "#10b981",
    position: { x: 1317, y: 484 },
  },
];

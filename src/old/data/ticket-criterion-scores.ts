import { TicketCriterionScore } from "@/types/skills";

/**
 * Maps ticket IDs to their criterion scores
 * Each ticket can contribute scores to multiple criteria
 */
export const TICKET_CRITERION_SCORES: Record<string, TicketCriterionScore[]> = {
    // Ticket 1: Implement RAG system - Foundation stage for Generative AI
    "ticket-1": [
        { criterion_id: "f1", criterion_name: "Theoretical Understanding", score: 35 },
        { criterion_id: "f2", criterion_name: "Tool Familiarity", score: 40 },
    ],

    // Ticket 2: Research prompt engineering - Foundation stage for Generative AI
    "ticket-2": [
        { criterion_id: "f1", criterion_name: "Theoretical Understanding", score: 35 },
        { criterion_id: "f2", criterion_name: "Tool Familiarity", score: 30 },
        { criterion_id: "f3", criterion_name: "Problem Recognition", score: 30 },
    ],

    // Ticket 3: AI code review assistant - Practitioner stage for Generative AI
    "ticket-3": [
        { criterion_id: "p1", criterion_name: "Implementation Skills", score: 30 },
        { criterion_id: "p2", criterion_name: "Prompt Engineering", score: 25 },
    ],

    // Ticket 4: Rebuild frontend - Foundation stage for Full-Stack Engineering
    "ticket-4": [
        { criterion_id: "fs-f1", criterion_name: "Core Technologies", score: 40 },
        { criterion_id: "fs-f2", criterion_name: "Development Workflow", score: 35 },
    ],

    // Ticket 5: Real-time sync - Practitioner stage for Full-Stack Engineering
    "ticket-5": [
        { criterion_id: "fs-p1", criterion_name: "Architecture Patterns", score: 35 },
        { criterion_id: "fs-p2", criterion_name: "Performance Optimization", score: 30 },
    ],

    // Ticket 6: User interviews - Foundation stage for Product Management
    "ticket-6": [
        { criterion_id: "pm-f1", criterion_name: "User Research", score: 25 },
        { criterion_id: "pm-f2", criterion_name: "Requirements Gathering", score: 20 },
    ],
};

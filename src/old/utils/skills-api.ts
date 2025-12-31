/**
 * Skills API Client
 * Handles all API calls for skills, objectives, and skill graph operations
 */
import { API_BASE_URL } from "@/config/api";
import { Objective, Skill } from "@/types/skills";

// Generic SQS response type
type SQSResponse = {
    message: string;
    request_id?: string;
};

// API Response types
type AssessmentCriterion = {
    criterion_id: string;
    criterion_name: string;
    criterion_description: string;
    total_score: number;
};

type StageData = {
    stage_requirements: string[];
    assessment_rubric: AssessmentCriterion[];
};

type SkillAPIResponse = {
    skill_id: string;
    node_id: string;
    node_type: "mastery" | "objective";
    name: string;
    stages?: Record<string, StageData>;
};

type GetAllSkillsResponse = {
    skills: SkillAPIResponse[];
};

type GetSkillResponse = {
    skill: SkillAPIResponse;
};

type GetSkillGraphResponse = {
    skill_graph: {
        nodes: Array<{
            node_id: string;
            skill_id: string;
            node_type: "mastery" | "objective" | "stage" | "ticket";
            ticket_id?: string;
            ticket_data?: any;
            linked_stages?: string[];
            scores?: Array<{ criterion_id: string; score: number }>;
            node_position: {
                x: number;
                y: number;
            };
        }>;
    };
};

/**
 * Get all skills and objectives
 */
export async function getAllSkills(): Promise<GetAllSkillsResponse> {
    const response = await fetch(`${API_BASE_URL}/skill`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to get skills: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Create a new skill or objective
 */
export async function createSkill(data: { name: string; type: "mastery" | "objective"; prompt: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/skill`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to create skill: ${response.statusText}`);
    }
}

/**
 * Get a skill by ID
 */
export async function getSkill(skillId: string): Promise<GetSkillResponse> {
    const response = await fetch(`${API_BASE_URL}/skill/${skillId}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to get skill: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Update a skill
 */
export async function updateSkill(skillId: string, data: Partial<Skill | Objective>): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/skill/${skillId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update skill: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Delete a skill
 */
export async function deleteSkill(skillId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/skill/${skillId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete skill: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get skill graph (all nodes and their positions)
 */
export async function getSkillGraph(skillId: string): Promise<GetSkillGraphResponse> {
    const response = await fetch(`${API_BASE_URL}/skill/${skillId}/graph`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to get skill graph: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Link a ticket to a skill/stage
 */
/**
 * Search for tickets
 */
export async function searchTickets(query: string, limit: number = 10): Promise<{ tickets: any[] }> {
    const response = await fetch(`${API_BASE_URL}/tickets/search?q=${encodeURIComponent(query)}&limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to search tickets: ${response.statusText}`);
    }

    return response.json();
}

export async function linkTicketToSkill(data: { skill_id: string; stage_id: string; ticket_id: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/skill/ticket/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to link ticket to skill: ${response.statusText}`);
    }
}

/**
 * Unlink a ticket from a skill/stage
 */
export async function unlinkTicketFromSkill(skillId: string, stageId: string, ticketId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/skill/${skillId}/stage/${stageId}/ticket/${ticketId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to unlink ticket from skill: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Update ticket positions (batched)
 * @deprecated Use updateNodePositions instead
 */
export async function updateTicketPositions(
    skillId: string,
    ticketPositions: Array<{ ticket_id: string; position: { x: number; y: number } }>,
): Promise<{ message: string }> {
    // Convert to node format
    const nodePositions = ticketPositions.map((t) => ({
        node_id: t.ticket_id,
        node_position: t.position,
    }));

    const response = await fetch(`${API_BASE_URL}/skill/${skillId}/node/position`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ node_positions: nodePositions }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update ticket positions: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Update node positions (all types: tickets, stages, skills, objectives)
 */
export async function updateNodePositions(
    skillId: string,
    nodePositions: Array<{ node_id: string; node_type?: string; position: { x: number; y: number } }>,
): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/skill/${skillId}/node/position`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ node_positions: nodePositions.map((n) => ({ node_id: n.node_id, node_position: n.position })) }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update node positions: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Transform skill graph API responses to frontend types
 */
import { Ticket } from "@/old/app/home-screen";
import { Objective, Skill, SkillStage, SkillStageNode } from "@/old/types/skills";

// Graph node from API
export type GraphNodeAPI = {
    node_id: string;
    skill_id: string;
    node_type: "mastery" | "objective" | "stage" | "ticket";
    ticket_id?: string;
    ticket_data?: any;
    linked_stages?: string[];
    scores?: Array<{ criterion_id: string; score: number }>;
    current_stage?: string; // Current stage for mastery skills
    node_position: {
        x: number;
        y: number;
    };
};

/**
 * Normalize stage name from API format to frontend format
 */
function normalizeStage(stage: string): SkillStage {
    const stageMap: Record<string, SkillStage> = {
        foundation: "Foundation",
        practitioner: "Practitioner",
        expert: "Expert",
        authority: "Authority",
        master: "Master",
    };
    return stageMap[stage.toLowerCase()] || "Foundation";
}

/**
 * Transform graph stage node from API to frontend SkillStageNode
 */
function transformStageNode(node: GraphNodeAPI, parentSkillName: string): SkillStageNode {
    // Try to extract stage from linked_stages if available, or parse from node_id
    let stageName: SkillStage = "Foundation";

    // Check if we have stage information in the node
    // The backend might include stage info in the node_id or as a separate field
    if (node.linked_stages && node.linked_stages.length > 0) {
        // If linked_stages contains the stage name
        stageName = normalizeStage(node.linked_stages[0]);
    } else {
        // Try to extract from node_id (e.g., "stage-foundation-xxx")
        const parts = node.node_id.toLowerCase().split("-");
        const stageKeywords = ["foundation", "practitioner", "expert", "authority", "master"];
        const foundStage = parts.find((part) => stageKeywords.includes(part));
        if (foundStage) {
            stageName = normalizeStage(foundStage);
        }
    }

    // Get connected ticket IDs - these should be in linked_stages or we need to find them from the graph
    const connectedTicketIds: string[] = [];
    // Note: The actual ticket connections should be determined by looking at which tickets
    // have this stage node as their target. This might need to be handled at a higher level.

    return {
        stage_node_id: node.node_id,
        skill_id: node.skill_id,
        stage: stageName,
        name: stageName,
        description: undefined,
        progress: 0, // Calculate from tickets if needed
        connected_ticket_ids: connectedTicketIds,
        position: node.node_position || { x: 0, y: 0 },
    };
}

/**
 * Transform graph ticket node from API to frontend Ticket
 */
function transformTicketNode(node: GraphNodeAPI): Ticket | null {
    if (!node.ticket_data) {
        console.warn(`Ticket node ${node.node_id} has no ticket_data`);
        return null;
    }

    // Map ticket_data to Ticket type
    return {
        ticket_id: node.ticket_id || node.node_id,
        node_id: node.node_id,
        ticket_key: node.ticket_data.ticket_key || node.ticket_data.key || `TICKET-${node.ticket_id}`,
        ticket_type: node.ticket_data.ticket_type || "task",
        title: node.ticket_data.title || "Untitled Ticket",
        ticket_status: node.ticket_data.ticket_status || node.ticket_data.status || "Backlog",
        epic: node.ticket_data.epic,
        project_id: node.ticket_data.project_id,
        project: node.ticket_data.project,
        notion_url: node.ticket_data.notion_url,
        colour: node.ticket_data.colour || node.ticket_data.color,
        google_id: node.ticket_data.google_id,
        scheduled_date: node.ticket_data.scheduled_date,
        meeting_url: node.ticket_data.meeting_url,
        meeting_platform: node.ticket_data.meeting_platform,
        // Store additional data that might be useful
        position: node.node_position || { x: 0, y: 0 },
        linked_stages: node.linked_stages || [],
        ...(node.scores && {
            criterionScores: node.scores.map((s) => ({
                criterion_id: s.criterion_id,
                criterion_name: "",
                score: s.score,
            })),
        }),
    } as Ticket;
}

/**
 * Transform skill graph API response to frontend data structures
 */
export function transformSkillGraph(
    graphNodes: GraphNodeAPI[],
    skills: Skill[],
    objectives: Objective[],
): {
    skills: Skill[];
    objectives: Objective[];
    stageNodes: SkillStageNode[];
    tickets: Ticket[];
} {
    const resultSkills: Skill[] = [];
    const resultObjectives: Objective[] = [];
    const stageNodes: SkillStageNode[] = [];
    const tickets: Ticket[] = [];

    // Create a map of skill/objective names for stage node naming
    const skillNameMap = new Map<string, string>();
    skills.forEach((s) => skillNameMap.set(s.skill_id, s.name));
    objectives.forEach((o) => skillNameMap.set(o.skill_id, o.name));

    // First pass: collect all nodes by type
    const stageNodeMap = new Map<string, SkillStageNode>();
    const ticketMap = new Map<string, Ticket>();

    for (const node of graphNodes) {
        switch (node.node_type) {
            case "mastery": {
                // Find the matching skill and update its position and current_stage
                const skill = skills.find((s) => s.skill_id === node.skill_id);
                if (skill) {
                    const updates: Partial<Skill> = {
                        position: node.node_position || { x: 0, y: 0 },
                    };
                    // Update current_stage if provided in the graph node
                    if (node.current_stage) {
                        updates.current_stage = normalizeStage(node.current_stage);
                    }
                    resultSkills.push({
                        ...skill,
                        ...updates,
                    });
                }
                break;
            }
            case "objective": {
                // Find the matching objective and update its position
                const objective = objectives.find((o) => o.skill_id === node.skill_id);
                if (objective) {
                    resultObjectives.push({
                        ...objective,
                        position: node.node_position || { x: 0, y: 0 },
                    });
                }
                break;
            }
            case "stage": {
                const parentName = skillNameMap.get(node.skill_id) || "Skill";
                const stageNode = transformStageNode(node, parentName);
                stageNodeMap.set(stageNode.stage_node_id, stageNode);
                break;
            }
            case "ticket": {
                const ticket = transformTicketNode(node);
                if (ticket) {
                    ticketMap.set(ticket.ticket_id, ticket);
                }
                break;
            }
            default:
                console.warn(`Unknown node type: ${(node as any).node_type}`);
        }
    }

    // Second pass: build connections from linked_stages
    // linked_stages in a ticket node contains stage names (e.g., "foundation", "practitioner")
    console.log("Building ticket-stage connections...");
    for (const node of graphNodes) {
        if (node.node_type === "ticket" && node.linked_stages) {
            const ticket = ticketMap.get(node.ticket_id || node.node_id);
            console.log("Processing ticket connections:", {
                ticket_id: node.ticket_id,
                linked_stages: node.linked_stages,
                stageNodesAvailable: Array.from(stageNodeMap.values()).map((s) => ({ id: s.stage_node_id, stage: s.stage })),
            });
            if (ticket) {
                // For each stage name this ticket is linked to, find the matching stage node and add the ticket
                for (const stageName of node.linked_stages) {
                    const normalizedStageName = normalizeStage(stageName);
                    console.log("Looking for stage:", stageName, "normalized:", normalizedStageName);

                    // Check if this is an "assessment" stage for objectives
                    if (stageName.toLowerCase() === "assessment") {
                        // Find the objective with this skill_id
                        const objective = resultObjectives.find((o) => o.skill_id === node.skill_id);
                        if (objective) {
                            console.log("Adding ticket to objective:", ticket.ticket_id, "->", objective.skill_id);
                            if (!objective.connected_ticket_ids.includes(ticket.ticket_id)) {
                                objective.connected_ticket_ids.push(ticket.ticket_id);
                            }
                        }
                    } else {
                        // Find stage node by matching the stage field
                        for (const stageNode of stageNodeMap.values()) {
                            if (stageNode.stage === normalizedStageName) {
                                console.log("Match found! Adding ticket", ticket.ticket_id, "to stage", stageNode.stage_node_id);
                                if (!stageNode.connected_ticket_ids.includes(ticket.ticket_id)) {
                                    stageNode.connected_ticket_ids.push(ticket.ticket_id);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Convert maps to arrays
    stageNodes.push(...stageNodeMap.values());
    tickets.push(...ticketMap.values());

    return {
        skills: resultSkills,
        objectives: resultObjectives,
        stageNodes,
        tickets,
    };
}

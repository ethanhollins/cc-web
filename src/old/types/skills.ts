/**
 * Skills system types
 */

export type SkillType = "mastery" | "objective";

export type SkillStage = "Foundation" | "Practitioner" | "Expert" | "Authority" | "Master";

export type RubricCriterion = {
    criterion_id: string;
    name: string;
    description: string;
    weight?: number; // Optional weight for the criterion
    score?: number; // Current score/proficiency (0-100)
};

export type TicketCriterionScore = {
    criterion_id: string;
    criterion_name: string;
    score: number; // Score contributed by this ticket (0-100)
};

export type StageRubric = {
    stage: SkillStage;
    criteria: RubricCriterion[];
    requirements: string[]; // Additional requirements for this stage
    estimated_duration: string; // e.g., "6-12 months", "1-2 years"
};

export type ObjectiveRubric = {
    criteria: RubricCriterion[];
    requirements: string[]; // Requirements to achieve the objective
    estimated_duration: string; // e.g., "12-18 months"
};

export type Skill = {
    skill_id: string;
    skill_type: "mastery"; // Mastery skills have 5 stages
    name: string;
    description: string;
    current_stage: SkillStage;
    stage_progress: Record<SkillStage, number>; // Progress percentage (0-100) for each stage
    rubrics: StageRubric[];
    connected_stage_ids: string[]; // IDs of stage nodes connected to this skill
    created_at: string;
    updated_at: string;
    position?: { x: number; y: number }; // Position on the graph
    color?: string; // Visual color for the skill node
};

export type Objective = {
    skill_id: string;
    skill_type: "objective"; // Objectives have a single goal
    name: string;
    description: string;
    progress: number; // Progress percentage (0-100)
    rubric: ObjectiveRubric;
    connected_ticket_ids: string[]; // IDs of tickets connected directly to this objective
    is_achieved: boolean; // Whether the objective has been achieved
    created_at: string;
    updated_at: string;
    position?: { x: number; y: number }; // Position on the graph
    color?: string; // Visual color for the objective node
};

export type SkillStageNode = {
    stage_node_id: string;
    skill_id: string; // Parent skill this stage belongs to
    stage: SkillStage;
    name: string; // e.g., "Foundation - AI Basics"
    description?: string;
    progress: number; // Progress percentage (0-100)
    connected_ticket_ids: string[]; // IDs of tickets connected to this stage
    position?: { x: number; y: number }; // Position on the graph
};

export type SkillGraphNode = {
    id: string;
    type: "skill" | "objective" | "stage" | "ticket";
    data: Skill | Objective | SkillStageNode | any; // Skill, Objective, Stage, or Ticket data
    position: { x: number; y: number };
};

export type SkillGraphEdge = {
    id: string;
    source: string; // ticket_id, stage_id
    target: string; // stage_id, skill_id
    type?: string;
    data?: {
        criterionScores?: TicketCriterionScore[]; // Scores this ticket contributed to each criterion
    };
};

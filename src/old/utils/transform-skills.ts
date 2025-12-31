/**
 * Transform skills API responses to frontend types
 */
import { Objective, ObjectiveRubric, RubricCriterion, Skill, SkillStage, SkillStageNode, StageRubric } from "@/types/skills";

// API response types (matching backend structure)
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

export type SkillAPIResponse = {
    skill_id: string;
    node_id: string;
    node_type: "mastery" | "objective";
    name: string;
    stages?: Record<string, StageData>;
};

/**
 * Transform API criterion to frontend RubricCriterion
 */
function transformCriterion(apiCriterion: AssessmentCriterion): RubricCriterion {
    return {
        criterion_id: apiCriterion.criterion_id,
        name: apiCriterion.criterion_name,
        description: apiCriterion.criterion_description,
        weight: apiCriterion.total_score,
        score: 0, // Default score, will be updated based on tickets
    };
}

/**
 * Normalize stage name from API format (lowercase) to frontend format (Title Case)
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
 * Transform API mastery skill to frontend Skill type
 */
export function transformMasterySkill(apiSkill: SkillAPIResponse): Skill {
    if (!apiSkill.stages) {
        throw new Error("Mastery skill must have stages");
    }

    // Build stage rubrics
    const rubrics: StageRubric[] = Object.entries(apiSkill.stages).map(([stageName, stageData]) => ({
        stage: normalizeStage(stageName),
        criteria: stageData.assessment_rubric.map(transformCriterion),
        requirements: stageData.stage_requirements,
        estimated_duration: "TBD", // Backend doesn't provide this yet
    }));

    // Initialize stage progress (all at 0 initially)
    const stageProgress: Record<SkillStage, number> = {
        Foundation: 0,
        Practitioner: 0,
        Expert: 0,
        Authority: 0,
        Master: 0,
    };

    return {
        skill_id: apiSkill.skill_id,
        skill_type: "mastery",
        name: apiSkill.name,
        description: "", // Backend doesn't provide description yet
        current_stage: "Foundation", // Default to Foundation
        stage_progress: stageProgress,
        rubrics,
        connected_stage_ids: [], // Will be populated from graph data
        created_at: new Date().toISOString(), // Backend doesn't provide timestamps yet
        updated_at: new Date().toISOString(),
        position: { x: 0, y: 0 }, // Default position, will be updated from graph
        color: "#8b5cf6", // Default purple color
    };
}

/**
 * Transform API objective to frontend Objective type
 */
export function transformObjective(apiSkill: SkillAPIResponse): Objective {
    // For objectives, we'll use the first stage if available, or create a default rubric
    const firstStage = apiSkill.stages ? Object.values(apiSkill.stages)[0] : null;

    const rubric: ObjectiveRubric = {
        criteria: firstStage ? firstStage.assessment_rubric.map(transformCriterion) : [],
        requirements: firstStage ? firstStage.stage_requirements : [],
        estimated_duration: "TBD", // Backend doesn't provide this yet
    };

    return {
        skill_id: apiSkill.skill_id,
        skill_type: "objective",
        name: apiSkill.name,
        description: "", // Backend doesn't provide description yet
        progress: 0, // Default progress
        rubric,
        connected_ticket_ids: [], // Will be populated from graph data
        is_achieved: false, // Default to not achieved
        created_at: new Date().toISOString(), // Backend doesn't provide timestamps yet
        updated_at: new Date().toISOString(),
        position: { x: 0, y: 0 }, // Default position
        color: "#10b981", // Default green color
    };
}

/**
 * Transform API skill response to frontend Skill or Objective
 */
export function transformSkill(apiSkill: SkillAPIResponse): Skill | Objective {
    if (apiSkill.node_type === "mastery") {
        return transformMasterySkill(apiSkill);
    } else {
        return transformObjective(apiSkill);
    }
}

/**
 * Transform array of API skills to frontend skills and objectives
 */
export function transformSkills(apiSkills: SkillAPIResponse[]): {
    skills: Skill[];
    objectives: Objective[];
} {
    const skills: Skill[] = [];
    const objectives: Objective[] = [];

    for (const apiSkill of apiSkills) {
        try {
            const transformed = transformSkill(apiSkill);
            if (transformed.skill_type === "mastery") {
                skills.push(transformed as Skill);
            } else {
                objectives.push(transformed as Objective);
            }
        } catch (error) {
            console.error(`Failed to transform skill ${apiSkill.skill_id}:`, error);
        }
    }

    return { skills, objectives };
}

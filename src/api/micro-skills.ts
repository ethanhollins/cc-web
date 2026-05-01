import type { MicroSkill } from "@/types/skill";
import { apiClient } from "./client";

function isMicroSkill(value: unknown): value is MicroSkill {
  if (!value || typeof value !== "object") return false;
  const skill = value as Record<string, unknown>;

  return (
    typeof skill.skill_id === "string" &&
    typeof skill.project_id === "string" &&
    typeof skill.name === "string" &&
    (skill.description === undefined || typeof skill.description === "string")
  );
}

function normalizeMicroSkillsArray(value: unknown): MicroSkill[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isMicroSkill);
}

function normalizeMicroSkillsPayload(payload: unknown): MicroSkill[] {
  if (Array.isArray(payload)) {
    return normalizeMicroSkillsArray(payload);
  }

  if (payload && typeof payload === "object") {
    const value = payload as { micro_skills?: unknown; skills?: unknown; rows?: unknown };
    if (Array.isArray(value.micro_skills)) return normalizeMicroSkillsArray(value.micro_skills);
    if (Array.isArray(value.skills)) return normalizeMicroSkillsArray(value.skills);
    if (Array.isArray(value.rows)) return normalizeMicroSkillsArray(value.rows);
  }

  return [];
}

export async function fetchMicroSkills(projectId?: string, signal?: AbortSignal): Promise<MicroSkill[]> {
  const response = await apiClient.get("/micro-skills", {
    signal,
    params: projectId ? { project_id: projectId } : undefined,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch micro skills: ${response.status}`);
  }

  return normalizeMicroSkillsPayload(response.data);
}

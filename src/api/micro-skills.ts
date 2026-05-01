import type { MicroSkill } from "@/types/skill";
import { apiClient } from "./client";

function normalizeMicroSkillsPayload(payload: unknown): MicroSkill[] {
  if (Array.isArray(payload)) {
    return payload as MicroSkill[];
  }

  if (payload && typeof payload === "object") {
    const value = payload as { micro_skills?: unknown; skills?: unknown; rows?: unknown };
    if (Array.isArray(value.micro_skills)) return value.micro_skills as MicroSkill[];
    if (Array.isArray(value.skills)) return value.skills as MicroSkill[];
    if (Array.isArray(value.rows)) return value.rows as MicroSkill[];
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

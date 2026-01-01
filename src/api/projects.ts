import type { ProjectsResponse } from "@/types/project";
import { apiClient } from "./client";

/**
 * API functions for projects
 */

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectsResponse> {
  const response = await apiClient.get("/projects", { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  return response.data as ProjectsResponse;
}

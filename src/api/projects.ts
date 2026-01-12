import type { Project, ProjectsResponse } from "@/types/project";
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

export async function updateProjectTitle(projectId: string, title: string, signal?: AbortSignal): Promise<Project> {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    {
      title: title,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update project title: ${response.status}`);
  }

  return response.data as Project;
}

export async function updateProjectKey(projectId: string, projectKey: string, signal?: AbortSignal): Promise<Project> {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    {
      project_key: projectKey,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update project key: ${response.status}`);
  }

  return response.data as Project;
}

export async function updateProjectColor(projectId: string, color: string, signal?: AbortSignal): Promise<Project> {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    {
      colour: color,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update project color: ${response.status}`);
  }

  return response.data as Project;
}

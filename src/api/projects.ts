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

export async function createProject(
  data: {
    title: string;
    description?: string;
    colour?: string;
    projectStatus?: string;
    projectKey?: string;
  },
  signal?: AbortSignal,
): Promise<Project> {
  const payload = {
    title: data.title,
    ...(data.description && { description: data.description }),
    ...(data.colour && { colour: data.colour }),
    ...(data.projectStatus && { project_status: data.projectStatus }),
    ...(data.projectKey && { project_key: data.projectKey }),
  };

  const response = await apiClient.post("/projects", payload, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to create project: ${response.status}`);
  }

  return response.data as Project;
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

export async function updateProjectDescription(projectId: string, description: string, signal?: AbortSignal): Promise<Project> {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    {
      description: description,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update project description: ${response.status}`);
  }

  return response.data as Project;
}

export async function updateProjectStatus(projectId: string, status: string, signal?: AbortSignal): Promise<Project> {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    {
      project_status: status,
    },
    { signal },
  );

  if (response.status !== 200) {
    throw new Error(`Failed to update project status: ${response.status}`);
  }

  return response.data as Project;
}

export async function deleteProject(projectId: string, signal?: AbortSignal): Promise<void> {
  const response = await apiClient.delete(`/projects/${projectId}`, {
    data: { permanently_delete: true },
    signal,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to delete project: ${response.status}`);
  }
}

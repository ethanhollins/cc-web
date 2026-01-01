/**
 * Project type definitions
 */

export interface Project {
  project_id: string;
  project_key: string;
  project_status: string;
  notion_id: string;
  title: string;
  colour?: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

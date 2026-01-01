import { useEffect, useState } from "react";
import { fetchProjects } from "@/api/projects";
import type { Project } from "@/types/project";
import { isAbortError } from "@/utils/error-utils";

/**
 * Hook for managing projects data with caching
 * Provides project list and selected project state
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchProjects(ac.signal);
        const items = data.projects || [];

        console.debug("Projects:", items);

        setProjects(items);
        if (items.length && !selectedProjectKey) {
          setSelectedProjectKey(items[0].project_key); // select first project by default
        }
      } catch (err: unknown) {
        if (isAbortError(err)) {
          console.warn("Projects fetch canceled:", err);
          return;
        }
        console.error("Error fetching projects:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching projects");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    return () => ac.abort();
  }, [selectedProjectKey]);

  const selectProject = (projectKey: string) => {
    setSelectedProjectKey(projectKey);
  };

  return {
    projects,
    selectedProjectKey,
    loading,
    error,
    selectProject,
  };
}

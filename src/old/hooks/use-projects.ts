import { useEffect, useState } from "react";
import { Project } from "@/old/app/home-screen";
import { API_BASE_URL } from "@/old/config/api";

/**
 * Hook for managing projects data with caching
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects on mount
    const ac = new AbortController();
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/projects`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);

        const json = await res.json();
        const items = json.projects || [];
        console.log("Projects:", items);

        setProjects(items);
        if (items.length && !selectedProjectKey) {
          setSelectedProjectKey(items[0].project_key); // select first project by default
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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

import { useEffect, useState } from "react";
import { Project, Ticket } from "@/old/app/home-screen";
import { API_BASE_URL } from "@/old/config/api";

/**
 * Hook for managing project tickets with caching
 */
export function useTickets(selectedProjectKey: string | undefined, projects: Project[]) {
  const [tickets, setTickets] = useState<Record<string, Ticket[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tickets when selectedProjectKey changes
    const ac = new AbortController();

    const fetchTickets = async () => {
      if (!selectedProjectKey) return;

      try {
        setLoading(true);
        setError(null);

        const project = projects.find((p) => p.project_key === selectedProjectKey);
        if (!project) return;

        const res = await fetch(`${API_BASE_URL}/projects/${project.project_id}/tickets`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`);

        const json = await res.json();
        // API might return array or { items: [] }, handle both
        const items = json.tickets.map((ticket: any) => ({ ...ticket, project: project })) || [];
        console.log("Tickets:", selectedProjectKey, items);

        if (items.length) {
          setTickets((prev) => ({
            ...prev,
            [selectedProjectKey as string]: items,
          }));
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProjectKey) {
      fetchTickets();
    }
    return () => ac.abort();
  }, [selectedProjectKey, projects]);

  const updateTickets = (projectKey: string, newTickets: Ticket[]) => {
    setTickets((prev) => ({
      ...prev,
      [projectKey]: newTickets,
    }));
  };

  return {
    tickets,
    loading,
    error,
    updateTickets,
  };
}

import { useEffect, useState } from "react";
import { fetchTickets } from "@/api/tickets";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import type { Project } from "@/types/project";
import type { Ticket } from "@/types/ticket";
import { isAbortError } from "@/utils/error-utils";

/**
 * Hook for managing project tickets with caching
 * Fetches tickets when selected project changes
 */
export function useTickets(selectedProjectKey: string | undefined, projects: Project[]) {
  const [tickets, setTickets] = useState<Record<string, Ticket[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket integration: trigger ticket refetches when messages arrive
  const { lastMessage } = useWebSocketMessages();

  useEffect(() => {
    const ac = new AbortController();

    const loadTickets = async () => {
      if (!selectedProjectKey) return;

      try {
        setLoading(true);
        setError(null);

        const project = projects.find((p) => p.project_key === selectedProjectKey);
        if (!project) return;

        const data = await fetchTickets(project.project_id, ac.signal);
        const items = data.tickets.map((ticket) => ({ ...ticket, project })) || [];
        console.debug("Tickets:", selectedProjectKey, items);

        if (items.length) {
          setTickets((prev) => ({
            ...prev,
            [selectedProjectKey as string]: items,
          }));
        }
      } catch (err: unknown) {
        if (isAbortError(err)) {
          console.warn("Tickets fetch canceled:", err);
          return;
        }
        console.error("Error fetching tickets:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching tickets");
      } finally {
        setLoading(false);
      }
    };

    if (selectedProjectKey) {
      loadTickets();
    }
    return () => ac.abort();
  }, [selectedProjectKey, projects, lastMessage]);

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

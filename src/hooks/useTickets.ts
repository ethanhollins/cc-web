import { useCallback, useEffect, useState } from "react";
import { fetchTicketDetails, fetchTickets } from "@/api/tickets";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import type { Project } from "@/types/project";
import type { Ticket } from "@/types/ticket";
import { isAbortError } from "@/utils/error-utils";

export interface TicketDataResponse {
  title: string;
  ticket_key: string;
  ticket_status: string;
  ticket_type: string;
  epic: string;
  notion_url: string;
  assignee: string;
  priority: "Lowest" | "Low" | "Medium" | "High" | "Highest";
  created_time: string;
  last_edited_time: string;
  subtasks: string[];
  linked_tickets: string[];
  project_title: string;
  meeting_url?: string;
  meeting_platform?: "google_meet" | "zoom" | "teams" | "other";
}

export interface TicketContentResponse {
  content: string;
}

export interface DocumentHierarchyResponse {
  project: Array<{
    title: string;
    notion_url: string;
  }>;
  epic: Array<{
    title: string;
    notion_url: string;
  }>;
  ticket: Array<{
    title: string;
    notion_url: string;
  }>;
}

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

  /**
   * Fetch tickets for a specific project by ID and store them
   * Returns true if tickets were fetched, false if already cached
   */
  const fetchTicketsForProject = useCallback(
    async (projectId: string, signal?: AbortSignal): Promise<boolean> => {
      try {
        // Find the project to get its key
        const project = projects.find((p) => p.project_id === projectId);
        if (!project) {
          console.warn(`Project not found for ID: ${projectId}`);
          return false;
        }

        // Check if tickets are already cached using current state
        const isCached = await new Promise<boolean>((resolve) => {
          setTickets((prev) => {
            if (prev[project.project_key]) {
              console.debug(`Tickets already cached for project: ${project.project_key}`);
              resolve(true);
            } else {
              resolve(false);
            }
            return prev;
          });
        });

        if (isCached) {
          return false;
        }

        console.debug(`Fetching tickets for project: ${project.project_key} (${projectId})`);
        const data = await fetchTickets(projectId, signal);
        const items = data.tickets.map((ticket) => ({ ...ticket, project })) || [];

        if (items.length) {
          setTickets((prev) => ({
            ...prev,
            [project.project_key]: items,
          }));
        }

        return true;
      } catch (err: unknown) {
        if (isAbortError(err)) {
          console.warn("Tickets fetch canceled:", err);
          return false;
        }
        console.error(`Error fetching tickets for project ${projectId}:`, err);
        return false;
      }
    },
    [projects],
  );

  return {
    tickets,
    loading,
    error,
    updateTickets,
    fetchTicketsForProject,
  };
}

export function useTicketData(ticketId: string | null) {
  const [data, setData] = useState<TicketDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setData(null);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchTicketDetails(ticketId, controller.signal);
        // Map the detailed response to the expected format
        const ticketData = result.ticket;
        setData({
          title: ticketData.title,
          ticket_key: ticketData.ticket_key,
          ticket_status: ticketData.ticket_status,
          ticket_type: ticketData.ticket_type,
          epic: ticketData.epic_id || "",
          notion_url: "", // Not provided in this endpoint
          assignee: "", // Not provided in this endpoint
          priority: "Medium", // Not provided in this endpoint
          created_time: "", // Not provided in this endpoint
          last_edited_time: "", // Not provided in this endpoint
          subtasks: [], // Will be handled separately
          linked_tickets: [], // Will be handled separately
          project_title: "", // Not provided in this endpoint
          meeting_url: ticketData.meeting_url,
          meeting_platform: ticketData.meeting_platform,
        });
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error("Error fetching ticket data:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching ticket data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [ticketId]);

  return { data, loading, error };
}

export function useTicketContent(ticketId: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setContent(null);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchTicketDetails(ticketId, controller.signal);

        // Use description directly from API response
        const descriptionValue = result.ticket.description || null;
        setContent(descriptionValue);
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error("Error fetching ticket content:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching ticket content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    return () => controller.abort();
  }, [ticketId]);

  return { content, loading, error, setContent };
}

export function useTicketDocuments(ticketId: string | null) {
  const [documents, setDocuments] = useState<DocumentHierarchyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setDocuments(null);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Documents will be handled separately, return empty for now
        setDocuments({
          project: [],
          epic: [],
          ticket: [],
        });
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error("Error fetching ticket documents:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching ticket documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    return () => controller.abort();
  }, [ticketId]);

  return { documents, loading, error };
}

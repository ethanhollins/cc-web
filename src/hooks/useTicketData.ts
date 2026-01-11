import { useEffect, useState } from "react";
import { fetchTicketDetails } from "@/api/tickets";
import type { TicketDetailsResponse } from "@/types/ticket";
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

  return { content, loading, error };
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

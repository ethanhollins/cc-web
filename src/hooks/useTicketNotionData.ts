import { useEffect, useState } from "react";
import { fetchTicketDocuments, fetchTicketNotionContent, fetchTicketNotionData } from "@/api/ticket-notion";
import { isAbortError } from "@/utils/error-utils";

export interface TicketNotionResponse {
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

export function useTicketNotionData(ticketId: string | null) {
  const [data, setData] = useState<TicketNotionResponse | null>(null);
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

        const result = await fetchTicketNotionData(ticketId, controller.signal);
        setData(result);
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error("Error fetching ticket notion data:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching ticket notion data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [ticketId]);

  return { data, loading, error };
}

export function useTicketNotionContent(ticketId: string | null) {
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

        const result = await fetchTicketNotionContent(ticketId, controller.signal);

        if (result.content.startsWith("## Description\n\n")) {
          result.content = result.content.replace("## Description\n\n", "");
        }

        setContent(result.content);
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error("Error fetching ticket notion content:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching ticket notion content");
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

        const result = await fetchTicketDocuments(ticketId, controller.signal);
        setDocuments(result);
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

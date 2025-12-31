import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/old/config/api";

// API response type for the ticket notion data
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

// API response type for the ticket content
export interface TicketContentResponse {
    content: string;
}

// API response type for the ticket documents hierarchy
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
 * Hook to fetch ticket data from the Notion API
 */
export function useTicketNotionData(ticketId: string | null) {
    const [data, setData] = useState<TicketNotionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("useTicketNotionData called with ticketId:", ticketId);

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

                console.log("Fetching ticket notion data...");
                const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/notion`, {
                    signal: controller.signal,
                });
                console.log("Done.");

                if (!response.ok) {
                    throw new Error(`Failed to fetch ticket data: ${response.status}`);
                }

                const result = await response.json();
                console.log("Fetched ticket data:", result);
                setData(result);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Error fetching ticket notion data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [ticketId]);

    return { data, loading, error };
}

/**
 * Hook to fetch ticket description content from the Notion API
 */
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

                const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/notion/content`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch ticket content: ${response.status}`);
                }

                const result: TicketContentResponse = await response.json();
                // Remove leading ## Description\n\n if present
                if (result.content.startsWith("## Description\n\n")) {
                    result.content = result.content.replace("## Description\n\n", "");
                }
                setContent(result.content);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Error fetching ticket notion content:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();

        return () => {
            controller.abort();
        };
    }, [ticketId]);

    return { content, loading, error };
}

/**
 * Hook to fetch ticket document hierarchy from the Notion API
 */
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

                const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/notion/documents`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch ticket documents: ${response.status}`);
                }

                const result: DocumentHierarchyResponse = await response.json();
                setDocuments(result);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Error fetching ticket documents:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();

        return () => {
            controller.abort();
        };
    }, [ticketId]);

    return { documents, loading, error };
}

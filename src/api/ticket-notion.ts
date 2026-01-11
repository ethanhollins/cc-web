import type { DocumentHierarchyResponse, TicketContentResponse, TicketDataResponse } from "@/hooks/useTicketData";
import { apiClient } from "./client";

export async function fetchTicketNotionData(ticketId: string, signal?: AbortSignal): Promise<TicketDataResponse> {
  const response = await apiClient.get(`/tickets/${ticketId}/notion`, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ticket data: ${response.status}`);
  }

  return response.data as TicketDataResponse;
}

export async function fetchTicketNotionContent(ticketId: string, signal?: AbortSignal): Promise<TicketContentResponse> {
  const response = await apiClient.get(`/tickets/${ticketId}/notion/content`, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ticket content: ${response.status}`);
  }

  return response.data as TicketContentResponse;
}

export async function fetchTicketDocuments(ticketId: string, signal?: AbortSignal): Promise<DocumentHierarchyResponse> {
  const response = await apiClient.get(`/tickets/${ticketId}/notion/documents`, { signal });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ticket documents: ${response.status}`);
  }

  return response.data as DocumentHierarchyResponse;
}

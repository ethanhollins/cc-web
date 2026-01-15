/**
 * API functions for coaches.
 * Currently returns mock data, will be replaced with real API calls in production.
 */
import type { CoachProfile } from "./mocks/coaches";
import { mockCoaches } from "./mocks/coaches";

/**
 * Fetch all available coaches.
 * @returns Array of coach profiles
 */
export async function fetchCoaches(): Promise<CoachProfile[]> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coaches`);
  // if (!response.ok) throw new Error('Failed to fetch coaches');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data for now
  return mockCoaches;
}

/**
 * Fetch a single coach by ID.
 * @param coachId - The ID of the coach to fetch
 * @returns The coach profile
 */
export async function fetchCoach(coachId: string): Promise<CoachProfile> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coaches/${coachId}`);
  // if (!response.ok) throw new Error('Failed to fetch coach');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data for now
  const coach = mockCoaches.find((c) => c.id === coachId);
  if (!coach) {
    throw new Error(`Coach not found: ${coachId}`);
  }

  return coach;
}

/**
 * Fetch coaches for a specific domain.
 * @param domain - The domain to filter by
 * @returns Array of coach profiles
 */
export async function fetchCoachesByDomain(domain: string): Promise<CoachProfile[]> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coaches?domain=${domain}`);
  // if (!response.ok) throw new Error('Failed to fetch coaches');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data for now
  return mockCoaches.filter((coach) => coach.domains.includes(domain));
}

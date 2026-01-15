/**
 * API functions for coach programs.
 * Currently returns mock data, will be replaced with real API calls in production.
 */
import type { CoachProgram } from "@/types/program";
import { mockCoachCompletionMessage, mockFarsiProgram, mockLatestCoachMessage, mockSubmitCoachPromptResponseMessage } from "./mocks/programs";

/**
 * Fetch a coach program by ID.
 * @param programId - The ID of the program to fetch
 * @returns The coach program data
 */
export async function fetchCoachProgram(programId: string): Promise<CoachProgram> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coach/programs/${programId}`);
  // if (!response.ok) throw new Error('Failed to fetch coach program');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data for now
  if (programId === mockFarsiProgram.id) {
    return mockFarsiProgram;
  }

  throw new Error(`Program not found: ${programId}`);
}

/**
 * Fetch all active coach programs for the current user.
 * @returns Array of coach programs
 */
export async function fetchActiveCoachPrograms(): Promise<CoachProgram[]> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coach/programs/active`);
  // if (!response.ok) throw new Error('Failed to fetch active programs');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data for now
  return [mockFarsiProgram];
}

/**
 * Get the initial coach message for a program.
 * @param programId - The ID of the program
 * @returns The initial coach message
 */
export async function getInitialCoachMessage(_programId: string): Promise<string> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coach/programs/${programId}/messages/initial`);
  // if (!response.ok) throw new Error('Failed to fetch initial message');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data for now
  return mockLatestCoachMessage;
}

/**
 * Submit a user prompt/message to the coach for a program.
 * @param programId - The ID of the program
 * @param message - The user's message
 * @returns The coach's response message
 */
export async function submitCoachPrompt(_programId: string, _message: string): Promise<string> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coach/programs/${programId}/messages`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message }),
  // });
  // if (!response.ok) throw new Error('Failed to submit message');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock data for now
  return mockSubmitCoachPromptResponseMessage;
}

/**
 * Accept a coach program and get the completion message.
 * @param programId - The ID of the program to accept
 * @returns The coach's completion/acceptance message
 */
export async function acceptCoachProgram(_programId: string): Promise<string> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/coach/programs/${programId}/accept`, {
  //   method: 'POST',
  // });
  // if (!response.ok) throw new Error('Failed to accept program');
  // return response.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data for now
  return mockCoachCompletionMessage;
}

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not defined");
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track the last time any mutating API request (POST/PATCH/PUT/DELETE) was sent.
// Used to filter out stale WebSocket update messages that arrived before the most
// recent FE-initiated change.
//
// Module-level state is safe here because browser JavaScript runs on a single
// thread — there are no concurrent mutations.  Rapid successive mutations will
// simply overwrite the timestamp with the latest value, which is exactly what
// we want: only messages older than the *most recent* mutation are discarded.
let lastMutationTime = 0;

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

apiClient.interceptors.request.use((config) => {
  if (config.method && MUTATING_METHODS.has(config.method.toLowerCase())) {
    lastMutationTime = Date.now();
  }
  return config;
});

/**
 * Returns the timestamp (ms since epoch) of the last mutating API request made
 * through the shared apiClient.  Returns 0 if no mutating request has been made
 * yet in this session.
 */
export function getLastMutationTime(): number {
  return lastMutationTime;
}

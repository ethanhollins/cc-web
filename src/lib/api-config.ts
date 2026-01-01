/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// NOTE: This should be set in .env.local as NEXT_PUBLIC_API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// TODO: Add error handling for missing environment variable
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not defined");
}

export { API_BASE_URL };

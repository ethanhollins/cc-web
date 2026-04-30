/**
 * Mock API functions for persistent skill data.
 *
 * The backend for skill data has not been implemented yet.
 * These are no-op stubs that preserve the correct async interface.
 * When the backend is ready, replace each function body with the
 * corresponding API call (e.g. apiClient.get / .post / .delete).
 */

import type { SkillDataRecord, SkillDataScope } from "@/types/skill";

/**
 * Fetch a single skill data record by scope, scope ID and record ID.
 * Returns null when no record exists (or when the backend is not yet available).
 */
export async function fetchSkillDataRecord(
  _scope: SkillDataScope,
  _scopeId: string,
  _recordId: string,
): Promise<SkillDataRecord | null> {
  // TODO: GET /skill-data/:scope/:scopeId/:recordId
  return null;
}

/**
 * List all skill data records for a given scope and scope ID.
 * Returns an empty array when no records exist (or when the backend is not yet available).
 */
export async function listSkillDataRecords(
  _scope: SkillDataScope,
  _scopeId: string,
): Promise<SkillDataRecord[]> {
  // TODO: GET /skill-data/:scope/:scopeId
  return [];
}

/**
 * Upsert (create or update) a skill data record.
 * No-op until the backend is implemented.
 */
export async function upsertSkillDataRecord(
  _scope: SkillDataScope,
  _scopeId: string,
  _record: SkillDataRecord,
): Promise<void> {
  // TODO: POST /skill-data with { scope, scopeId, record }
}

/**
 * Delete a skill data record by ID.
 * No-op until the backend is implemented.
 */
export async function removeSkillDataRecord(
  _scope: SkillDataScope,
  _scopeId: string,
  _recordId: string,
): Promise<void> {
  // TODO: DELETE /skill-data/:scope/:scopeId/:recordId
}

/**
 * Skills API – Persistent Skill Data
 *
 * Provides CRUD operations for skill-level persistent data stored in a NoSQL
 * database. Each record requires a caller-defined `id` field; all other
 * columns are flexible.
 *
 * Scopes:
 *   - global  : mapped to backend `user` scope
 *   - focus   : mapped to backend `project/{project_id}` scope
 *   - skill   : mapped to backend `skill/{skill_id}` scope
 *
 * Backend contract:
 *   - POST / PATCH body: { user_id, data: {...} }
 *   - DELETE query: ?user_id=
 *   - GET response: { rows: [...] }
 */

import {
  createSkillDataRecord,
  fetchSkillDataRecord,
  listSkillDataRecords,
  updateSkillDataRecord,
  upsertSkillDataRecord,
  removeSkillDataRecord,
} from "@/api/skill-data";
import type { SkillDataRecord } from "./types";

// ---------------------------------------------------------------------------
// Global scope
// ---------------------------------------------------------------------------

/** Get a record from global storage. */
export async function getGlobalData(recordId: string, userId?: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("global", "global", recordId, userId);
}

/** List all records in global storage. */
export async function listGlobalData(userId?: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("global", "global", userId);
}

/** Save (upsert) a record to global storage. */
export async function setGlobalData(record: SkillDataRecord, userId?: string): Promise<void> {
  await upsertSkillDataRecord("global", "global", record, userId);
}

/** Create a record in global storage. */
export async function createGlobalData(record: SkillDataRecord, userId?: string): Promise<void> {
  await createSkillDataRecord("global", "global", record, userId);
}

/** Update a record in global storage. */
export async function updateGlobalData(record: SkillDataRecord, userId?: string): Promise<void> {
  await updateSkillDataRecord("global", "global", record, userId);
}

/** Delete a record from global storage. */
export async function deleteGlobalData(recordId: string, userId?: string): Promise<void> {
  await removeSkillDataRecord("global", "global", recordId, userId);
}

// ---------------------------------------------------------------------------
// Focus scope
// ---------------------------------------------------------------------------

/** Get a record from focus-scoped storage. */
export async function getFocusData(projectId: string, recordId: string, userId?: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("focus", projectId, recordId, userId);
}

/** List all records in focus-scoped storage. */
export async function listFocusData(projectId: string, userId?: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("focus", projectId, userId);
}

/** Save (upsert) a record to focus-scoped storage. */
export async function setFocusData(projectId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await upsertSkillDataRecord("focus", projectId, record, userId);
}

/** Create a record in focus-scoped storage. */
export async function createFocusData(projectId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await createSkillDataRecord("focus", projectId, record, userId);
}

/** Update a record in focus-scoped storage. */
export async function updateFocusData(projectId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await updateSkillDataRecord("focus", projectId, record, userId);
}

/** Delete a record from focus-scoped storage. */
export async function deleteFocusData(projectId: string, recordId: string, userId?: string): Promise<void> {
  await removeSkillDataRecord("focus", projectId, recordId, userId);
}

// ---------------------------------------------------------------------------
// Skill scope
// ---------------------------------------------------------------------------

/** Get a record from skill-scoped storage. Keeps `focusId` for backward compatibility. */
export async function getSkillData(_focusId: string, skillId: string, recordId: string, userId?: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("skill", skillId, recordId, userId);
}

/** List all records in skill-scoped storage. Keeps `focusId` for backward compatibility. */
export async function listSkillData(_focusId: string, skillId: string, userId?: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("skill", skillId, userId);
}

/** Save (upsert) a record to skill-scoped storage. Keeps `focusId` for backward compatibility. */
export async function setSkillData(_focusId: string, skillId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await upsertSkillDataRecord("skill", skillId, record, userId);
}

/** Create a record in skill-scoped storage. Keeps `focusId` for backward compatibility. */
export async function createSkillData(_focusId: string, skillId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await createSkillDataRecord("skill", skillId, record, userId);
}

/** Update a record in skill-scoped storage. Keeps `focusId` for backward compatibility. */
export async function updateSkillData(_focusId: string, skillId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await updateSkillDataRecord("skill", skillId, record, userId);
}

/** Delete a record from skill-scoped storage. Keeps `focusId` for backward compatibility. */
export async function deleteSkillData(_focusId: string, skillId: string, recordId: string, userId?: string): Promise<void> {
  await removeSkillDataRecord("skill", skillId, recordId, userId);
}

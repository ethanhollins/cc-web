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

const DEFAULT_SKILL_DATA_USER_ID = "1";

function resolveUserId(userId?: string): string {
  return userId ?? DEFAULT_SKILL_DATA_USER_ID;
}

// ---------------------------------------------------------------------------
// Global scope
// ---------------------------------------------------------------------------

/** Get a record from global storage. */
export async function getGlobalData(recordId: string, userId?: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("global", "global", recordId, resolveUserId(userId));
}

/** List all records in global storage. */
export async function listGlobalData(userId?: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("global", "global", resolveUserId(userId));
}

/** Save (upsert) a record to global storage. */
export async function setGlobalData(record: SkillDataRecord, userId?: string): Promise<void> {
  await upsertSkillDataRecord("global", "global", record, resolveUserId(userId));
}

/** Create a record in global storage. */
export async function createGlobalData(record: SkillDataRecord, userId?: string): Promise<void> {
  await createSkillDataRecord("global", "global", record, resolveUserId(userId));
}

/** Update a record in global storage. */
export async function updateGlobalData(record: SkillDataRecord, userId?: string): Promise<void> {
  await updateSkillDataRecord("global", "global", record, resolveUserId(userId));
}

/** Delete a record from global storage. */
export async function deleteGlobalData(recordId: string, userId?: string): Promise<void> {
  await removeSkillDataRecord("global", "global", recordId, resolveUserId(userId));
}

// ---------------------------------------------------------------------------
// Focus scope
// ---------------------------------------------------------------------------

/** Get a record from focus-scoped storage (maps to project-scoped backend data). */
export async function getFocusData(projectId: string, recordId: string, userId?: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("focus", projectId, recordId, resolveUserId(userId));
}

/** List all records in focus-scoped storage. */
export async function listFocusData(projectId: string, userId?: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("focus", projectId, resolveUserId(userId));
}

/** Save (upsert) a record to focus-scoped storage. */
export async function setFocusData(projectId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await upsertSkillDataRecord("focus", projectId, record, resolveUserId(userId));
}

/** Create a record in focus-scoped storage. */
export async function createFocusData(projectId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await createSkillDataRecord("focus", projectId, record, resolveUserId(userId));
}

/** Update a record in focus-scoped storage. */
export async function updateFocusData(projectId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await updateSkillDataRecord("focus", projectId, record, resolveUserId(userId));
}

/** Delete a record from focus-scoped storage. */
export async function deleteFocusData(projectId: string, recordId: string, userId?: string): Promise<void> {
  await removeSkillDataRecord("focus", projectId, recordId, resolveUserId(userId));
}

// ---------------------------------------------------------------------------
// Skill scope
// ---------------------------------------------------------------------------

/** Get a record from skill-scoped storage. */
export async function getSkillData(skillId: string, recordId: string, userId?: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("skill", skillId, recordId, resolveUserId(userId));
}

/** List all records in skill-scoped storage. */
export async function listSkillData(skillId: string, userId?: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("skill", skillId, resolveUserId(userId));
}

/** Save (upsert) a record to skill-scoped storage. */
export async function setSkillData(skillId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await upsertSkillDataRecord("skill", skillId, record, resolveUserId(userId));
}

/** Create a record in skill-scoped storage. */
export async function createSkillData(skillId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await createSkillDataRecord("skill", skillId, record, resolveUserId(userId));
}

/** Update a record in skill-scoped storage. */
export async function updateSkillData(skillId: string, record: SkillDataRecord, userId?: string): Promise<void> {
  await updateSkillDataRecord("skill", skillId, record, resolveUserId(userId));
}

/** Delete a record from skill-scoped storage. */
export async function deleteSkillData(skillId: string, recordId: string, userId?: string): Promise<void> {
  await removeSkillDataRecord("skill", skillId, recordId, resolveUserId(userId));
}

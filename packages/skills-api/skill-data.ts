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
 *   - POST body: { row_id, data: {...} }
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
export async function getGlobalData(recordId: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("global", "global", recordId);
}

/** List all records in global storage. */
export async function listGlobalData(): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("global", "global");
}

/** Save (upsert) a record to global storage. */
export async function setGlobalData(record: SkillDataRecord): Promise<void> {
  await upsertSkillDataRecord("global", "global", record);
}

/** Create a record in global storage. */
export async function createGlobalData(record: SkillDataRecord): Promise<void> {
  await createSkillDataRecord("global", "global", record);
}

/** Update a record in global storage. */
export async function updateGlobalData(record: SkillDataRecord): Promise<void> {
  await updateSkillDataRecord("global", "global", record);
}

/** Delete a record from global storage. */
export async function deleteGlobalData(recordId: string): Promise<void> {
  await removeSkillDataRecord("global", "global", recordId);
}

// ---------------------------------------------------------------------------
// Focus scope
// ---------------------------------------------------------------------------

/** Get a record from focus-scoped storage (maps to project-scoped backend data). */
export async function getFocusData(projectId: string, recordId: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("focus", projectId, recordId);
}

/** List all records in focus-scoped storage. */
export async function listFocusData(projectId: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("focus", projectId);
}

/** Save (upsert) a record to focus-scoped storage. */
export async function setFocusData(projectId: string, record: SkillDataRecord): Promise<void> {
  await upsertSkillDataRecord("focus", projectId, record);
}

/** Create a record in focus-scoped storage. */
export async function createFocusData(projectId: string, record: SkillDataRecord): Promise<void> {
  await createSkillDataRecord("focus", projectId, record);
}

/** Update a record in focus-scoped storage. */
export async function updateFocusData(projectId: string, record: SkillDataRecord): Promise<void> {
  await updateSkillDataRecord("focus", projectId, record);
}

/** Delete a record from focus-scoped storage. */
export async function deleteFocusData(projectId: string, recordId: string): Promise<void> {
  await removeSkillDataRecord("focus", projectId, recordId);
}

// ---------------------------------------------------------------------------
// Skill scope
// ---------------------------------------------------------------------------

/** Get a record from skill-scoped storage. */
export async function getSkillData(skillId: string, recordId: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("skill", skillId, recordId);
}

/** List all records in skill-scoped storage. */
export async function listSkillData(skillId: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("skill", skillId);
}

/** Save (upsert) a record to skill-scoped storage. */
export async function setSkillData(skillId: string, record: SkillDataRecord): Promise<void> {
  await upsertSkillDataRecord("skill", skillId, record);
}

/** Create a record in skill-scoped storage. */
export async function createSkillData(skillId: string, record: SkillDataRecord): Promise<void> {
  await createSkillDataRecord("skill", skillId, record);
}

/** Update a record in skill-scoped storage. */
export async function updateSkillData(skillId: string, record: SkillDataRecord): Promise<void> {
  await updateSkillDataRecord("skill", skillId, record);
}

/** Delete a record from skill-scoped storage. */
export async function deleteSkillData(skillId: string, recordId: string): Promise<void> {
  await removeSkillDataRecord("skill", skillId, recordId);
}

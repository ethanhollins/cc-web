/**
 * Skills API – Persistent Skill Data
 *
 * Provides CRUD operations for skill-level persistent data stored in a NoSQL
 * database. Each record requires a caller-defined `id` field; all other
 * columns are flexible.
 *
 * Scopes:
 *   - global  : shared across all focuses/skills
 *   - focus   : scoped to a specific focus  (scopeId = "<focusId>")
 *   - skill   : scoped to a specific skill  (scopeId = "<focusId>:<skillId>")
 *
 * NOTE: The backend for persistent skill data has not been implemented yet.
 * These functions call mock no-op stubs in src/api/skill-data.ts.
 * When the backend is ready, only that file needs updating — the public API
 * surface here stays the same.
 */

import {
  fetchSkillDataRecord,
  listSkillDataRecords,
  upsertSkillDataRecord,
  removeSkillDataRecord,
} from "@/api/skill-data";
import type { SkillDataRecord } from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function skillScopeId(focusId: string, skillId: string): string {
  return `${focusId}:${skillId}`;
}

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

/** Delete a record from global storage. */
export async function deleteGlobalData(recordId: string): Promise<void> {
  await removeSkillDataRecord("global", "global", recordId);
}

// ---------------------------------------------------------------------------
// Focus scope
// ---------------------------------------------------------------------------

/** Get a record from focus-scoped storage. */
export async function getFocusData(focusId: string, recordId: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("focus", focusId, recordId);
}

/** List all records in focus-scoped storage. */
export async function listFocusData(focusId: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("focus", focusId);
}

/** Save (upsert) a record to focus-scoped storage. */
export async function setFocusData(focusId: string, record: SkillDataRecord): Promise<void> {
  await upsertSkillDataRecord("focus", focusId, record);
}

/** Delete a record from focus-scoped storage. */
export async function deleteFocusData(focusId: string, recordId: string): Promise<void> {
  await removeSkillDataRecord("focus", focusId, recordId);
}

// ---------------------------------------------------------------------------
// Skill scope
// ---------------------------------------------------------------------------

/** Get a record from skill-scoped storage. */
export async function getSkillData(focusId: string, skillId: string, recordId: string): Promise<SkillDataRecord | null> {
  return fetchSkillDataRecord("skill", skillScopeId(focusId, skillId), recordId);
}

/** List all records in skill-scoped storage. */
export async function listSkillData(focusId: string, skillId: string): Promise<SkillDataRecord[]> {
  return listSkillDataRecords("skill", skillScopeId(focusId, skillId));
}

/** Save (upsert) a record to skill-scoped storage. */
export async function setSkillData(focusId: string, skillId: string, record: SkillDataRecord): Promise<void> {
  await upsertSkillDataRecord("skill", skillScopeId(focusId, skillId), record);
}

/** Delete a record from skill-scoped storage. */
export async function deleteSkillData(focusId: string, skillId: string, recordId: string): Promise<void> {
  await removeSkillDataRecord("skill", skillScopeId(focusId, skillId), recordId);
}


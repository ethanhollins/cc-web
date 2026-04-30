/**
 * Skills API – Persistent Skill Data (mocked)
 *
 * Provides CRUD operations for skill-level persistent data stored in a NoSQL
 * database. Each record requires a caller-defined `id` field; all other
 * columns are flexible.
 *
 * NOTE: The backend for persistent skill data has not yet been implemented.
 * This module mocks the behaviour using localStorage so skill components can
 * be developed against the real interface today. Once the backend is ready,
 * only this file needs updating — the public API surface stays the same.
 *
 * Storage key format:
 *   skills-data:<scope>:<scopeId>:<recordId>
 *
 * Scopes:
 *   - global  : shared across all focuses/skills (scopeId = "global")
 *   - focus   : scoped to a focus               (scopeId = "<focusId>")
 *   - skill   : scoped to a specific skill      (scopeId = "<focusId>:<skillId>")
 */

import type { SkillDataRecord, SkillDataScope } from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function storageKey(scope: SkillDataScope, scopeId: string, recordId: string): string {
  return `skills-data:${scope}:${scopeId}:${recordId}`;
}

function assertClientSide(): void {
  if (typeof window === "undefined") {
    throw new Error("[skills-api] Persistent skill data operations are only supported on the client side.");
  }
}

function listKeysForScope(scope: SkillDataScope, scopeId: string): string[] {
  assertClientSide();
  const prefix = `skills-data:${scope}:${scopeId}:`;
  return Object.keys(localStorage).filter((k) => k.startsWith(prefix));
}

function readRecord(key: string): SkillDataRecord | null {
  assertClientSide();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SkillDataRecord;
  } catch {
    return null;
  }
}

function writeRecord(key: string, record: SkillDataRecord): void {
  assertClientSide();
  localStorage.setItem(key, JSON.stringify(record));
}

function deleteRecord(key: string): void {
  assertClientSide();
  localStorage.removeItem(key);
}

// ---------------------------------------------------------------------------
// Global scope
// ---------------------------------------------------------------------------

/** Get a record from global storage. */
export async function getGlobalData(recordId: string): Promise<SkillDataRecord | null> {
  return readRecord(storageKey("global", "global", recordId));
}

/** List all records in global storage. */
export async function listGlobalData(): Promise<SkillDataRecord[]> {
  return listKeysForScope("global", "global")
    .map(readRecord)
    .filter((r): r is SkillDataRecord => r !== null);
}

/** Save (upsert) a record to global storage. */
export async function setGlobalData(record: SkillDataRecord): Promise<void> {
  writeRecord(storageKey("global", "global", record.id), record);
}

/** Delete a record from global storage. */
export async function deleteGlobalData(recordId: string): Promise<void> {
  deleteRecord(storageKey("global", "global", recordId));
}

// ---------------------------------------------------------------------------
// Focus scope
// ---------------------------------------------------------------------------

/** Get a record from focus-scoped storage. */
export async function getFocusData(focusId: string, recordId: string): Promise<SkillDataRecord | null> {
  return readRecord(storageKey("focus", focusId, recordId));
}

/** List all records in focus-scoped storage. */
export async function listFocusData(focusId: string): Promise<SkillDataRecord[]> {
  return listKeysForScope("focus", focusId)
    .map(readRecord)
    .filter((r): r is SkillDataRecord => r !== null);
}

/** Save (upsert) a record to focus-scoped storage. */
export async function setFocusData(focusId: string, record: SkillDataRecord): Promise<void> {
  writeRecord(storageKey("focus", focusId, record.id), record);
}

/** Delete a record from focus-scoped storage. */
export async function deleteFocusData(focusId: string, recordId: string): Promise<void> {
  deleteRecord(storageKey("focus", focusId, recordId));
}

// ---------------------------------------------------------------------------
// Skill scope
// ---------------------------------------------------------------------------

function skillScopeId(focusId: string, skillId: string): string {
  return `${focusId}:${skillId}`;
}

/** Get a record from skill-scoped storage. */
export async function getSkillData(focusId: string, skillId: string, recordId: string): Promise<SkillDataRecord | null> {
  return readRecord(storageKey("skill", skillScopeId(focusId, skillId), recordId));
}

/** List all records in skill-scoped storage. */
export async function listSkillData(focusId: string, skillId: string): Promise<SkillDataRecord[]> {
  return listKeysForScope("skill", skillScopeId(focusId, skillId))
    .map(readRecord)
    .filter((r): r is SkillDataRecord => r !== null);
}

/** Save (upsert) a record to skill-scoped storage. */
export async function setSkillData(focusId: string, skillId: string, record: SkillDataRecord): Promise<void> {
  writeRecord(storageKey("skill", skillScopeId(focusId, skillId), record.id), record);
}

/** Delete a record from skill-scoped storage. */
export async function deleteSkillData(focusId: string, skillId: string, recordId: string): Promise<void> {
  deleteRecord(storageKey("skill", skillScopeId(focusId, skillId), recordId));
}

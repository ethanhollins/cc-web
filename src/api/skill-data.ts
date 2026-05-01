import type { SkillDataRecord, SkillDataScope } from "@/types/skill";
import { apiClient } from "./client";

interface SkillDataRowResponse {
  user_id: string;
  row_id: string;
  project_id?: string;
  skill_id?: string;
  data?: Record<string, unknown>;
  created_at: string;
}

interface ListSkillDataResponse {
  rows?: SkillDataRowResponse[];
}

interface WriteSkillDataPayload {
  row_id: string;
  data: Record<string, unknown>;
}

function buildApiError(message: string, status: number, statusText?: string): Error {
  return new Error(statusText ? `${message}: ${status} ${statusText}` : `${message}: ${status}`);
}

function getScopePath(scope: SkillDataScope, scopeId: string): string {
  switch (scope) {
    case "global":
      return "/skill-data/user";
    case "focus":
      return `/skill-data/project/${encodeURIComponent(scopeId)}`;
    case "skill":
      return `/skill-data/skill/${encodeURIComponent(scopeId)}`;
  }
}

function getRowPath(scope: SkillDataScope, scopeId: string, recordId: string): string {
  return `${getScopePath(scope, scopeId)}/${encodeURIComponent(recordId)}`;
}

function toSkillDataRecord(row: SkillDataRowResponse): SkillDataRecord {
  const rowData = row.data && typeof row.data === "object" ? row.data : {};
  return { ...rowData, id: row.row_id };
}

function toWriteData(record: SkillDataRecord): Record<string, unknown> {
  const { id: _id, ...data } = record;
  return data;
}

function toWritePayload(record: SkillDataRecord): WriteSkillDataPayload {
  return {
    row_id: record.id,
    data: toWriteData(record),
  };
}

function isSuccessfulStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Fetch a single skill data record by scope, scope ID and record ID.
 * Uses the scope list endpoint and selects the requested row by `row_id`.
 */
export async function fetchSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  recordId: string,
): Promise<SkillDataRecord | null> {
  const records = await listSkillDataRecords(scope, scopeId);
  return records.find((record) => record.id === recordId) ?? null;
}

/**
 * List all skill data records for a given scope and scope ID.
 */
export async function listSkillDataRecords(
  scope: SkillDataScope,
  scopeId: string,
): Promise<SkillDataRecord[]> {
  const response = await apiClient.get(getScopePath(scope, scopeId));
  if (!isSuccessfulStatus(response.status)) {
    throw buildApiError("Failed to list skill data records", response.status, response.statusText);
  }

  const payload = response.data as ListSkillDataResponse;
  return (payload.rows ?? []).map(toSkillDataRecord);
}

/**
 * Upsert (create or update) a skill data record.
 * Backend POST replaces existing rows when `row_id` already exists.
 */
export async function upsertSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  record: SkillDataRecord,
): Promise<void> {
  await createSkillDataRecord(scope, scopeId, record);
}

/**
 * Create a skill data record.
 */
export async function createSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  record: SkillDataRecord,
): Promise<void> {
  const response = await apiClient.post(getScopePath(scope, scopeId), toWritePayload(record));
  if (!isSuccessfulStatus(response.status)) {
    throw buildApiError("Failed to create skill data record", response.status, response.statusText);
  }
}

/**
 * Update a skill data record.
 */
export async function updateSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  record: SkillDataRecord,
): Promise<void> {
  const response = await apiClient.patch(getRowPath(scope, scopeId, record.id), {
    data: toWriteData(record),
  });
  if (!isSuccessfulStatus(response.status)) {
    throw buildApiError("Failed to update skill data record", response.status, response.statusText);
  }
}

/**
 * Delete a skill data record by ID.
 */
export async function removeSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  recordId: string,
): Promise<void> {
  const response = await apiClient.delete(getRowPath(scope, scopeId, recordId));
  if (!isSuccessfulStatus(response.status)) {
    throw buildApiError("Failed to delete skill data record", response.status, response.statusText);
  }
}

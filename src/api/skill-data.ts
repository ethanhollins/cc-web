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

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeResponse = (error as { response?: { status?: number } }).response;
  return maybeResponse?.status === 404;
}

/**
 * Fetch a single skill data record by scope, scope ID and record ID.
 * Uses the scope list endpoint and selects the requested row by `row_id`.
 */
export async function fetchSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  recordId: string,
  userId: string,
): Promise<SkillDataRecord | null> {
  const records = await listSkillDataRecords(scope, scopeId, userId);
  return records.find((record) => record.id === recordId) ?? null;
}

/**
 * List all skill data records for a given scope and scope ID.
 */
export async function listSkillDataRecords(
  scope: SkillDataScope,
  scopeId: string,
  userId: string,
): Promise<SkillDataRecord[]> {
  const response = await apiClient.get(getScopePath(scope, scopeId), {
    params: { user_id: userId },
  });
  if (response.status !== 200) {
    throw buildApiError("Failed to list skill data records", response.status, response.statusText);
  }

  const payload = response.data as ListSkillDataResponse;
  return (payload.rows ?? []).map(toSkillDataRecord);
}

/**
 * Upsert (create or update) a skill data record.
 * Attempts PATCH first and falls back to POST when row does not exist.
 */
export async function upsertSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  record: SkillDataRecord,
  userId: string,
): Promise<void> {
  try {
    await updateSkillDataRecord(scope, scopeId, record, userId);
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    await createSkillDataRecord(scope, scopeId, record, userId);
  }
}

/**
 * Create a skill data record.
 */
export async function createSkillDataRecord(
  scope: SkillDataScope,
  scopeId: string,
  record: SkillDataRecord,
  userId: string,
): Promise<void> {
  const response = await apiClient.post(getRowPath(scope, scopeId, record.id), {
    user_id: userId,
    data: toWriteData(record),
  });
  if (response.status !== 200) {
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
  userId: string,
): Promise<void> {
  const response = await apiClient.patch(getRowPath(scope, scopeId, record.id), {
    user_id: userId,
    data: toWriteData(record),
  });
  if (response.status !== 200) {
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
  userId: string,
): Promise<void> {
  const response = await apiClient.delete(getRowPath(scope, scopeId, recordId), {
    params: { user_id: userId },
  });
  if (response.status !== 200) {
    throw buildApiError("Failed to delete skill data record", response.status, response.statusText);
  }
}

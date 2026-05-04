import type { NormalizedApiError } from "@/lib/api/client";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue | undefined };
export type JsonArray = JsonValue[];

export type OfflineMutationMethod = "post" | "put" | "patch" | "delete";

export type OfflineMutationStatus = "queued" | "processing" | "succeeded" | "failed";

export interface OfflineMutationErrorSnapshot extends NormalizedApiError {
  attemptedAt: string;
}

export interface OfflineMutationEntry {
  id: string;
  requestKey: string;
  method: OfflineMutationMethod;
  path: string;
  body?: JsonValue;
  headers?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  status: OfflineMutationStatus;
  retryCount: number;
  lastError?: OfflineMutationErrorSnapshot;
}

export interface EnqueueOfflineMutationInput {
  method: OfflineMutationMethod;
  path: string;
  body?: JsonValue;
  headers?: Record<string, string>;
  dedupeKey?: string;
  allowDuplicate?: boolean;
}

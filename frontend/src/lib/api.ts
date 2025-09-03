import { API_BASE, joinUrl } from './env';

/* ========= Public types (camelCase) ========= */

export type ColumnKey = 'title' | 'salary' | 'currency' | 'country' | 'seniority' | 'stack';
export type ColumnMap = Record<ColumnKey, string>;

export type UploadResponse = { fileId: string };
export type MapResponse = { taskId: string };

export type CeleryState = 'PENDING' | 'STARTED' | 'PROGRESS' | 'RETRY' | 'FAILURE' | 'SUCCESS';

export type TaskStatusResp = {
  id: string;
  state: CeleryState;
  meta?: {
    processed?: number;
    total?: number;
    percent?: number;
    [k: string]: any;
  };
  ready: boolean;
  successful: boolean;
  result?: unknown;
};

/* ========= Raw (internal) ========= */

type RawUploadResponse = { file_id?: string; fileId?: string };
type RawMapResponse = { task_id?: string; id?: string; taskId?: string };
type RawTaskStatus = {
  task_id?: string;
  id?: string;
  status?: string;
  state?: string;
  meta?: any;
  result?: unknown;
  ready?: boolean;
  successful?: boolean;
};

export type SalarySummary = {
  p50: number;
  p75: number;
  p90: number;
  n: number;
};

export type StackCompareRow = {
  stack: string;
  p50: number;
  n: number;
};

/* ========= Small helpers ========= */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/** snake/kebab -> camel (shallow keys) */
const toCamel = (s: string) => s.replace(/[_-](\w)/g, (_, c: string) => c.toUpperCase());
const normalizeKeys = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj ?? {}).map(([k, v]) => [toCamel(k), v]));

/* ========= Normalizers ========= */

function normalizeUpload(raw: RawUploadResponse): UploadResponse {
  const n = normalizeKeys(raw) as { fileId?: string };
  if (!n.fileId) throw new Error('Invalid upload response');
  return { fileId: n.fileId };
}

function normalizeMap(raw: RawMapResponse): MapResponse {
  const n = normalizeKeys(raw) as { taskId?: string; id?: string };
  const taskId = n.taskId ?? n.id;
  if (!taskId) throw new Error('Invalid map response');
  return { taskId };
}

function normalizeTaskStatus(raw: RawTaskStatus): TaskStatusResp {
  const n = normalizeKeys(raw) as any;
  const p = n.meta?.percent;
  const bounded = typeof p === 'number' ? Math.max(0, Math.min(100, Math.round(p))) : undefined;
  return {
    id: (n.taskId ?? n.id ?? '') as string,
    state: (n.state ?? n.status ?? 'PENDING').toUpperCase() as CeleryState,
    meta: n.meta ? { ...n.meta, percent: bounded } : undefined,
    ready: Boolean(n.ready),
    successful: Boolean(n.successful),
    result: n.result,
  };
}

/* ========= HTTP ========= */

async function request<T>(
  path: string,
  { method = 'GET', body, headers, signal }: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE}/${joinUrl(path)}`;
  const res = await fetch(url, { method, body, headers, signal });

  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  if (!res.ok) {
    const errorPayload = isJson ? await res.json().catch(() => ({})) : await res.text();
    const detail =
      (typeof errorPayload === 'object' && errorPayload && (errorPayload as any).detail) ||
      (typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
    const err = new Error(`[${res.status}] ${res.statusText} - ${detail}`);
    // @ts-expect-error attach debug info
    err.payload = errorPayload;
    // @ts-expect-error attach status
    err.status = res.status;
    throw err;
  }

  return (isJson ? res.json() : await res.text()) as T;
}

/* ========= Endpoints ========= */

const INGEST = 'api/jobs/ingest';
const ANALYTICS = 'api/jobs/analytics';

/** POST /api/jobs/ingest/upload -> { file_id } */
export async function uploadFile(file: File, signal?: AbortSignal): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const raw = await request<RawUploadResponse>(`${INGEST}/upload`, {
    method: 'POST',
    body: form,
    signal,
  });
  return normalizeUpload(raw);
}

/** POST /api/jobs/ingest/map -> { task_id } */
export async function mapColumns(
  fileId: string,
  columnMap: ColumnMap,
  signal?: AbortSignal
): Promise<MapResponse> {
  const body = JSON.stringify({ file_id: fileId, column_map: columnMap });
  const raw = await request<RawMapResponse>(`${INGEST}/map`, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    signal,
  });
  return normalizeMap(raw);
}

/** GET /api/jobs/ingest/tasks/{task_id} -> TaskStatusResp */
export async function taskStatus(taskId: string, signal?: AbortSignal): Promise<TaskStatusResp> {
  const raw = await request<RawTaskStatus>(`${INGEST}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    signal,
    headers: { 'Cache-Control': 'no-cache' },
  });
  return normalizeTaskStatus(raw);
}

/** GET /api/jobs/analytics/salary/summary -> SalarySummary */
export async function salarySummary(signal?: AbortSignal): Promise<SalarySummary> {
  const raw = await request<any>(`${ANALYTICS}/salary/summary`, { method: 'GET', signal });
  const d = raw?.data ?? raw ?? {};
  return {
    p50: Number(d.p50 ?? d.median ?? 0),
    p75: Number(d.p75 ?? 0),
    p90: Number(d.p90 ?? 0),
    n: Number(d.n ?? d.count ?? 0),
  };
}

/** GET /api/jobs/analytics/stack/compare -> StackCompareRow[] */
export async function stackCompare(signal?: AbortSignal): Promise<StackCompareRow[]> {
  const raw = await request<any>(`${ANALYTICS}/stack/compare`, { method: 'GET', signal });
  const arr: any[] = raw?.data ?? raw ?? [];
  return arr.map((r) => ({
    stack: String(r?.stack ?? r?.tech ?? '-'),
    p50: Number(r?.p50 ?? r?.median ?? 0),
    n: Number(r?.n ?? r?.count ?? 0),
  }));
}

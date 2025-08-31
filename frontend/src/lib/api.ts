import { API_BASE, joinUrl } from './env';

export type ColumnKey = 'title' | 'salary' | 'currency' | 'country' | 'seniority' | 'stack';

export type ColumnMap = Record<ColumnKey, string>;

export type UploadResponse = { fileId: string };

export type MapResponse = { task_id: string };

export type TaskStatusState = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILURE';

export type TaskStatusResp = {
  taskId: string;
  status: TaskStatusState;
  message?: string;
  result?: unknown;
  progress?: number;
};

type RawTaskStatus = {
  task_id?: string;
  id?: string;
  status?: string;
  state?: string;
  message?: string;
  error?: string;
  detail?: string;
  result?: unknown;
  progress?: number;
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

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function normalizeTaskStatus(raw: RawTaskStatus): TaskStatusResp {
  const status = (raw.status ?? raw.state ?? 'PENDING').toUpperCase() as TaskStatusState;
  return {
    task_id: (raw.task_id ?? raw.id ?? '') as string,
    status,
    message: raw.message ?? raw.error ?? raw.detail,
    result: raw.result,
    progress: typeof raw.progress === 'number' ? raw.progress : undefined,
  };
}
async function request<T>(
  path: string,
  { method = 'GET', body, headers, signal }: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE}/${joinUrl(path)}`;
  const res = await fetch(url, {
    method,
    body,
    headers,
    signal,
  });
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  console.debug('[HTTP]', method, url);

  if (!res.ok) {
    const errorPayload = isJson ? await res.json().catch(() => ({})) : await res.text();
    const err = new Error(
      `[${res.status}] ${res.statusText} - ${
        typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload)
      }`
    );
    // @ts-expect-error anexar payload e status ajuda no debug
    err.payload = errorPayload;
    // @ts-expect-error
    err.status = res.status;
    throw err;
  }

  return (isJson ? res.json() : await res.text()) as T;
}

/** ########################
          Endpoints 
 * ######################## */

/** POST /api/jobs/ingest/upload  -> { file_id } */
export async function uploadFile(file: File, signal?: AbortSignal): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);

  return request<UploadResponse>('api/jobs/ingest/upload', {
    method: 'POST',
    body: form,
    signal,
  });
}

/** POST /api/jobs/ingest/map  -> { task_id } */
export async function mapColumns(
  fileId: string,
  columnMap: ColumnMap,
  signal?: AbortSignal
): Promise<MapResponse> {
  const body = JSON.stringify({
    file_id: fileId,
    column_map: columnMap,
  });
  return request<MapResponse>('api/jobs/ingest/map', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    signal,
  });
}

/** GET /api/jobs/ingest/tasks/{task_id} */
export async function taskStatus(taskId: string, signal?: AbortSignal): Promise<TaskStatusResp> {
  const raw = await request<RawTaskStatus>(`api/jobs/ingest/tasks/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    signal,
    headers: { 'Cache-Control': 'no-cache' },
  });
  return normalizeTaskStatus(raw);
}

// GET /api/jobs/analytics/salary/summary
export async function salarySummary(signal?: AbortSignal): Promise<SalarySummary> {
  const raw = await request<any>('api/jobs/analytics/salary/summary', { method: 'GET', signal });
  const d = raw?.data ?? raw;
  return {
    p50: Number(d?.p50 ?? 0),
    p75: Number(d?.p75 ?? 0),
    p90: Number(d?.p90 ?? 0),
    n: Number(d?.n ?? 0),
  };
}

// GET /api/jobs/analytics/stack/compare
export async function stackCompare(signal?: AbortSignal): Promise<StackCompareRow[]> {
  const raw = await request<any>('api/jobs/analytics/stack/compare', { method: 'GET', signal });
  const arr: any[] = raw?.data ?? raw ?? [];
  return arr.map((r) => ({
    stack: String(r?.stack ?? r?.tech ?? '-'),
    p50: Number(r?.p50 ?? r?.median ?? 0),
    n: Number(r?.n ?? r?.count ?? 0),
  }));
}

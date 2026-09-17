import type {
  DbInfo,
  ConnectResponse,
  PreviewData,
  SampleQuery,
  GenerateQueryParams,
  ExecuteSqlParams,
  QueryResult,
} from '../types';

const API_BASE = "http://127.0.0.1:8000/api";

export async function fetchSchema(dbUrl = ""): Promise<DbInfo> {
  const url = dbUrl ? `${API_BASE}/database/schema?db_url=${encodeURIComponent(dbUrl)}` : `${API_BASE}/database/schema`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch schema" }));
    throw new Error(err.detail || "Failed to fetch schema");
  }
  return res.json();
}

export async function connectDatabase(dbUrl = "", useSample = true): Promise<ConnectResponse> {
  const res = await fetch(`${API_BASE}/database/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ db_url: dbUrl, use_sample_db: useSample })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Connection failed" }));
    throw new Error(err.detail || "Connection failed");
  }
  return res.json();
}

export async function fetchTablePreview(tableName: string, dbUrl = ""): Promise<PreviewData> {
  const url = dbUrl 
    ? `${API_BASE}/database/table-preview/${encodeURIComponent(tableName)}?db_url=${encodeURIComponent(dbUrl)}`
    : `${API_BASE}/database/table-preview/${encodeURIComponent(tableName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Preview failed" }));
    throw new Error(err.detail || "Preview failed");
  }
  return res.json();
}

export async function fetchSampleQueries(): Promise<{ samples: SampleQuery[] }> {
  const res = await fetch(`${API_BASE}/database/sample-queries`);
  if (!res.ok) return { samples: [] };
  return res.json();
}

export async function generateAndRunQuery({
  prompt,
  dbUrl = "",
  apiKey = "",
  provider = "gemini",
  modelName = "",
  previousSql,
  previousPrompt
}: GenerateQueryParams): Promise<QueryResult> {
  const res = await fetch(`${API_BASE}/query/generate-and-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      db_url: dbUrl || null,
      api_key: apiKey || null,
      provider: provider || "gemini",
      model_name: modelName || null,
      previous_sql: previousSql || null,
      previous_prompt: previousPrompt || null
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Query generation failed" }));
    throw new Error(err.detail || "Query generation failed");
  }
  return res.json();
}

export async function executeDirectSql({ sql, dbUrl = "" }: ExecuteSqlParams): Promise<QueryResult> {
  const res = await fetch(`${API_BASE}/query/execute-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sql,
      db_url: dbUrl || null
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "SQL execution failed" }));
    throw new Error(err.detail || "SQL execution failed");
  }
  return res.json();
}

export async function fetchHistory(): Promise<{ history: unknown[] }> {
  const res = await fetch(`${API_BASE}/query/history`);
  if (!res.ok) return { history: [] };
  return res.json();
}

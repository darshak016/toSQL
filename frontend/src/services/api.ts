import type {
  DbInfo,
  ConnectResponse,
  PreviewData,
  SampleQuery,
  GenerateQueryParams,
  ExecuteSqlParams,
  QueryResult,
  ExplainPlanResponse,
  ExplainPlanRequest,
  DictionaryConfig,
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

export async function fetchSampleQueries(
  dbUrl = "",
  aiSettings?: { provider?: string; apiKey?: string; modelName?: string }
): Promise<{ samples: SampleQuery[] }> {
  const params = new URLSearchParams();
  if (dbUrl) params.append("db_url", dbUrl);
  if (aiSettings?.apiKey) params.append("api_key", aiSettings.apiKey);
  if (aiSettings?.provider) params.append("provider", aiSettings.provider);
  if (aiSettings?.modelName) params.append("model_name", aiSettings.modelName);

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}/database/sample-queries?${queryString}` : `${API_BASE}/database/sample-queries`;
  const res = await fetch(url);
  if (!res.ok) return { samples: [] };
  return res.json();
}

export async function fetchDatabaseDictionary(): Promise<DictionaryConfig> {
  const res = await fetch(`${API_BASE}/database/dictionary`);
  if (!res.ok) return { terms: [], few_shots: [] };
  return res.json();
}

export async function saveDatabaseDictionary(config: DictionaryConfig): Promise<DictionaryConfig> {
  const res = await fetch(`${API_BASE}/database/dictionary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to save dictionary" }));
    throw new Error(err.detail || "Failed to save dictionary");
  }
  return res.json();
}

export async function generateAndRunQuery({
  prompt,
  dbUrl = "",
  apiKey = "",
  provider = "gemini",
  modelName = "",
  previousSql,
  previousPrompt,
  glossaryTerms,
  fewShotExamples,
  pruneSchema,
  maxTables
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
      previous_prompt: previousPrompt || null,
      glossary_terms: glossaryTerms || null,
      few_shot_examples: fewShotExamples || null,
      prune_schema: pruneSchema ?? true,
      max_tables: maxTables || null
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

export async function fetchExplainPlan({ sql, dbUrl = "" }: ExplainPlanRequest): Promise<ExplainPlanResponse> {
  const res = await fetch(`${API_BASE}/query/explain-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sql,
      db_url: dbUrl || null
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to generate query execution plan" }));
    throw new Error(err.detail || "Failed to generate query execution plan");
  }
  return res.json();
}


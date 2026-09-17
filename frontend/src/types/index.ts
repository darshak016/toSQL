// ─── Database Schema Types ───────────────────────────────────────────

export interface ColumnInfo {
  name: string;
  type: string;
  primary_key?: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface DbInfo {
  database_type: string;
  table_count: number;
  tables: TableInfo[];
  active_db_url?: string;
}

// ─── AI Settings ─────────────────────────────────────────────────────

export interface AiSettings {
  provider: string;
  apiKey: string;
  modelName: string;
}

// ─── Query Result Types ──────────────────────────────────────────────

export interface QueryAttempt {
  attempt: number;
  success: boolean;
  error?: string;
}

export interface QueryData {
  columns: string[];
  rows: (string | number | null)[][];
  row_count?: number;
  execution_time_ms?: number;
}

export interface ChartConfig {
  x_axis?: string;
  y_axis?: string;
  title?: string;
}

export interface QueryBreakdown {
  tables_used?: string[];
  joins?: string[];
  filters?: string[];
  aggregations?: string[];
  assumptions?: string[];
}

export interface QueryResult {
  success: boolean;
  sql?: string;
  data?: QueryData;
  explanation?: string;
  breakdown?: QueryBreakdown;
  self_healed?: boolean;
  suggested_chart?: string;
  chart_config?: ChartConfig;
  attempts?: QueryAttempt[];
  error?: string;
}

// ─── API Request / Response Types ────────────────────────────────────

export interface GenerateQueryParams {
  prompt: string;
  dbUrl?: string;
  apiKey?: string;
  provider?: string;
  modelName?: string;
  previousSql?: string;
  previousPrompt?: string;
}

export interface ExecuteSqlParams {
  sql: string;
  dbUrl?: string;
}

export interface PreviewData {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface SampleQuery {
  title: string;
  prompt: string;
}

export interface ConnectResponse {
  database_type: string;
  table_count: number;
  tables: TableInfo[];
  active_db_url?: string;
}

// ─── Pipeline Step ───────────────────────────────────────────────────

export interface PipelineStep {
  id: string;
  title: string;
  desc: string;
  tag: string;
}

// ─── Query History & Saved Queries ───────────────────────────────────

export interface HistoryItem {
  id: string;
  prompt: string;
  sql?: string;
  timestamp: number;
  success: boolean;
  rowCount?: number;
  executionTimeMs?: number;
  isFavorite?: boolean;
}


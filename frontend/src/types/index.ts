// ─── Database Schema Types ───────────────────────────────────────────

export interface ColumnInfo {
  name: string;
  type: string;
  primary_key?: boolean;
}

export interface ForeignKeyInfo {
  constrained_columns: string[];
  referred_table?: string;
  referred_columns: string[];
}

export interface TableInfo {
  name: string;
  row_count?: number;
  columns: ColumnInfo[];
  foreign_keys?: ForeignKeyInfo[];
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

export interface FollowUpSuggestion {
  label: string;
  prompt: string;
}

export interface QueryResult {
  success: boolean;
  prompt?: string;
  sql?: string;
  data?: QueryData;
  explanation?: string;
  breakdown?: QueryBreakdown;
  self_healed?: boolean;
  suggested_chart?: string;
  chart_config?: ChartConfig;
  follow_up_suggestions?: FollowUpSuggestion[];
  attempts?: QueryAttempt[];
  error?: string;
  schema_pruning?: PruningMetadata;
}

export interface PruningMetadata {
  is_pruned: boolean;
  total_tables: number;
  retained_tables: string[];
  pruned_tables: string[];
  estimated_tokens_saved: number;
}


// ─── Semantic Dictionary & Few-Shot Types ────────────────────────────

export interface GlossaryTerm {
  id?: string;
  term: string;
  definition: string;
  category?: string;
}

export interface FewShotExample {
  id?: string;
  prompt: string;
  sql: string;
  explanation?: string;
}

export interface DictionaryConfig {
  terms: GlossaryTerm[];
  few_shots: FewShotExample[];
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
  glossaryTerms?: GlossaryTerm[];
  fewShotExamples?: FewShotExample[];
  pruneSchema?: boolean;
  maxTables?: number;
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

// ─── Query Execution Plan (EXPLAIN) ──────────────────────────────────

export interface ExplainPlanRequest {
  sql: string;
  db_url?: string;
  dbUrl?: string;
}


export interface ExplainPlanResponse {
  success: boolean;
  dialect: string;
  plan_type: string;
  raw_plan: string[];
  plan_rows: Record<string, string | number | null>[];
  has_table_scan: boolean;
  has_index_lookup: boolean;
  execution_time_ms: number;
  sql: string;
  error?: string | null;
}



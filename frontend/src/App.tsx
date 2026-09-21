import React, { useState, useEffect, useRef } from 'react';
import type { 
  DbInfo, 
  AiSettings, 

  QueryResult, 
  PreviewData, 
  SampleQuery, 
  HistoryItem,
  ExplainPlanResponse,
  GlossaryTerm,
  FewShotExample
} from './types';
import Navbar from './components/Navbar';
import SchemaSidebar from './components/SchemaSidebar';
import PromptSection from './components/PromptSection';
import PipelineVisualizer from './components/PipelineVisualizer';
import SqlViewer from './components/SqlViewer';
import ExplanationCard from './components/ExplanationCard';
import ResultsTable from './components/ResultsTable';
import Visualizer from './components/Visualizer';
import ConnectionModal from './components/ConnectionModal';
import SettingsModal from './components/SettingsModal';
import TablePreviewModal from './components/TablePreviewModal';
import HistoryModal from './components/HistoryModal';
import ErdModal from './components/ErdModal';
import ExplainPlanModal from './components/ExplainPlanModal';
import DictionaryModal from './components/DictionaryModal';
import { 
  fetchSchema, 
  connectDatabase, 
  fetchSampleQueries, 
  fetchTablePreview, 
  generateAndRunQuery, 
  executeDirectSql,
  fetchExplainPlan,
  saveDatabaseDictionary
} from './services/api';


import { Table, BarChart03, AlertCircle, XClose } from './components/Icons';

const STORAGE_KEY_HISTORY = 'tosql_query_history_v1';
const STORAGE_KEY_THEME = 'tosql_theme_preference_v1';

export default function App() {
  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (e) {
      console.error('Failed to set theme attribute', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // DB & Schema State
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [samples, setSamples] = useState<SampleQuery[]>([]);

  // History & Favorites State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync history changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to persist history to localStorage', e);
    }
  }, [history]);

  // Prompt & Query State
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('table');

  // Pipeline Step Visualization State
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineVisible, setPipelineVisible] = useState(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modals & Settings
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isErdOpen, setIsErdOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [explainPlan, setExplainPlan] = useState<ExplainPlanResponse | null>(null);
  const [isExplainingPlan, setIsExplainingPlan] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Semantic Glossary Terms & Few-Shot Examples (Plan 1.4 / A.4)
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(() => {
    try {
      const saved = localStorage.getItem('tosql_glossary_terms_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'term_default_1',
        term: 'active customer',
        definition: "c.id IN (SELECT DISTINCT customer_id FROM orders WHERE order_date >= date('now', '-90 days'))",
        category: 'Customer Status'
      },
      {
        id: 'term_default_2',
        term: 'high value order',
        definition: "o.total_amount >= 150.00 AND o.status = 'completed'",
        category: 'Revenue'
      },
      {
        id: 'term_default_3',
        term: 'low stock',
        definition: "p.stock_quantity < 50",
        category: 'Inventory'
      }
    ];
  });

  const [fewShots, setFewShots] = useState<FewShotExample[]>(() => {
    try {
      const saved = localStorage.getItem('tosql_few_shots_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'fs_default_1',
        prompt: 'Show top 5 customers by spend',
        sql: "SELECT c.name, ROUND(SUM(o.total_amount), 2) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.status = 'completed' GROUP BY c.id, c.name ORDER BY total_spent DESC LIMIT 5",
        explanation: 'Calculates completed order spending per customer and orders descending with a limit of 5.'
      },
      {
        id: 'fs_default_2',
        prompt: 'Monthly sales trend',
        sql: "SELECT strftime('%Y-%m', order_date) AS month, ROUND(SUM(total_amount), 2) AS monthly_revenue, COUNT(id) AS order_count FROM orders WHERE status = 'completed' GROUP BY strftime('%Y-%m', order_date) ORDER BY month ASC",
        explanation: 'Aggregates revenue and volume per month for completed orders formatted YYYY-MM.'
      }
    ];
  });

  const saveGlossaryTerms = (termsList: GlossaryTerm[]) => {
    setGlossaryTerms(termsList);
    try {
      localStorage.setItem('tosql_glossary_terms_v1', JSON.stringify(termsList));
      saveDatabaseDictionary({ terms: termsList, few_shots: fewShots }).catch(() => {});
    } catch (e) {
      console.error('Failed to save glossary terms', e);
    }
  };

  const saveFewShotsList = (fewShotsList: FewShotExample[]) => {
    setFewShots(fewShotsList);
    try {
      localStorage.setItem('tosql_few_shots_v1', JSON.stringify(fewShotsList));
      saveDatabaseDictionary({ terms: glossaryTerms, few_shots: fewShotsList }).catch(() => {});
    } catch (e) {
      console.error('Failed to save few shots', e);
    }
  };



  // AI Settings
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => {
    try {
      const saved = localStorage.getItem('tosql_ai_settings');
      return saved ? JSON.parse(saved) : { provider: 'gemini', apiKey: '', modelName: 'gemini-2.5-flash' };
    } catch {
      return { provider: 'gemini', apiKey: '', modelName: 'gemini-2.5-flash' };
    }
  });

  const saveAiSettings = (newSettings: AiSettings) => {
    setAiSettings(newSettings);
    localStorage.setItem('tosql_ai_settings', JSON.stringify(newSettings));
  };

  // Initial Load
  const loadSchema = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSchema();
      setDbInfo(data);
      setErrorBanner(null);
    } catch (err) {
      setErrorBanner(`Could not load schema: ${(err as Error).message}. Ensure backend is running.`);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchema();
    fetchSampleQueries().then(data => {
      if (data?.samples) setSamples(data.samples);
    });
  }, []);

  // Handle Switch Database
  const handleConnect = async (dbUrl: string, useSample: boolean) => {
    setIsConnecting(true);
    try {
      const res = await connectDatabase(dbUrl, useSample);
      setDbInfo({
        database_type: res.database_type,
        table_count: res.table_count,
        tables: res.tables,
        active_db_url: res.active_db_url
      });
      setIsConnectOpen(false);
      setErrorBanner(null);
    } catch (err) {
      alert(`Connection failed: ${(err as Error).message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Preview Table
  const handlePreviewTable = async (tableName: string) => {
    setPreviewTable(tableName);
    setIsLoadingPreview(true);
    try {
      const data = await fetchTablePreview(tableName);
      setPreviewData(data);
    } catch (err) {
      alert(`Could not preview table: ${(err as Error).message}`);
      setPreviewTable(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Record query into persistent history
  const recordHistoryItem = (item: {
    prompt: string;
    sql?: string;
    success: boolean;
    rowCount?: number;
    executionTimeMs?: number;
  }) => {
    const newItem: HistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      prompt: item.prompt,
      sql: item.sql,
      timestamp: Date.now(),
      success: item.success,
      rowCount: item.rowCount,
      executionTimeMs: item.executionTimeMs,
      isFavorite: false,
    };
    setHistory(prev => [newItem, ...prev.slice(0, 99)]);
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      setHistory([]);
    }
  };

  const handleSelectHistoryQuery = (selectedPrompt: string, selectedSql?: string) => {
    setPrompt(selectedPrompt);
    if (selectedSql) {
      setQueryResult(prev => ({
        ...(prev || { success: true }),
        sql: selectedSql,
      }));
    }
  };

  // Handle Generate & Run with Pipeline Visualization
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setErrorBanner(null);
    setPipelineVisible(true);
    setPipelineStep(0);

    // Animate behind-the-scenes steps smoothly
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(() => {
      setPipelineStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await generateAndRunQuery({
        prompt,
        dbUrl: dbInfo?.active_db_url,
        apiKey: aiSettings.apiKey,
        provider: aiSettings.provider,
        modelName: aiSettings.modelName,
        previousSql: queryResult?.sql || undefined,
        previousPrompt: queryResult?.prompt || undefined,
        glossaryTerms: glossaryTerms.length > 0 ? glossaryTerms : undefined,
        fewShotExamples: fewShots.length > 0 ? fewShots : undefined
      });


      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setPipelineStep(4); // Final step: Output & Visualization

      if (!res.success) {
        setErrorBanner(res.error || "Query generation was rejected or failed execution.");
      }

      setQueryResult(res);
      if (res.suggested_chart && res.suggested_chart !== 'table' && res.data?.rows?.length) {
        setActiveTab('chart');
      } else {
        setActiveTab('table');
      }

      // Record to history
      recordHistoryItem({
        prompt,
        sql: res.sql,
        success: res.success,
        rowCount: res.data?.row_count,
        executionTimeMs: res.data?.execution_time_ms,
      });
    } catch (err) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setErrorBanner((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Manual SQL Execution
  const handleExecuteEditedSql = async (sql: string) => {
    setIsExecutingSql(true);
    setErrorBanner(null);

    try {
      const res = await executeDirectSql({
        sql,
        dbUrl: dbInfo?.active_db_url
      });

      if (!res.success) {
        setErrorBanner(`SQL Execution Error: ${res.error}`);
      } else {
        setQueryResult(prev => ({
          ...(prev || { success: true }),
          sql: res.sql,
          data: res.data
        }));
      }

      // Record direct SQL execution to history
      recordHistoryItem({
        prompt: prompt.trim() ? `[Edited] ${prompt}` : `Manual SQL Execution`,
        sql: res.sql || sql,
        success: res.success,
        rowCount: res.data?.row_count,
        executionTimeMs: res.data?.execution_time_ms,
      });
    } catch (err) {
      setErrorBanner((err as Error).message);
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Handle Query Execution Plan (EXPLAIN)
  const handleExplainPlan = async (targetSql: string) => {
    if (!targetSql.trim()) return;
    setIsExplainingPlan(true);
    setIsExplainOpen(true);
    setExplainPlan(null);

    try {
      const planRes = await fetchExplainPlan({
        sql: targetSql,
        dbUrl: dbInfo?.active_db_url
      });
      setExplainPlan(planRes);
    } catch (err) {
      setExplainPlan({
        success: false,
        dialect: dbInfo?.database_type || 'sqlite',
        plan_type: 'EXPLAIN',
        raw_plan: [],
        plan_rows: [],
        has_table_scan: false,
        has_index_lookup: false,
        execution_time_ms: 0,
        sql: targetSql,
        error: (err as Error).message || 'Failed to explain query plan'
      });
    } finally {
      setIsExplainingPlan(false);
    }
  };


  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: 'var(--cohere-canvas)',
    }}>
      {/* Cohere 3-Zone Global Header */}
      <Navbar
        dbInfo={dbInfo}
        onOpenConnect={() => setIsConnectOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        dictionaryCount={glossaryTerms.length + fewShots.length}
        onRefreshSchema={loadSchema}
        isRefreshing={isRefreshing}
        apiKeyConfigured={Boolean(aiSettings.apiKey)}
        onOpenErd={() => setIsErdOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />


      {/* Main Workspace */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: 'calc(100vh - 3.5rem)',
        overflow: 'hidden',
      }}>
        {/* Schema Index Sidebar */}
        <SchemaSidebar
          tables={dbInfo?.tables || []}
          onPreviewTable={handlePreviewTable}
          onOpenErd={() => setIsErdOpen(true)}
        />

        {/* Central Content Area */}
        <main style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--cohere-canvas)',
          gap: '1.25rem',
        }}>
          {/* Editorial Error Alert Banner */}
          {errorBanner && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--cohere-error-border)',
              backgroundColor: 'var(--cohere-error-bg)',
              padding: '0.75rem 1.25rem',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <AlertCircle style={{ width: '1.1rem', height: '1.1rem', color: 'var(--cohere-error)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--cohere-error)' }}>
                  {errorBanner}
                </span>
              </div>
              <button
                onClick={() => setErrorBanner(null)}
                aria-label="Dismiss alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--cohere-error)',
                }}
              >
                <XClose style={{ width: '0.9rem', height: '0.9rem' }} />
              </button>
            </div>
          )}

          {/* Natural Language Prompt Section */}
          <div style={{ flexShrink: 0 }}>
            <PromptSection
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              samples={samples}
              activeQuery={queryResult?.sql ? { sql: queryResult.sql, prompt: queryResult.prompt } : null}
              onClearContext={() => {
                setQueryResult(null);
                setPrompt('');
                setPipelineVisible(false);
              }}
            />
          </div>

          {/* Pipeline Visualizer: Live Behind-the-Scenes Stages */}
          {(pipelineVisible || isLoading) && (
            <div style={{ flexShrink: 0 }}>
              <PipelineVisualizer
                currentStep={pipelineStep}
                isGenerating={isLoading}
                error={errorBanner}
                attempts={queryResult?.attempts || []}
              />
            </div>
          )}

          {/* Welcome Typographic Declaration (When No Results Yet) */}
          {!queryResult && !isLoading && !pipelineVisible && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '2.5rem 1rem',
              textAlign: 'center',
              gap: '1.25rem',
            }}>
              {/* Monospace System Header */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--cohere-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                ENTERPRISE TEXT-TO-SQL COMMAND CENTER
              </div>

              {/* Monumental Cohere-style tight display headline */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.4rem',
                fontWeight: 600,
                color: 'var(--cohere-black)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
                maxWidth: '38rem',
              }}>
                Turn complex questions into verified SQL queries.
              </h1>

              {/* Editorial Subtitle */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                color: 'var(--cohere-body-muted)',
                maxWidth: '30rem',
                lineHeight: 1.6,
              }}>
                Input questions in plain language. toSQL inspects live table schemas, validates statements through an AST guardrail, and renders outputs instantly.
              </p>

              {/* Outlined Pill Capability Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {[
                  'AST Read-Only Guardrails',
                  'Self-Healing Query Feedback',
                  'Deterministic Schema Extraction',
                  'Postgres & SQLite Native',
                  'Automatic Data Visualizer',
                ].map((tag, i) => (
                  <span
                    key={i}
                    className="btn-cohere-pill-outline"
                    style={{
                      cursor: 'default',
                      backgroundColor: 'var(--cohere-soft-stone)',
                      borderColor: 'transparent',
                      color: 'var(--cohere-ink)',
                      fontSize: '12px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Syntax-highlighted SQL Viewer */}
          {queryResult?.sql && (
            <div style={{ flexShrink: 0 }}>
              <SqlViewer
                sql={queryResult.sql}
                dialect={dbInfo?.database_type || 'sqlite'}
                onExecuteSql={handleExecuteEditedSql}
                isExecuting={isExecutingSql}
                onExplainPlan={handleExplainPlan}
                isExplaining={isExplainingPlan}
              />

            </div>
          )}

          {/* AI Query Explanation & Reflection Trace */}
          {queryResult?.explanation && (
            <div style={{ flexShrink: 0 }}>
              <ExplanationCard
                explanation={queryResult.explanation}
                breakdown={queryResult.breakdown}
                selfHealed={queryResult.self_healed}
                executionTimeMs={queryResult.data?.execution_time_ms}
                rowCount={queryResult.data?.row_count}
                attempts={queryResult.attempts}
                schemaPruning={queryResult.schema_pruning}
              />
            </div>
          )}

          {/* Data Grid / Visualization Section */}
          {queryResult?.data?.columns && queryResult.data.columns.length > 0 && (
            <div style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--cohere-hairline)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-subtle)',
              marginBottom: '2rem',
              flexShrink: 0,
            }}>
              {/* Tab Bar Header */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--cohere-hairline)',
                backgroundColor: 'var(--cohere-soft-stone)',
              }}>
                {/* Cohere Pill Tab Switcher */}
                <div 
                  role="tablist"
                  aria-label="Query results views"
                  style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '3px',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--cohere-hairline)',
                  }}
                >
                  {([
                    ['table', <Table key="t" style={{ width: '0.8rem', height: '0.8rem' }} />, `Data Grid (${queryResult.data.row_count})`],
                    ['chart', <BarChart03 key="b" style={{ width: '0.8rem', height: '0.8rem' }} />, 'Visualizer']
                  ] as [string, React.ReactNode, string][]).map(([id, icon, label]) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={activeTab === id}
                      onClick={() => setActiveTab(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '4px 14px',
                        borderRadius: 'var(--radius-xl)',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: activeTab === id ? 'var(--cohere-primary)' : 'transparent',
                        color: activeTab === id ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <div style={{
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--cohere-hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--cohere-deep-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cohere-deep-green)' }} />
                  Live Execution Results
                </div>
              </div>

              {/* Tab Content Area */}
              {activeTab === 'table' ? (
                <ResultsTable
                  columns={queryResult.data.columns}
                  rows={queryResult.data.rows}
                />
              ) : (
                <Visualizer
                  columns={queryResult.data.columns}
                  rows={queryResult.data.rows}
                  suggestedChart={queryResult.suggested_chart}
                  chartConfig={queryResult.chart_config}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Database Connection Dialog */}
      <ConnectionModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        currentDbUrl={dbInfo?.active_db_url}
        onConnect={handleConnect}
        isLoading={isConnecting}
      />

      {/* AI Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={saveAiSettings}
      />

      {/* Table Sample Data Preview Dialog */}
      <TablePreviewModal
        isOpen={Boolean(previewTable)}
        onClose={() => {
          setPreviewTable(null);
          setPreviewData(null);
        }}
        tableName={previewTable}
        previewData={previewData}
        isLoading={isLoadingPreview}
      />

      {/* Query History & Saved Favorites Dialog */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectQuery={handleSelectHistoryQuery}
        onToggleFavorite={handleToggleFavorite}
        onClearHistory={handleClearHistory}
        onRemoveItem={handleRemoveHistoryItem}
      />

      {/* Interactive Schema ERD Dialog */}
      <ErdModal
        isOpen={isErdOpen}
        onClose={() => setIsErdOpen(false)}
        tables={dbInfo?.tables || []}
        databaseType={dbInfo?.database_type}
        onPreviewTable={(tbl) => {
          setIsErdOpen(false);
          handlePreviewTable(tbl);
        }}
      />

      {/* Query Execution Plan (EXPLAIN) Dialog */}
      <ExplainPlanModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        plan={explainPlan}
        isLoading={isExplainingPlan}
        sql={queryResult?.sql || ''}
      />

      {/* Semantic Dictionary & Few-Shot Dialog (Plan 1.4 / A.4) */}
      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        terms={glossaryTerms}
        fewShots={fewShots}
        onSaveTerms={saveGlossaryTerms}
        onSaveFewShots={saveFewShotsList}
        onTestPrompt={(selectedPrompt) => setPrompt(selectedPrompt)}
      />
    </div>
  );
}



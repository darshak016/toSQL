import React, { useState, useEffect, useRef } from 'react';
import type { DbInfo, AiSettings, QueryResult, PreviewData, SampleQuery } from './types';
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
import { 
  fetchSchema, 
  connectDatabase, 
  fetchSampleQueries, 
  fetchTablePreview, 
  generateAndRunQuery, 
  executeDirectSql 
} from './services/api';
import { Table, BarChart03, AlertCircle, XClose } from './components/Icons';

export default function App() {
  // DB & Schema State
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [samples, setSamples] = useState<SampleQuery[]>([]);

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

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
        modelName: aiSettings.modelName
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
    } catch (err) {
      setErrorBanner((err as Error).message);
    } finally {
      setIsExecutingSql(false);
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
        onRefreshSchema={loadSchema}
        isRefreshing={isRefreshing}
        apiKeyConfigured={Boolean(aiSettings.apiKey)}
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
          backgroundColor: '#ffffff',
          gap: '1.25rem',
        }}>
          {/* Editorial Error Alert Banner */}
          {errorBanner && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
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
              />
            </div>
          )}

          {/* AI Query Explanation & Reflection Trace */}
          {queryResult?.explanation && (
            <div style={{ flexShrink: 0 }}>
              <ExplanationCard
                explanation={queryResult.explanation}
                selfHealed={queryResult.self_healed}
                executionTimeMs={queryResult.data?.execution_time_ms}
                rowCount={queryResult.data?.row_count}
                attempts={queryResult.attempts}
              />
            </div>
          )}

          {/* Data Grid / Visualization Section */}
          {queryResult?.data?.columns && queryResult.data.columns.length > 0 && (
            <div style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--cohere-hairline)',
              backgroundColor: '#ffffff',
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
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '3px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--cohere-hairline)',
                }}>
                  {([
                    ['table', <Table key="t" style={{ width: '0.8rem', height: '0.8rem' }} />, `Data Grid (${queryResult.data.row_count})`],
                    ['chart', <BarChart03 key="b" style={{ width: '0.8rem', height: '0.8rem' }} />, 'Visualizer']
                  ] as [string, React.ReactNode, string][]).map(([id, icon, label]) => (
                    <button
                      key={id}
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
                        color: activeTab === id ? '#ffffff' : 'var(--cohere-muted)',
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
                  backgroundColor: '#ffffff',
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
        isLoading={false}
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
    </div>
  );
}

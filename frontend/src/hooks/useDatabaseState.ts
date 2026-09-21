import { useState, useCallback } from 'react';
import type { DbInfo, PreviewData, AiSettings, SampleQuery } from '../types';
import { fetchSchema, connectDatabase, fetchSampleQueries, fetchTablePreview } from '../services/api';

export function useDatabaseState(aiSettings: AiSettings) {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [samples, setSamples] = useState<SampleQuery[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Connection modal state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Table preview modal state
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const loadSchema = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSchema();
      setDbInfo(data);
      setErrorBanner(null);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('No database connected')) {
        setDbInfo(null);
        setErrorBanner("No database connected. Connect via the 'Connect DB' button or configure DATABASE_URL in your backend/.env.");
      } else {
        setErrorBanner(`Could not load schema: ${msg}. Ensure backend is running.`);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleConnect = async (dbUrl: string, useSample: boolean) => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      const res = await connectDatabase(dbUrl, useSample);
      setDbInfo({
        database_type: res.database_type,
        table_count: res.table_count,
        tables: res.tables,
        active_db_url: res.active_db_url,
      });
      setIsConnectOpen(false);
      setConnectError(null);
      setErrorBanner(null);

      // Refresh dynamic suggestion queries for the newly connected database
      fetchSampleQueries(res.active_db_url, aiSettings).then(data => {
        if (data?.samples) setSamples(data.samples);
      }).catch(() => {});
    } catch (err) {
      setConnectError((err as Error).message || 'Failed to connect to database');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePreviewTable = async (tableName: string) => {
    setPreviewTable(tableName);
    setIsLoadingPreview(true);
    try {
      const data = await fetchTablePreview(tableName);
      setPreviewData(data);
    } catch (e) {
      console.error('Failed to preview table', e);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewTable(null);
    setPreviewData(null);
  };

  return {
    dbInfo,
    setDbInfo,
    isRefreshing,
    samples,
    setSamples,
    errorBanner,
    setErrorBanner,
    loadSchema,
    isConnectOpen,
    setIsConnectOpen,
    isConnecting,
    connectError,
    setConnectError,
    handleConnect,
    previewTable,
    previewData,
    isLoadingPreview,
    handlePreviewTable,
    closePreview,
  };
}

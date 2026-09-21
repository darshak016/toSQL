import { useState, useEffect } from 'react';
import type { HistoryItem } from '../types';

const STORAGE_KEY_HISTORY = 'tosql_query_history_v1';

export function useQueryHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to persist history to localStorage', e);
    }
  }, [history]);

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

  const toggleFavorite = (id: string) => {
    setHistory(prev =>
      prev.map(item => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    setHistory,
    isHistoryOpen,
    setIsHistoryOpen,
    recordHistoryItem,
    toggleFavorite,
    deleteHistoryItem,
    clearHistory,
  };
}

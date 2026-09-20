import React, { useState, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { 
  Clock, 
  Star, 
  Bookmark, 
  Trash01, 
  XClose, 
  Play, 
  Copy01, 
  Check, 
  SearchLg, 
} from './Icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectQuery: (prompt: string, sql?: string) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export default function HistoryModal({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onToggleFavorite,
  onClearHistory,
  onRemoveItem,
}: HistoryModalProps) {
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopySql = (e: React.MouseEvent, sql: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter(item => {
    if (activeTab === 'favorites' && !item.isFavorite) return false;
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      item.prompt.toLowerCase().includes(q) ||
      (item.sql && item.sql.toLowerCase().includes(q))
    );
  });

  const favoritesCount = history.filter(h => h.isFavorite).length;

  return (
    <div 
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(23, 23, 28, 0.45)',
        backdropFilter: 'blur(4px)',
        padding: '1.25rem',
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        style={{
          width: '100%',
          maxWidth: '52rem',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--cohere-hairline)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-soft-stone)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--cohere-primary)',
              color: 'var(--cohere-canvas)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div>
              <h3 id="history-modal-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--cohere-ink)',
                lineHeight: 1.2,
              }}>
                Query History &amp; Saved Favorites
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: 'var(--cohere-muted)',
              }}>
                Inspect previously executed questions, bookmark queries, or re-run with one click.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="btn-cohere-pill-outline"
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: 'var(--cohere-error)',
                  borderColor: 'var(--cohere-error-border)',
                }}
                title="Clear all stored history"
              >
                <Trash01 style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-cohere-pill-outline"
              style={{ padding: '6px', borderRadius: '50%' }}
              aria-label="Close dialog"
            >
              <XClose style={{ width: '0.85rem', height: '0.85rem' }} />
            </button>
          </div>
        </div>

        {/* Controls Toolbar: Search & Filter Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--bg-card)',
        }}>
          {/* Tab Filter */}
          <div role="tablist" aria-label="Query history categories" style={{
            display: 'flex',
            gap: '4px',
            padding: '3px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--cohere-soft-stone)',
            border: '1px solid var(--cohere-hairline)',
          }}>
            <button
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
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
                backgroundColor: activeTab === 'all' ? 'var(--cohere-primary)' : 'transparent',
                color: activeTab === 'all' ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>All Queries ({history.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
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
                backgroundColor: activeTab === 'favorites' ? 'var(--cohere-amber)' : 'transparent',
                color: activeTab === 'favorites' ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <Star style={{ width: '0.75rem', height: '0.75rem' }} filled={activeTab === 'favorites'} />
              <span>Favorites ({favoritesCount})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '16rem' }}>
            <SearchLg style={{
              position: 'absolute',
              left: '0.625rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0.8rem',
              height: '0.8rem',
              color: 'var(--cohere-muted)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              aria-label="Filter query history or SQL"
              placeholder="Filter history or SQL..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '1.875rem',
                paddingRight: '0.625rem',
                paddingTop: '0.4rem',
                paddingBottom: '0.4rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--cohere-hairline)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--cohere-ink)',
                fontSize: '0.78rem',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cohere-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--cohere-hairline)'}
            />
          </div>
        </div>

        {/* List of queries */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backgroundColor: 'var(--cohere-canvas)',
        }}>
          {filteredHistory.length === 0 ? (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}>
              <Bookmark style={{ width: '1.75rem', height: '1.75rem', color: 'var(--cohere-muted)' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--cohere-ink)' }}>
                {activeTab === 'favorites' ? 'No saved favorites yet' : 'No queries found in history'}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--cohere-muted)' }}>
                {activeTab === 'favorites'
                  ? 'Click the star icon on any query card to save it for quick access.'
                  : 'Execute natural language questions to populate your persistent history.'}
              </p>
            </div>
          ) : (
            filteredHistory.map(item => (
              <div
                key={item.id}
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--cohere-hairline)',
                  backgroundColor: 'var(--bg-card)',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Top Row: Prompt + Metadata + Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      aria-label={item.isFavorite ? 'Remove query from favorites' : 'Bookmark query as favorite'}
                      aria-pressed={item.isFavorite}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: item.isFavorite ? 'var(--cohere-amber)' : 'var(--cohere-muted)',
                        marginTop: '2px',
                      }}
                      title={item.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                    >
                      <Star style={{ width: '1.1rem', height: '1.1rem' }} filled={item.isFavorite} />
                    </button>
                    <div>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--cohere-ink)',
                        lineHeight: 1.3,
                      }}>
                        {item.prompt}
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.25rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: 'var(--cohere-muted)',
                      }}>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        {item.rowCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{item.rowCount} rows</span>
                          </>
                        )}
                        {item.executionTimeMs !== undefined && (
                          <>
                            <span>•</span>
                            <span>{item.executionTimeMs}ms</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <button
                      onClick={() => {
                        onSelectQuery(item.prompt, item.sql);
                        onClose();
                      }}
                      className="btn-cohere-primary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      title="Load prompt into prompt box"
                      aria-label={`Load query: ${item.prompt}`}
                    >
                      <Play style={{ width: '0.75rem', height: '0.75rem' }} />
                      <span>Run</span>
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="btn-cohere-pill-outline"
                      style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--cohere-muted)' }}
                      title="Delete from history"
                      aria-label={`Delete query from history: ${item.prompt}`}
                    >
                      <Trash01 style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                  </div>
                </div>

                {/* SQL Code Preview (if present) */}
                {item.sql && (
                  <div style={{
                    position: 'relative',
                    backgroundColor: 'var(--cohere-soft-stone)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--cohere-hairline)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--cohere-ink)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4,
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0.375rem',
                      right: '0.5rem',
                    }}>
                      <button
                        onClick={(e) => handleCopySql(e, item.sql!, item.id)}
                        className="btn-cohere-pill-outline"
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: 'var(--bg-card)' }}
                        title="Copy SQL query"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check style={{ width: '0.65rem', height: '0.65rem', color: 'var(--cohere-deep-green)' }} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy01 style={{ width: '0.65rem', height: '0.65rem' }} />
                            <span>Copy SQL</span>
                          </>
                        )}
                      </button>
                    </div>
                    {item.sql}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.875rem 1.5rem',
          borderTop: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-soft-stone)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--cohere-muted)',
          }}>
            History is automatically preserved in your local browser storage.
          </span>
          <button
            onClick={onClose}
            className="btn-cohere-pill-outline"
            style={{ padding: '5px 14px', fontSize: '12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

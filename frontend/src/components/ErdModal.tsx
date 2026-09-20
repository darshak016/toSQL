import React, { useState, useEffect } from 'react';
import type { TableInfo } from '../types';
import { Share04, XClose, Database01, Key01, Eye, SearchLg } from './Icons';

interface ErdModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableInfo[];
  databaseType?: string;
  onPreviewTable?: (tableName: string) => void;
}

export default function ErdModal({
  isOpen,
  onClose,
  tables = [],
  databaseType = 'SQLite',
  onPreviewTable,
}: ErdModalProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract all foreign key links
  const relationships: {
    fromTable: string;
    fromCols: string[];
    toTable: string;
    toCols: string[];
  }[] = [];

  tables.forEach(tbl => {
    (tbl.foreign_keys || []).forEach(fk => {
      if (fk.referred_table) {
        relationships.push({
          fromTable: tbl.name,
          fromCols: fk.constrained_columns || [],
          toTable: fk.referred_table,
          toCols: fk.referred_columns || [],
        });
      }
    });
  });

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(filterText.toLowerCase()) ||
    t.columns.some(c => c.name.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="untitledui-modal-backdrop" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="erd-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cohere-hairline)',
          boxShadow: 'var(--shadow-modal)',
          width: '95%',
          maxWidth: '1100px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-soft-stone)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--cohere-primary)',
              color: 'var(--cohere-canvas)',
            }}>
              <Share04 style={{ width: '1.15rem', height: '1.15rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <h3 id="erd-modal-title" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--cohere-ink)',
                }}>
                  Interactive Schema Graph &amp; ERD
                </h3>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--cohere-hairline)',
                  color: 'var(--cohere-muted)',
                  fontWeight: 600,
                }}>
                  {databaseType.toUpperCase()}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--cohere-pale-green)',
                  border: '1px solid var(--cohere-hairline)',
                  color: 'var(--cohere-deep-green)',
                  fontWeight: 600,
                }}>
                  {tables.length} Tables · {relationships.length} Relationships
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: 'var(--cohere-muted)',
                marginTop: '2px',
              }}>
                Entity Relationship Diagram mapping primary keys, foreign key constraints, and relational schemas.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search Filter */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '220px',
            }}>
              <SearchLg style={{
                position: 'absolute',
                left: '0.6rem',
                width: '0.85rem',
                height: '0.85rem',
                color: 'var(--cohere-muted)',
              }} />
              <input
                type="text"
                aria-label="Filter tables or columns in ERD"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Filter tables or columns..."
                style={{
                  width: '100%',
                  padding: '5px 10px 5px 2rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--cohere-hairline)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--cohere-ink)',
                  outline: 'none',
                }}
              />
            </div>

            <button
              onClick={onClose}
              aria-label="Close ERD modal"
              className="btn-cohere-pill-outline"
              style={{ padding: '6px 8px', color: 'var(--cohere-muted)' }}
              title="Close"
            >
              <XClose style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        {/* Relationship Summary Bar */}
        {relationships.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 1.75rem',
            backgroundColor: 'var(--cohere-soft-stone)',
            borderBottom: '1px solid var(--cohere-hairline)',
            overflowX: 'auto',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--cohere-muted)',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}>
              Foreign Keys:
            </span>
            {relationships.map((rel, idx) => {
              const isHighlighted = selectedTable === rel.fromTable || selectedTable === rel.toTable;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTable(prev => prev === rel.fromTable ? null : rel.fromTable)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    backgroundColor: isHighlighted ? 'var(--cohere-pale-blue)' : 'var(--bg-card)',
                    border: `1px solid ${isHighlighted ? 'var(--cohere-action-blue)' : 'var(--cohere-hairline)'}`,
                    color: isHighlighted ? 'var(--cohere-action-blue)' : 'var(--cohere-ink)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{rel.fromTable}.{rel.fromCols.join(',')}</span>
                  <span style={{ color: 'var(--cohere-muted)' }}>➔</span>
                  <span style={{ fontWeight: 600 }}>{rel.toTable}.{rel.toCols.join(',')}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Interactive ERD Entity Canvas */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 1.75rem',
          backgroundColor: 'var(--cohere-canvas)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}>
            {filteredTables.map(tbl => {
              const isSelected = selectedTable === tbl.name;
              const outgoingFks = (tbl.foreign_keys || []).filter(fk => fk.referred_table);
              const incomingFks = relationships.filter(rel => rel.toTable === tbl.name);

              return (
                <div
                  key={tbl.name}
                  onClick={() => setSelectedTable(prev => prev === tbl.name ? null : tbl.name)}
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isSelected ? 'var(--cohere-primary)' : 'var(--cohere-hairline)'}`,
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(0, 60, 51, 0.15), var(--shadow-subtle)' : 'var(--shadow-subtle)',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                >
                  {/* Table Card Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: isSelected ? 'var(--cohere-primary)' : 'var(--cohere-soft-stone)',
                    color: isSelected ? 'var(--cohere-canvas)' : 'var(--cohere-ink)',
                    borderBottom: '1px solid var(--cohere-hairline)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <Database01 style={{
                        width: '0.85rem',
                        height: '0.85rem',
                        color: isSelected ? 'var(--cohere-canvas)' : 'var(--cohere-primary)',
                        flexShrink: 0
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {tbl.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      {tbl.row_count !== undefined && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.62rem',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                        }}>
                          {tbl.row_count} rows
                        </span>
                      )}
                      {onPreviewTable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewTable(tbl.name);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isSelected ? 'var(--cohere-canvas)' : 'var(--cohere-muted)',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={`Preview rows in ${tbl.name}`}
                        >
                          <Eye style={{ width: '0.85rem', height: '0.85rem' }} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Columns List */}
                  <div style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: '0.25rem 0',
                  }}>
                    {tbl.columns.map((col, idx) => {
                      const isFk = outgoingFks.some(fk => fk.constrained_columns?.includes(col.name));

                      let colBg = 'transparent';
                      let colColor = 'var(--cohere-ink)';
                      if (col.primary_key) {
                        colBg = 'rgba(255, 119, 89, 0.08)';
                        colColor = 'var(--cohere-coral)';
                      } else if (isFk) {
                        colBg = 'var(--cohere-pale-blue)';
                        colColor = 'var(--cohere-action-blue)';
                      }

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.35rem 0.875rem',
                            fontSize: '0.75rem',
                            borderBottom: idx < tbl.columns.length - 1 ? '1px solid var(--cohere-hairline)' : 'none',
                            backgroundColor: colBg,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                            {col.primary_key ? (
                              <Key01 style={{ width: '0.7rem', height: '0.7rem', color: 'var(--cohere-coral)', flexShrink: 0 }} />
                            ) : isFk ? (
                              <Share04 style={{ width: '0.65rem', height: '0.65rem', color: 'var(--cohere-action-blue)', flexShrink: 0 }} />
                            ) : (
                              <span style={{ width: '0.7rem', display: 'inline-block' }} />
                            )}
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: col.primary_key ? 700 : (isFk ? 600 : 400),
                              color: colColor,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {col.name}
                            </span>
                          </div>

                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            color: 'var(--cohere-muted)',
                            marginLeft: '0.5rem',
                            flexShrink: 0,
                          }}>
                            {col.type.toLowerCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Foreign Key Connections Badges in Card Footer */}
                  {(outgoingFks.length > 0 || incomingFks.length > 0) && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderTop: '1px solid var(--cohere-hairline)',
                      backgroundColor: 'var(--cohere-soft-stone)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}>
                      {outgoingFks.map((fk, i) => (
                        <div key={i} style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          color: 'var(--cohere-action-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}>
                          <span>➔ references</span>
                          <span style={{ fontWeight: 700 }}>{fk.referred_table}</span>
                          <span>({fk.referred_columns?.join(', ')})</span>
                        </div>
                      ))}
                      {incomingFks.map((rel, i) => (
                        <div key={i} style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          color: 'var(--cohere-deep-green)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}>
                          <span>← referenced by</span>
                          <span style={{ fontWeight: 700 }}>{rel.fromTable}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

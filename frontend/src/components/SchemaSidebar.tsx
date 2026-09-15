import React, { useState } from 'react';
import type { TableInfo } from '../types';
import { 
  Database01, 
  Table, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Key01, 
  SearchLg, 
} from './Icons';

interface SchemaSidebarProps {
  tables: TableInfo[];
  onPreviewTable: (tableName: string) => void;
}

export default function SchemaSidebar({ tables = [], onPreviewTable }: SchemaSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const filteredTables = tables.filter(t =>
    t?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t?.columns?.some(c => c?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: '270px',
      minWidth: '270px',
      maxWidth: '270px',
      height: '100%',
      flexShrink: 0,
      backgroundColor: 'var(--cohere-soft-stone)',
      borderRight: '1px solid var(--cohere-hairline)',
    }}>
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--cohere-hairline)',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Database01 style={{ width: '0.9rem', height: '0.9rem', color: 'var(--cohere-primary)' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--cohere-ink)',
          }}>
            Schema Index
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--cohere-primary)',
          backgroundColor: '#ffffff',
          border: '1px solid var(--cohere-hairline)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-xl)',
        }}>
          {tables.length}
        </span>
      </div>

      {/* Search Input */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cohere-hairline)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <SearchLg style={{
            position: 'absolute',
            left: '0.625rem',
            width: '0.8rem',
            height: '0.8rem',
            color: 'var(--cohere-muted)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search schema..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '1.875rem',
              paddingRight: '0.625rem',
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--cohere-hairline)',
              backgroundColor: '#ffffff',
              color: 'var(--cohere-ink)',
              fontSize: '0.75rem',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--cohere-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--cohere-hairline)'}
          />
        </div>
      </div>

      {/* Tables List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.625rem' }}>
        {filteredTables.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--cohere-muted)',
          }}>
            No tables matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredTables.map((tbl) => {
            const isExpanded = Boolean(expandedTables[tbl.name]);
            return (
              <div
                key={tbl.name}
                style={{
                  marginBottom: '4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isExpanded ? '#ffffff' : 'transparent',
                  border: isExpanded ? '1px solid var(--cohere-hairline)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Table Header Row */}
                <div
                  onClick={() => toggleTable(tbl.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.625rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onMouseEnter={e => {
                    if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                  }}
                  onMouseLeave={e => {
                    if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    {isExpanded ? (
                      <ChevronDown style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-primary)' }} />
                    ) : (
                      <ChevronRight style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-muted)' }} />
                    )}
                    <Table style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-primary)', flexShrink: 0 }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--cohere-ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {tbl.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--cohere-muted)',
                    }}>
                      {tbl.columns?.length || 0}
                    </span>

                    {/* Table Quick Preview Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewTable(tbl.name);
                      }}
                      title="Quick preview table sample"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '1.35rem',
                        height: '1.35rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid transparent',
                        backgroundColor: 'transparent',
                        color: 'var(--cohere-slate)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--cohere-soft-stone)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--cohere-primary)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--cohere-slate)';
                      }}
                    >
                      <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                  </div>
                </div>

                {/* Expanded Columns List */}
                {isExpanded && tbl.columns && (
                  <div style={{
                    padding: '0.25rem 0.625rem 0.5rem 1.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    borderTop: '1px solid var(--cohere-card-border)',
                  }}>
                    {tbl.columns.map((col, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.7rem',
                          padding: '2px 0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                          {col.primary_key && (
                            <Key01 style={{ width: '0.65rem', height: '0.65rem', color: 'var(--cohere-coral)', flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            color: col.primary_key ? 'var(--cohere-black)' : 'var(--cohere-body-muted)',
                            fontWeight: col.primary_key ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {col.name}
                          </span>
                        </div>

                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem',
                          color: 'var(--cohere-muted)',
                          textTransform: 'uppercase',
                        }}>
                          {col.type?.split('(')[0] || 'TEXT'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

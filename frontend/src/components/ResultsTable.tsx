import React, { useState } from 'react';
import { 
  Download01, 
  SearchLg, 
  ChevronLeft, 
  ChevronRight, 
  Table as TableIcon,
} from './Icons';

interface ResultsTableProps {
  columns?: string[];
  rows?: (string | number | null)[][];
}

export default function ResultsTable({ columns = [], rows = [] }: ResultsTableProps) {
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const filteredRows = rows.filter(row =>
    row.some(cell => String(cell).toLowerCase().includes(filterText.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const displayedRows = filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const exportCSV = () => {
    if (!columns.length || !rows.length) return;
    const header = columns.join(',');
    const csvRows = rows.map(r =>
      r.map(v => {
        const str = String(v ?? '');
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    );
    const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', `tosql_results_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (!columns.length) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1rem',
        textAlign: 'center',
        backgroundColor: 'var(--cohere-canvas)',
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--cohere-soft-stone)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}>
          <TableIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--cohere-muted)' }} />
        </div>
        <h4 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--cohere-ink)',
          marginBottom: '0.25rem',
        }}>
          No Output Yet
        </h4>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: 'var(--cohere-muted)',
        }}>
          Submit a natural language query above to inspect query outputs.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#ffffff' }}>
      {/* Table Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--cohere-hairline)',
        backgroundColor: 'var(--cohere-canvas)',
      }}>
        {/* Search / Filter Filter */}
        <div style={{ position: 'relative', width: '18rem' }}>
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
            placeholder="Search rows..."
            value={filterText}
            onChange={e => { setFilterText(e.target.value); setPage(0); }}
            style={{
              width: '100%',
              paddingLeft: '1.875rem',
              paddingRight: '0.625rem',
              paddingTop: '0.4rem',
              paddingBottom: '0.4rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--cohere-hairline)',
              backgroundColor: '#ffffff',
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

        {/* Right Info and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cohere-muted)',
          }}>
            Showing {filteredRows.length} {filteredRows.length === 1 ? 'record' : 'records'}
          </span>

          <button
            onClick={exportCSV}
            className="btn-cohere-pill-outline"
            style={{ padding: '5px 12px', fontSize: '12px' }}
          >
            <Download01 style={{ width: '0.8rem', height: '0.8rem' }} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Data Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-body)',
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--cohere-hairline)',
              backgroundColor: 'var(--cohere-soft-stone)',
            }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '0.625rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--cohere-ink)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    color: 'var(--cohere-muted)',
                  }}
                >
                  No records match filter criteria.
                </td>
              </tr>
            ) : (
              displayedRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: '1px solid var(--cohere-hairline)',
                    backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--cohere-pale-blue)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = rIdx % 2 === 0 ? '#ffffff' : '#fafafa'}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '0.625rem 1rem',
                        color: 'var(--cohere-ink)',
                        whiteSpace: 'nowrap',
                        fontFamily: typeof cell === 'number' ? 'var(--font-mono)' : 'var(--font-body)',
                      }}
                    >
                      {cell === null ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          color: 'var(--cohere-muted)',
                          fontStyle: 'italic',
                        }}>
                          null
                        </span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-canvas)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cohere-muted)',
          }}>
            Page {page + 1} of {totalPages}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-cohere-pill-outline"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                opacity: page === 0 ? 0.4 : 1,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-cohere-pill-outline"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                opacity: page >= totalPages - 1 ? 0.4 : 1,
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Next</span>
              <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

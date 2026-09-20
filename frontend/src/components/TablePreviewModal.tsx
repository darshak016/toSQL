import React, { useEffect } from 'react';
import type { PreviewData } from '../types';
import { Table, XClose, RefreshCw01 } from './Icons';

interface TablePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string | null;
  previewData: PreviewData | null;
  isLoading: boolean;
}

export default function TablePreviewModal({ 
  isOpen, 
  onClose, 
  tableName, 
  previewData, 
  isLoading 
}: TablePreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="untitledui-modal-backdrop" onClick={onClose} role="presentation">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-preview-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cohere-hairline)',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: '720px',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-soft-stone)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--cohere-primary)',
              color: 'var(--cohere-canvas)',
            }}>
              <Table style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 id="table-preview-modal-title" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--cohere-ink)',
                }}>
                  Table Inspection: {tableName}
                </h3>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--cohere-hairline)',
                  color: 'var(--cohere-primary)',
                }}>
                  Sample 5 Rows
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--cohere-muted)' }}>
                Direct snapshot preview of table columns and raw cell values
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close modal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--cohere-muted)',
              cursor: 'pointer',
            }}
          >
            <XClose style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1.25rem' }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--cohere-muted)',
            }}>
              <RefreshCw01 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite', color: 'var(--cohere-primary)' }} />
              <span style={{ marginTop: '0.75rem' }}>Fetching schema snapshot...</span>
            </div>
          ) : previewData?.columns?.length ? (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-xs)', border: '1px solid var(--cohere-hairline)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--cohere-soft-stone)', borderBottom: '1px solid var(--cohere-hairline)' }}>
                    {previewData.columns.map((col, idx) => (
                      <th 
                        key={idx} 
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
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
                  {previewData.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: '1px solid var(--cohere-hairline)',
                        backgroundColor: rIdx % 2 === 0 ? 'var(--bg-card)' : 'var(--cohere-soft-stone)',
                      }}
                    >
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            color: 'var(--cohere-ink)',
                            whiteSpace: 'nowrap',
                            fontFamily: typeof val === 'number' ? 'var(--font-mono)' : 'var(--font-body)',
                          }}
                        >
                          {val === null ? (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.7rem',
                              color: 'var(--cohere-muted)',
                              fontStyle: 'italic',
                            }}>
                              null
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--cohere-muted)' }}>
              No rows recorded in table.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--cohere-hairline)',
          backgroundColor: 'var(--cohere-soft-stone)',
        }}>
          <button
            onClick={onClose}
            className="btn-cohere-primary"
            style={{ padding: '5px 16px', fontSize: '12px' }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

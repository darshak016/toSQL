import React, { useState, useEffect } from 'react';
import { Database01, Check, XClose, AlertCircle } from './Icons';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDbUrl?: string;
  onConnect: (dbUrl: string, useSample: boolean) => void;
  isLoading: boolean;
  connectionError?: string | null;
  onClearError?: () => void;
}

export default function ConnectionModal({ 
  isOpen, 
  onClose, 
  currentDbUrl, 
  onConnect,
  isLoading,
  connectionError,
  onClearError
}: ConnectionModalProps) {
  const [customUrl, setCustomUrl] = useState(currentDbUrl || '');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setCustomUrl(currentDbUrl || '');
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = customUrl.trim();
    if (finalUrl.startsWith('postgres://')) finalUrl = finalUrl.replace('postgres://', 'postgresql://');
    onConnect(finalUrl, false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
    if (connectionError && onClearError) {
      onClearError();
    }
  };

  return (
    <div className="untitledui-modal-backdrop" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cohere-hairline)',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: '520px',
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
              <Database01 style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div>
              <h3 id="connection-modal-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--cohere-ink)',
              }}>
                Database Connection
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--cohere-muted)' }}>
                Connect to PostgreSQL, Supabase, MySQL, or SQLite
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Connection Error Banner */}
          {connectionError && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--cohere-error-bg)',
                border: '1px solid var(--cohere-error-border)',
                color: 'var(--cohere-error)',
              }}
            >
              <AlertCircle style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Connection Failed</span>
                <span style={{ fontSize: '0.74rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {connectionError}
                </span>
              </div>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  aria-label="Dismiss connection error"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--cohere-error)',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <XClose style={{ width: '0.9rem', height: '0.9rem' }} />
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="database-uri-input" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--cohere-ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Database Connection URL / URI
            </label>
            <input
              id="database-uri-input"
              type="text"
              aria-label="Database Connection URL"
              placeholder="postgresql://user:password@host:5432/dbname or sqlite:///path/to/db.sqlite"
              value={customUrl}
              onChange={handleInputChange}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem',
                borderRadius: 'var(--radius-xs)',
                border: connectionError ? '1px solid var(--cohere-error-border)' : '1px solid var(--cohere-hairline)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--cohere-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = connectionError ? 'var(--cohere-error)' : 'var(--cohere-primary)'}
              onBlur={e => e.target.style.borderColor = connectionError ? 'var(--cohere-error-border)' : 'var(--cohere-hairline)'}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--cohere-muted)', lineHeight: 1.4 }}>
              Supports PostgreSQL, Supabase connection poolers, MySQL, and SQLite. You can also configure <code>DATABASE_URL</code> in <code>backend/.env</code>.
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--cohere-hairline)',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-cohere-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !customUrl.trim()}
              className="btn-cohere-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                opacity: isLoading ? 0.75 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  <span>Connecting Database...</span>
                </>
              ) : (
                <>
                  <Check style={{ width: '0.85rem', height: '0.85rem' }} />
                  <span>Connect Database</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

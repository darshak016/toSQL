import React, { useState } from 'react';
import { Database01, Check, XClose } from './Icons';

export default function ConnectionModal({ 
  isOpen, 
  onClose, 
  currentDbUrl, 
  onConnect,
  isLoading 
}) {
  const [selectedType, setSelectedType] = useState('supabase');
  const [customUrl, setCustomUrl] = useState(
    currentDbUrl && !currentDbUrl.includes('ecommerce.db') ? currentDbUrl : ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedType === 'sample') {
      onConnect('', true);
    } else {
      let finalUrl = customUrl.trim();
      if (finalUrl.startsWith('postgres://')) finalUrl = finalUrl.replace('postgres://', 'postgresql://');
      onConnect(finalUrl, false);
    }
  };

  return (
    <div className="untitledui-modal-backdrop" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cohere-hairline)',
          boxShadow: 'var(--shadow-console)',
          width: '100%',
          maxWidth: '480px',
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
              color: '#ffffff',
            }}>
              <Database01 style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--cohere-ink)',
              }}>
                Database Connection
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--cohere-muted)' }}>
                Connect SQLite demo instance or Supabase PostgreSQL
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
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {/* Supabase option */}
            <div
              onClick={() => setSelectedType('supabase')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedType === 'supabase' ? '2px solid var(--cohere-primary)' : '1px solid var(--cohere-hairline)',
                backgroundColor: selectedType === 'supabase' ? 'var(--cohere-pale-green)' : '#ffffff',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                checked={selectedType === 'supabase'}
                onChange={() => setSelectedType('supabase')}
                style={{ marginTop: '0.2rem', accentColor: 'var(--cohere-primary)' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cohere-ink)' }}>
                  Supabase / PostgreSQL
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cohere-muted)' }}>
                  Production database with real schemas and SSL pooling
                </div>
              </div>
            </div>

            {/* Sample SQLite option */}
            <div
              onClick={() => setSelectedType('sample')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedType === 'sample' ? '2px solid var(--cohere-primary)' : '1px solid var(--cohere-hairline)',
                backgroundColor: selectedType === 'sample' ? 'var(--cohere-soft-stone)' : '#ffffff',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                checked={selectedType === 'sample'}
                onChange={() => setSelectedType('sample')}
                style={{ marginTop: '0.2rem', accentColor: 'var(--cohere-primary)' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cohere-ink)' }}>
                  Local E-Commerce Demo (SQLite)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cohere-muted)' }}>
                  Pre-populated customers, orders, products, and categories
                </div>
              </div>
            </div>
          </div>

          {/* Connection URI Input (if Supabase selected) */}
          {selectedType === 'supabase' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--cohere-ink)',
                textTransform: 'uppercase',
              }}>
                PostgreSQL Connection URI
              </label>
              <input
                type="password"
                placeholder="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--cohere-hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--cohere-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--cohere-hairline)'}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--cohere-muted)' }}>
                Supports Supabase session &amp; transaction connection poolers.
              </span>
            </div>
          )}

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
              disabled={isLoading || (selectedType === 'supabase' && !customUrl.trim())}
              className="btn-cohere-primary"
            >
              <Check style={{ width: '0.85rem', height: '0.85rem' }} />
              <span>{isLoading ? 'Connecting...' : 'Connect Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

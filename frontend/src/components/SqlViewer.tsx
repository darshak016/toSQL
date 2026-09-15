import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Edit01, 
  RefreshCw01, 
  Copy01, 
  Check, 
} from './Icons';

function highlightSql(sql: string): React.ReactNode[] {
  if (!sql) return [];
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|ON|AND|OR|NOT|IN|IS|NULL|COUNT|SUM|AVG|MAX|MIN|DISTINCT|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|ASC|DESC|WITH|UNION|INTERSECT|EXCEPT|CREATE|DROP|INSERT|UPDATE|DELETE|ALTER|INDEX|VIEW)\b/gi;
  const numbers = /\b(\d+(\.\d+)?)\b/g;
  const strings = /('(?:''|[^'])*')/g;

  return sql.split('\n').map((line, idx) => {
    const html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(strings, '<span style="color:#059669;font-weight:500">$1</span>')
      .replace(keywords, (m) => `<span style="color:#1d4ed8;font-weight:700">${m.toUpperCase()}</span>`)
      .replace(numbers, '<span style="color:#d97706;font-weight:600">$1</span>');
    return (
      <div key={idx} style={{ display: 'table-row' }}>
        <span style={{
          display: 'table-cell',
          paddingRight: '1.25rem',
          userSelect: 'none',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#9ca3af',
          minWidth: '2.5rem',
        }}>
          {idx + 1}
        </span>
        <span
          style={{
            display: 'table-cell',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.7,
            color: '#111827',
          }}
          dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }}
        />
      </div>
    );
  });
}

interface SqlViewerProps {
  sql: string;
  dialect?: string;
  onExecuteSql?: (sql: string) => void;
  isExecuting?: boolean;
}

export default function SqlViewer({ sql, dialect = 'sqlite', onExecuteSql, isExecuting }: SqlViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableSql, setEditableSql] = useState(sql || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => { setEditableSql(sql || ''); }, [sql]);

  const handleRun = () => { if (onExecuteSql && editableSql.trim()) onExecuteSql(editableSql); };
  const handleReset = () => { setEditableSql(sql || ''); setIsEditing(false); };
  const handleCopy = () => {
    navigator.clipboard.writeText(editableSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sql) return null;

  return (
    <div style={{
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--cohere-hairline)',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--cohere-hairline)',
        backgroundColor: 'var(--cohere-soft-stone)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Terminal style={{ width: '0.9rem', height: '0.9rem', color: 'var(--cohere-primary)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--cohere-ink)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            GENERATED SQL QUERY
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--cohere-muted)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--cohere-hairline)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-xs)',
          }}>
            {dialect.toUpperCase()}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCopy}
            className="btn-cohere-pill-outline"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            {copied ? (
              <>
                <Check style={{ width: '0.75rem', height: '0.75rem', color: '#059669' }} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy01 style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>Copy</span>
              </>
            )}
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-cohere-pill-outline"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              <Edit01 style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>Edit SQL</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="btn-cohere-pill-outline"
                style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--cohere-muted)' }}
              >
                <RefreshCw01 style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>Reset</span>
              </button>

              <button
                onClick={handleRun}
                disabled={isExecuting}
                className="btn-cohere-primary"
                style={{ padding: '4px 14px', fontSize: '11px' }}
              >
                <Play style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>{isExecuting ? 'Running...' : 'Execute Edited SQL'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Light Editor / Highlighted Body */}
      <div style={{ padding: '1.25rem', backgroundColor: '#fafafc' }}>
        {isEditing ? (
          <textarea
            value={editableSql}
            onChange={e => setEditableSql(e.target.value)}
            rows={Math.max(4, editableSql.split('\n').length + 1)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: 'var(--cohere-ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              padding: '0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--cohere-hairline)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        ) : (
          <div style={{ display: 'table', width: '100%', overflowX: 'auto' }}>
            {highlightSql(sql)}
          </div>
        )}
      </div>
    </div>
  );
}

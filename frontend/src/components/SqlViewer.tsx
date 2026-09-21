import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Edit01, 
  RefreshCw01, 
  Copy01, 
  Check, 
  Zap,
  Activity,
} from './Icons';

import { formatSql } from '../utils/sqlFormatter';

import { highlightSql } from './SqlCodeBlock';

interface SqlViewerProps {
  sql: string;
  dialect?: string;
  onExecuteSql?: (sql: string) => void;
  isExecuting?: boolean;
  onExplainPlan?: (sql: string) => void;
  isExplaining?: boolean;
}

export default function SqlViewer({ 
  sql, 
  dialect = 'sqlite', 
  onExecuteSql, 
  isExecuting,
  onExplainPlan,
  isExplaining
}: SqlViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableSql, setEditableSql] = useState(sql || '');
  const [copied, setCopied] = useState(false);
  const [formattedToast, setFormattedToast] = useState(false);

  useEffect(() => { setEditableSql(sql || ''); }, [sql]);

  const handleRun = () => {
    if (onExecuteSql && editableSql.trim()) {
      onExecuteSql(editableSql);
    }
  };

  const handleReset = () => {
    setEditableSql(sql);
    setIsEditing(false);
  };

  const handleExplain = () => {
    if (onExplainPlan && editableSql.trim()) {
      onExplainPlan(editableSql);
    }
  };
  const handleCopy = () => {

    navigator.clipboard.writeText(editableSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    const formatted = formatSql(editableSql);
    setEditableSql(formatted);
    setFormattedToast(true);
    setTimeout(() => setFormattedToast(false), 2000);
  };

  if (!sql) return null;

  return (
    <div style={{
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--cohere-hairline)',
      backgroundColor: 'var(--bg-card)',
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
            backgroundColor: 'var(--bg-card)',
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
            onClick={handleExplain}
            disabled={isExplaining}
            className="btn-cohere-pill-outline"
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px',
              color: 'var(--cohere-ink)'
            }}
            title="Inspect query execution plan (EXPLAIN QUERY PLAN)"
          >
            <Activity style={{ width: '0.75rem', height: '0.75rem', color: 'var(--cohere-primary)' }} />
            <span>{isExplaining ? 'Explaining...' : 'Explain Plan'}</span>
          </button>

          <button
            onClick={handleFormat}
            className="btn-cohere-pill-outline"
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px',
              backgroundColor: formattedToast ? 'var(--cohere-pale-green)' : 'transparent',
              borderColor: formattedToast ? 'var(--cohere-success-border)' : 'var(--cohere-hairline)',
              color: formattedToast ? 'var(--cohere-deep-green)' : 'var(--cohere-ink)'
            }}
            title="Auto-format and uppercase SQL keywords"
          >
            {formattedToast ? (
              <>
                <Check style={{ width: '0.75rem', height: '0.75rem', color: 'var(--cohere-deep-green)' }} />
                <span>Formatted!</span>
              </>
            ) : (
              <>
                <Zap style={{ width: '0.75rem', height: '0.75rem', color: 'var(--cohere-coral)' }} />
                <span>Format SQL</span>
              </>
            )}
          </button>


          <button
            onClick={handleCopy}
            className="btn-cohere-pill-outline"
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px',
              backgroundColor: copied ? 'var(--cohere-pale-green)' : 'transparent',
              borderColor: copied ? 'var(--cohere-success-border)' : 'var(--cohere-hairline)',
              color: copied ? 'var(--cohere-deep-green)' : 'var(--cohere-ink)'
            }}
          >
            {copied ? (
              <>
                <Check style={{ width: '0.75rem', height: '0.75rem', color: 'var(--cohere-deep-green)' }} />
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

      {/* Light / Dark Editor / Highlighted Body */}
      <div style={{ padding: '1.25rem', backgroundColor: 'var(--cohere-canvas)' }}>
        {isEditing ? (
          <textarea
            id="editable-sql-input"
            aria-label="Editable SQL statement"
            value={editableSql}
            onChange={e => setEditableSql(e.target.value)}
            rows={Math.max(4, editableSql.split('\n').length + 1)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
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

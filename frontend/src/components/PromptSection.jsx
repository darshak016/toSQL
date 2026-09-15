import React from 'react';
import { Send01 } from './Icons';

export default function PromptSection({
  prompt,
  setPrompt,
  onGenerate,
  isLoading,
  samples = []
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) onGenerate();
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--cohere-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.5rem',
      boxShadow: 'var(--shadow-subtle)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top accent hairline */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, var(--cohere-coral), var(--cohere-primary), var(--cohere-action-blue))',
      }} />

      {/* Header with Monospace Label & Model Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.875rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--cohere-ink)',
          }}>
            QUERY CONSOLE
          </span>
          <span style={{ color: 'var(--cohere-hairline)' }}>|</span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--cohere-muted)',
          }}>
            Ask questions in plain English
          </span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '2px 8px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--cohere-soft-stone)',
          border: '1px solid var(--cohere-hairline)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'var(--cohere-primary)',
        }}>
          <span style={{ color: 'var(--cohere-deep-green)' }}>●</span>
          <span>READY</span>
        </div>
      </div>

      {/* Cohere Taxonomy Chips for Samples */}
      {samples.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.625rem',
          marginBottom: '0.5rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--cohere-muted)',
            letterSpacing: '0.05em',
            flexShrink: 0,
            textTransform: 'uppercase',
          }}>
            Suggested:
          </span>
          {samples.map((item, idx) => (
            <button
              key={idx}
              className="chip-cohere-taxonomy"
              onClick={() => setPrompt(item.prompt)}
              title={item.prompt}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderColor: prompt === item.prompt ? 'var(--cohere-coral)' : 'var(--cohere-hairline)',
                backgroundColor: prompt === item.prompt ? 'var(--cohere-coral)' : 'var(--cohere-soft-stone)',
                color: prompt === item.prompt ? '#ffffff' : 'var(--cohere-ink)',
              }}
            >
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Light Textarea Input Area */}
      <div style={{
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--cohere-hairline)',
        backgroundColor: 'var(--cohere-soft-stone)',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = 'var(--cohere-primary)';
          e.currentTarget.style.backgroundColor = '#ffffff';
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = 'var(--cohere-hairline)';
          e.currentTarget.style.backgroundColor = 'var(--cohere-soft-stone)';
        }}
      >
        <textarea
          placeholder="Ask anything about your database (e.g. 'Show top 5 customers by total completed revenue with their email and order count')..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
          style={{
            width: '100%',
            resize: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            padding: '0.875rem 1rem',
            fontSize: '0.88rem',
            color: 'var(--cohere-ink)',
            lineHeight: 1.6,
            outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />

        {/* Input Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 1rem',
          borderTop: '1px solid var(--cohere-hairline)',
          backgroundColor: '#ffffff',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--cohere-muted)',
          }}>
            <span style={{
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--cohere-hairline)',
              backgroundColor: 'var(--cohere-soft-stone)',
              padding: '1px 5px',
              color: 'var(--cohere-ink)',
              fontWeight: 600,
            }}>
              Return ↵
            </span>
            <span>to generate &amp; execute query</span>
          </div>

          <button
            onClick={onGenerate}
            disabled={!prompt.trim() || isLoading}
            className="btn-cohere-primary"
            style={{
              padding: '6px 18px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {isLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                <span>Synthesizing SQL...</span>
              </>
            ) : (
              <>
                <Send01 style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>Run Query</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

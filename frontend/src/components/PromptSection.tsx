import React from 'react';
import type { SampleQuery, FollowUpSuggestion } from '../types';
import { Send01 } from './Icons';

interface PromptSectionProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  samples?: SampleQuery[];
  followUpSuggestions?: FollowUpSuggestion[];
  activeQuery?: {
    sql?: string;
    prompt?: string;
  } | null;
  onClearContext?: () => void;
}

export default function PromptSection({
  prompt,
  setPrompt,
  onGenerate,
  isLoading,
  samples = [],
  followUpSuggestions = [],
  activeQuery,
  onClearContext,
}: PromptSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) onGenerate();
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
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

      {/* Conversational Follow-up Context Pill */}
      {activeQuery?.sql && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          marginBottom: '0.75rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--cohere-pale-blue)',
          border: '1px solid var(--cohere-hairline)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--cohere-action-blue)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              flexShrink: 0
            }}>
              Follow-Up Mode
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--cohere-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              Refining: {activeQuery.prompt || "Previous Query"}
            </span>
          </div>
          {onClearContext && (
            <button
              onClick={onClearContext}
              title="Start fresh new query"
              aria-label="Start fresh new query"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.7rem',
                color: 'var(--cohere-action-blue)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
                opacity: 0.85,
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
            >
              <span>New Thread ✕</span>
            </button>
          )}
        </div>
      )}

      {/* Suggested Quick Refinement Chips when in Follow-up Mode */}
      {activeQuery?.sql ? (
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
            Quick Refine:
          </span>
          {(followUpSuggestions.length > 0
            ? followUpSuggestions.map(s => ({ label: s.label, val: s.prompt }))
            : [
                { label: 'Only top 3', val: 'Only show the top 3' },
                { label: 'Sort lowest first', val: 'Sort ascending (lowest first)' },
                { label: 'Filter condition', val: 'Filter these results further' },
              ]
          ).map((chip, idx) => (
            <button
              key={idx}
              className="chip-cohere-taxonomy"
              onClick={() => setPrompt(chip.val)}
              title={chip.val}
              style={{
                fontSize: '11px',
                padding: '3px 9px',
                borderColor: prompt === chip.val ? 'var(--cohere-action-blue)' : 'var(--cohere-hairline)',
                backgroundColor: prompt === chip.val ? 'var(--cohere-pale-blue)' : 'var(--cohere-soft-stone)',
                color: prompt === chip.val ? 'var(--cohere-action-blue)' : 'var(--cohere-ink)',
                fontWeight: prompt === chip.val ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      ) : (
        /* Cohere Taxonomy Chips for Samples */
        samples.length > 0 && (
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
        )
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
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--cohere-primary)';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)';
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--cohere-hairline)';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--cohere-soft-stone)';
        }}
      >
        <textarea
          id="sql-prompt-input"
          aria-label="Natural language SQL query input"
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
          backgroundColor: 'var(--bg-card)',
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

import React from 'react';
import type { QueryAttempt } from '../types';
import { AnnotationInfo, Clock, LayersThree01, Zap } from './Icons';

interface ExplanationCardProps {
  explanation: string | null;
  breakdown?: import('../types').QueryBreakdown;
  selfHealed?: boolean;
  executionTimeMs?: number;
  rowCount?: number;
  attempts?: QueryAttempt[];
}

export default function ExplanationCard({ 
  explanation, 
  breakdown,
  selfHealed, 
  executionTimeMs, 
  rowCount,
  attempts 
}: ExplanationCardProps) {
  if (!explanation) return null;

  const hasBreakdown = breakdown && (
    (breakdown.tables_used && breakdown.tables_used.length > 0) ||
    (breakdown.joins && breakdown.joins.length > 0) ||
    (breakdown.filters && breakdown.filters.length > 0) ||
    (breakdown.aggregations && breakdown.aggregations.length > 0) ||
    (breakdown.assumptions && breakdown.assumptions.length > 0)
  );

  return (
    <div style={{
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--cohere-hairline)',
      backgroundColor: 'var(--cohere-soft-stone)',
      padding: '1.25rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--cohere-hairline)',
        marginBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <AnnotationInfo style={{ width: '1rem', height: '1rem', color: 'var(--cohere-primary)' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--cohere-ink)',
            letterSpacing: '-0.01em',
          }}>
            Query Synthesis &amp; Logic Explanation
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          {selfHealed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#047857',
            }}>
              <Zap style={{ width: '0.75rem', height: '0.75rem' }} />
              Self-Healed AST
            </div>
          )}

          {executionTimeMs !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--cohere-muted)',
            }}>
              <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>{executionTimeMs} ms</span>
            </div>
          )}

          {rowCount !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--cohere-muted)',
            }}>
              <LayersThree01 style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>{rowCount} {rowCount === 1 ? 'row' : 'rows'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation Text */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        color: 'var(--cohere-ink)',
        marginBottom: hasBreakdown ? '1rem' : '0',
      }}>
        {explanation}
      </p>

      {/* Phase 2.2: Structured Query Breakdown Badges */}
      {hasBreakdown && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          padding: '0.875rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: '#ffffff',
          border: '1px solid var(--cohere-hairline)',
          marginBottom: '0.5rem',
        }}>
          {/* Tables Used */}
          {breakdown.tables_used && breakdown.tables_used.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#4b5563',
                marginBottom: '0.35rem',
              }}>
                Tables Referenced
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {breakdown.tables_used.map((tbl, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {tbl}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Join Conditions */}
          {breakdown.joins && breakdown.joins.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#4b5563',
                marginBottom: '0.35rem',
              }}>
                Joins &amp; Relations
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {breakdown.joins.map((jn, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: '#f5f3ff',
                      color: '#6d28d9',
                      border: '1px solid #ddd6fe',
                    }}
                  >
                    {jn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Applied Filters */}
          {breakdown.filters && breakdown.filters.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#4b5563',
                marginBottom: '0.35rem',
              }}>
                Applied Filters
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {breakdown.filters.map((flt, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                    }}
                  >
                    {flt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Aggregations */}
          {breakdown.aggregations && breakdown.aggregations.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#4b5563',
                marginBottom: '0.35rem',
              }}>
                Aggregations
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {breakdown.aggregations.map((agg, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {agg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Autonomous Reflection & Repair History */}
      {attempts && attempts.length > 1 && (
        <div style={{
          marginTop: '0.875rem',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid #fed7aa',
          backgroundColor: '#fffbeb',
          padding: '0.75rem 1rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#b45309',
            marginBottom: '0.375rem',
          }}>
            <Zap style={{ width: '0.8rem', height: '0.8rem' }} />
            Self-Correction &amp; Execution Reflection Trace:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {attempts.map((att, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#78350f',
              }}>
                Iteration {att.attempt}: {att.success ? '✓ Successfully resolved and passed AST inspection' : `⚠ Execution notice: "${att.error}" — Auto-adjusted schema mapping`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

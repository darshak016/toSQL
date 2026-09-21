import React, { useState } from 'react';
import type { QueryAttempt, PruningMetadata } from '../types';
import { AnnotationInfo, Clock, LayersThree01, Zap, Database01 } from './Icons';

interface ExplanationCardProps {
  explanation: string | null;
  breakdown?: import('../types').QueryBreakdown;
  selfHealed?: boolean;
  executionTimeMs?: number;
  rowCount?: number;
  attempts?: QueryAttempt[];
  schemaPruning?: PruningMetadata;
}

export default function ExplanationCard({ 
  explanation, 
  breakdown,
  selfHealed, 
  executionTimeMs, 
  rowCount,
  attempts,
  schemaPruning
}: ExplanationCardProps) {
  const [showPruneDetails, setShowPruneDetails] = useState(false);

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
          {schemaPruning && schemaPruning.is_pruned && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowPruneDetails(!showPruneDetails)}
                title="Click to view schema pruning details"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '2px 9px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--cohere-hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--cohere-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Database01 style={{ width: '0.72rem', height: '0.72rem' }} />
                <span>Pruned: {schemaPruning.retained_tables.length}/{schemaPruning.total_tables} tables (~{schemaPruning.estimated_tokens_saved} tokens saved)</span>
              </button>

              {showPruneDetails && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  zIndex: 30,
                  width: '280px',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--cohere-hairline)',
                  boxShadow: 'var(--shadow-modal)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--cohere-ink)',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--cohere-primary)' }}>
                    ⚡ Schema Token Optimization
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cohere-muted)', marginBottom: '0.6rem' }}>
                    Irrelevant tables were pruned to prevent token overflow and avoid hallucinated join paths.
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--cohere-deep-green)' }}>Retained in Prompt ({schemaPruning.retained_tables.length}):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '3px' }}>
                      {schemaPruning.retained_tables.map(t => (
                        <span key={t} style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--cohere-pale-green)',
                          border: '1px solid var(--cohere-success-border)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          color: 'var(--cohere-deep-green)'
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {schemaPruning.pruned_tables.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--cohere-muted)' }}>Pruned Out ({schemaPruning.pruned_tables.length}):</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '3px' }}>
                        {schemaPruning.pruned_tables.slice(0, 10).map(t => (
                          <span key={t} style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--cohere-soft-stone)',
                            border: '1px solid var(--cohere-hairline)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            color: 'var(--cohere-muted)'
                          }}>
                            {t}
                          </span>
                        ))}
                        {schemaPruning.pruned_tables.length > 10 && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--cohere-muted)' }}>
                            +{schemaPruning.pruned_tables.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selfHealed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--cohere-pale-green)',
              border: '1px solid var(--cohere-success-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--cohere-deep-green)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--cohere-soft-stone)',
          border: '1px solid var(--cohere-hairline)',
          marginBottom: '0.5rem',
        }}>
          {/* Tables Used */}
          {breakdown.tables_used && breakdown.tables_used.length > 0 && (
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--cohere-muted)',
                marginBottom: '0.5rem',
              }}>
                Tables Referenced
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {breakdown.tables_used.map((tbl, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--cohere-pale-blue)',
                      color: 'var(--cohere-action-blue)',
                      border: '1px solid var(--cohere-hairline)',
                      wordBreak: 'break-word',
                      lineHeight: 1.4,
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
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--cohere-muted)',
                marginBottom: '0.5rem',
              }}>
                Joins &amp; Relations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {breakdown.joins.map((jn, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--cohere-purple-bg)',
                      color: 'var(--cohere-purple-text)',
                      border: '1px solid var(--cohere-purple-border)',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.4,
                      display: 'inline-block',
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
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--cohere-muted)',
                marginBottom: '0.5rem',
              }}>
                Applied Filters
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {breakdown.filters.map((flt, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--cohere-amber-bg)',
                      color: 'var(--cohere-amber-text)',
                      border: '1px solid var(--cohere-amber-border)',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.4,
                      display: 'inline-block',
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
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--cohere-muted)',
                marginBottom: '0.5rem',
              }}>
                Aggregations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {breakdown.aggregations.map((agg, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--cohere-pale-green)',
                      color: 'var(--cohere-deep-green)',
                      border: '1px solid var(--cohere-success-border)',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.4,
                      display: 'inline-block',
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
          border: '1px solid var(--cohere-amber-border)',
          backgroundColor: 'var(--cohere-amber-bg)',
          padding: '0.75rem 1rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--cohere-amber-text)',
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
                color: 'var(--cohere-amber-text)',
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

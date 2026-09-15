import React from 'react';
import type { QueryAttempt } from '../types';
import { AnnotationInfo, Clock, LayersThree01, Zap } from './Icons';

interface ExplanationCardProps {
  explanation: string | null;
  selfHealed?: boolean;
  executionTimeMs?: number;
  rowCount?: number;
  attempts?: QueryAttempt[];
}

export default function ExplanationCard({ 
  explanation, 
  selfHealed, 
  executionTimeMs, 
  rowCount,
  attempts 
}: ExplanationCardProps) {
  if (!explanation) return null;

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
      }}>
        {explanation}
      </p>

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

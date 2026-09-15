import React from 'react';
import type { PipelineStep, QueryAttempt } from '../types';
import { Check, AlertCircle } from './Icons';

interface PipelineVisualizerProps {
  currentStep?: number;
  steps?: PipelineStep[];
  isGenerating?: boolean;
  error?: string | null;
  attempts?: QueryAttempt[];
}

export default function PipelineVisualizer({ 
  currentStep = 0, 
  steps = [], 
  isGenerating = false,
  error = null,
  attempts = []
}: PipelineVisualizerProps) {
  const defaultSteps: PipelineStep[] = [
    {
      id: 'introspect',
      title: 'Schema Introspection',
      desc: 'Extracting live tables, primary keys, foreign keys & column types',
      tag: 'DATABASE'
    },
    {
      id: 'llm',
      title: 'AI Translation & Prompting',
      desc: 'LLM synthesizes SQL dialect & query intent from schema context',
      tag: 'MODEL'
    },
    {
      id: 'ast',
      title: 'AST & Guardrails Inspection',
      desc: 'Validating AST syntax tree, verifying SELECT read-only integrity',
      tag: 'SECURITY'
    },
    {
      id: 'execute',
      title: 'Query Execution & Healing',
      desc: 'Running safe query against database with auto-repair reflection',
      tag: 'EXECUTION'
    },
    {
      id: 'visualize',
      title: 'Output & Visualization',
      desc: 'Formatting table records, calculating execution metrics & charts',
      tag: 'RESULTS'
    }
  ];

  const pipeline = steps.length > 0 ? steps : defaultSteps;

  return (
    <div style={{
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--cohere-hairline)',
      backgroundColor: '#ffffff',
      padding: '1.25rem 1.5rem',
      boxShadow: 'var(--shadow-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--cohere-hairline)',
        paddingBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--cohere-ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            BEHIND THE SCENES: EXECUTION PIPELINE
          </span>
          <span style={{ color: 'var(--cohere-hairline)' }}>|</span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--cohere-muted)',
          }}>
            Live Step-by-Step AI Engine Trace
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          fontWeight: 600,
          color: isGenerating ? 'var(--cohere-coral)' : (error ? 'var(--cohere-error)' : 'var(--cohere-deep-green)'),
        }}>
          {isGenerating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--cohere-coral)',
                animation: 'pulse 1s ease-in-out infinite'
              }} />
              <span>PROCESSING PIPELINE...</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle style={{ width: '0.8rem', height: '0.8rem', color: 'var(--cohere-error)' }} />
              <span>PIPELINE STOPPED</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--cohere-deep-green)' }} />
              <span>PIPELINE COMPLETED</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Track */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.75rem',
      }}>
        {pipeline.map((step, idx) => {
          const isDone = currentStep > idx || (!isGenerating && !error);
          const isCurrent = currentStep === idx && isGenerating;
          const isFailed = currentStep === idx && !!error;

          let bg = 'var(--cohere-soft-stone)';
          let borderColor = 'var(--cohere-hairline)';
          let textColor = 'var(--cohere-muted)';

          if (isDone) {
            bg = '#f0fdf4';
            borderColor = '#bbf7d0';
            textColor = 'var(--cohere-ink)';
          } else if (isCurrent) {
            bg = '#fff7ed';
            borderColor = 'var(--cohere-coral)';
            textColor = 'var(--cohere-ink)';
          } else if (isFailed) {
            bg = '#fef2f2';
            borderColor = '#fecaca';
            textColor = 'var(--cohere-error)';
          }

          return (
            <div
              key={step.id}
              style={{
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Step Top Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--cohere-muted)',
                  textTransform: 'uppercase',
                }}>
                  STEP 0{idx + 1}
                </span>

                {/* Status Indicator Icon */}
                {isDone ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                  }}>
                    <Check style={{ width: '0.65rem', height: '0.65rem', strokeWidth: 3 }} />
                  </div>
                ) : isCurrent ? (
                  <div style={{
                    width: '0.85rem',
                    height: '0.85rem',
                    borderRadius: '50%',
                    border: '2px solid var(--cohere-coral)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                ) : isFailed ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cohere-error)',
                    color: '#ffffff',
                  }}>
                    ✕
                  </div>
                ) : (
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cohere-hairline)',
                  }} />
                )}
              </div>

              {/* Title */}
              <h5 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: textColor,
                lineHeight: 1.2,
              }}>
                {step.title}
              </h5>

              {/* Description */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.68rem',
                color: isDone ? 'var(--cohere-body-muted)' : 'var(--cohere-muted)',
                lineHeight: 1.4,
              }}>
                {step.desc}
              </p>

              {/* Tag */}
              <span style={{
                marginTop: 'auto',
                paddingTop: '0.25rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                fontWeight: 600,
                color: 'var(--cohere-muted)',
                letterSpacing: '0.04em',
              }}>
                [{step.tag}]
              </span>
            </div>
          );
        })}
      </div>

      {/* Autonomous Self-Healing Retry Loop Indicator (If any) */}
      {attempts && attempts.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.5rem 0.875rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: '#92400e',
        }}>
          <span style={{ fontWeight: 700 }}>🔄 Self-Healing Active:</span>
          <span>
            Initial execution encountered an error. The autonomous reflection engine auto-corrected syntax &amp; recovered in {attempts.length} attempts.
          </span>
        </div>
      )}
    </div>
  );
}

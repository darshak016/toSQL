import React from 'react';
import { AlertCircle, RefreshCw01, Trash01 } from './Icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled React exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Could not clear storage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || String(this.state.error);
      const stack = this.state.error?.stack || this.state.errorInfo?.componentStack || '';

      return (
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--cohere-canvas)',
          padding: '1.5rem',
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '32rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--cohere-hairline)',
            backgroundColor: 'var(--bg-card)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-modal)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                height: '3rem',
                width: '3rem',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(217, 45, 32, 0.1)',
                color: 'var(--cohere-error)',
              }}>
                <AlertCircle style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--cohere-ink)',
                  margin: 0,
                }}>
                  Something went wrong
                </h3>
                <p style={{
                  marginTop: '0.25rem',
                  fontSize: '0.75rem',
                  lineHeight: '1.5',
                  color: 'var(--cohere-muted)',
                }}>
                  The application encountered an unexpected runtime error. You can reload or reset your browser state.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div style={{
              marginTop: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(247, 144, 9, 0.3)',
              backgroundColor: 'rgba(247, 144, 9, 0.08)',
              padding: '0.875rem',
              fontSize: '0.75rem',
              color: 'var(--cohere-ink)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--cohere-coral)' }}>Error: </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{message}</span>
            </div>

            {/* Stack trace detail if present */}
            {stack && (
              <details style={{ marginTop: '0.75rem', fontSize: '11px', color: 'var(--cohere-muted)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
                  Show technical stack trace
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  maxHeight: '11rem',
                  overflowY: 'auto',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--cohere-canvas)',
                  border: '1px solid var(--cohere-hairline)',
                  padding: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--cohere-slate)',
                  lineHeight: '1.5',
                  userSelect: 'all',
                }}>
                  {stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid var(--cohere-hairline)',
              paddingTop: '1rem',
            }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-cohere-pill-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.85rem',
                }}
              >
                <Trash01 style={{ width: '0.85rem', height: '0.85rem', color: 'var(--cohere-muted)' }} />
                <span>Reset Cache &amp; Storage</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="btn-cohere-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.85rem',
                }}
              >
                <RefreshCw01 style={{ width: '0.85rem', height: '0.85rem' }} />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

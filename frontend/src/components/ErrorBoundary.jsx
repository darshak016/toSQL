import React from 'react';
import { AlertCircle, RefreshCw01, Trash01 } from './Icons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled React exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
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
        <div className="flex min-h-screen w-screen items-center justify-center bg-[#f9fafb] p-6 font-sans">
          <div className="w-full max-w-lg rounded-2xl border border-[#eaecf0] bg-white p-7 shadow-lg">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef3f2] text-[#d92d20] ring-4 ring-[#fee4e2]">
                <AlertCircle className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#101828]">
                  Something went wrong
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#475467]">
                  The application encountered an unexpected runtime error. You can reload or reset your browser state.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="mt-5 rounded-xl border border-[#fedf89] bg-[#fffaeb] p-3.5 text-xs text-[#b54708]">
              <span className="font-semibold text-[#93370d]">Error: </span>
              <span className="font-mono">{message}</span>
            </div>

            {/* Stack trace detail if present */}
            {stack && (
              <details className="mt-3 text-[11px] text-[#667085]">
                <summary className="cursor-pointer font-medium hover:text-[#101828]">
                  Show technical stack trace
                </summary>
                <pre className="mt-2 max-h-44 overflow-y-auto rounded-lg bg-[#0f172a] p-3 font-mono text-[10px] text-[#cbd5e1] leading-relaxed select-all">
                  {stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#eaecf0] pt-4">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#eaecf0] bg-white px-3.5 py-2 text-xs font-semibold text-[#344054] shadow-xs transition hover:bg-[#f9fafb] hover:text-[#101828]"
              >
                <Trash01 className="size-3.5 text-[#98a2b3]" />
                <span>Reset Cache & Storage</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-[#155eef] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#174dc4]"
              >
                <RefreshCw01 className="size-3.5 text-white" />
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

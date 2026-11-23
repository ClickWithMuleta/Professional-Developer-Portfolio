import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[320px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface-1 border border-stroke-muted rounded-xl p-6 shadow-ambient text-center">
            <div className="w-12 h-12 rounded-lg bg-status-error/10 border border-status-error/20 flex items-center justify-center mx-auto mb-4 text-status-error">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              An unexpected render error occurred in this view.
            </p>
            {this.state.error && (
              <pre className="text-xs font-mono text-text-muted bg-surface-2 p-3 rounded-md text-left overflow-x-auto mb-6 max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text-primary border border-stroke-muted rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-matchwork-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h2 className="matchwork-subheading text-red-600 mb-2">
              Что-то пошло не так
            </h2>
            <p className="matchwork-text mb-4 text-balance">
              Произошла неожиданная ошибка. Попробуйте обновить страницу.
            </p>
            {this.state.error && (
              <details className="text-left mb-4 p-3 bg-red-50 rounded-lg">
                <summary className="text-sm font-medium text-red-700 cursor-pointer">
                  Подробности ошибки
                </summary>
                <pre className="text-xs text-red-600 mt-2 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button onClick={this.handleRetry} className="matchwork-button-primary">
              <RefreshCw size={16} className="mr-2" />
              Попробовать снова
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center bg-[#F7FAFC]">
          <span className="text-6xl">⚠️</span>
          <h2 className="text-xl font-bold text-[#181C1E]">应用出错了</h2>
          <p className="text-[#717783] text-sm max-w-xs">
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-2 bg-[#005DA7] text-white rounded-full text-sm font-semibold hover:bg-[#004A86] transition-colors"
          >
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

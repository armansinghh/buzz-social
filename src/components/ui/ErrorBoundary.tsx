import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime exception captured:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-(--bg-primary) px-4 text-center select-none">
          <div className="max-w-sm space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/25 animate-pulse">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-base font-bold text-(--text-primary)">
                Something went wrong
              </h1>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Buzz encountered an unexpected glitch. Try refreshing the application stream to restore functionality.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-(--accent) text-(--bg-primary) hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
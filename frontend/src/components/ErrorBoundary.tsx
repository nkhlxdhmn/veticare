import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-red-600">Something went wrong</p>
          <p className="text-xs text-red-500 max-w-md text-center">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

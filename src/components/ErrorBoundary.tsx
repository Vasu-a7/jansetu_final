import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            JanSetu encountered a temporary component render error. Please reload the application or return to the home screen.
          </p>
          <div className="mt-6 flex gap-3">
            <Button size="sm" onClick={this.handleReload} className="text-xs font-semibold">
              <RefreshCw className="size-3.5 mr-1.5" /> Reload Application
            </Button>
            <a href="/">
              <Button size="sm" variant="outline" className="text-xs font-semibold">
                Go to Home
              </Button>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


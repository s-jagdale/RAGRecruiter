import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("RAGRecruiter UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="rounded-full bg-red-50 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="max-w-md text-ink-500">
            This screen hit an unexpected error. Reloading usually fixes it — your interview
            progress is saved on the backend as you go.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

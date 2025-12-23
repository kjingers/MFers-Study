import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode
  /** Optional fallback component */
  fallback?: ReactNode
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean
  /** The error that occurred */
  error: Error | null
}

/**
 * Error boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the whole app.
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    
    // In production, you could log to an error reporting service here
    // e.g., Sentry.captureException(error)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Please try again.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="default">
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * A simpler error boundary for smaller sections of the app.
 * Shows a more compact error message.
 */
export class SectionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("SectionErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <p className="text-sm text-destructive mb-2">
            Something went wrong loading this section.
          </p>
          <Button onClick={this.handleReset} size="sm" variant="outline">
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

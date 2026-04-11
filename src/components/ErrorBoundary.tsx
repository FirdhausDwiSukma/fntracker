import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-neo dark:bg-gray-900 p-6">
          <div className="border-neo-thick border-dark shadow-neo bg-light dark:bg-gray-800 p-8 max-w-md w-full">
            <h1 className="text-2xl font-black mb-2 text-danger">Something went wrong</h1>
            <p className="font-medium text-gray-600 dark:text-gray-300 mb-4">
              An unexpected error occurred. Please refresh the page.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 border-neo border-dark p-3 overflow-auto mb-4">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="border-neo-thick border-dark bg-primary shadow-neo px-4 py-2 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

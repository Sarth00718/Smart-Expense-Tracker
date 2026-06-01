import React from 'react'
import { motion } from 'framer-motion'

/**
 * Base FeatureErrorBoundary — isolates failures to a single feature.
 * One feature crash never takes down the entire app.
 */
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    const feature = this.props.feature || 'Unknown'
    // Consistent error logging (issue #9)
    console.error(`[ErrorBoundary:${feature}]`, error.message, errorInfo.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { feature = 'This section', compact = false } = this.props

    if (compact) {
      return (
        <div className="flex items-center justify-center p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
              {feature} failed to load
            </p>
            <button
              onClick={this.handleRetry}
              className="text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 min-h-[200px]"
      >
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">
          {feature} encountered an error
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-4">
          This section failed to load. The rest of the app is unaffected.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded max-w-full overflow-auto mb-4">
            {this.state.error.toString()}
          </pre>
        )}
        <button
          onClick={this.handleRetry}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Retry
        </button>
      </motion.div>
    )
  }
}

// ── Named feature boundaries (issue #9) ───────────────────────────────────────

export const DashboardErrorBoundary  = (props) => <FeatureErrorBoundary {...props} feature="Dashboard" />
export const ExpenseErrorBoundary    = (props) => <FeatureErrorBoundary {...props} feature="Expenses" />
export const IncomeErrorBoundary     = (props) => <FeatureErrorBoundary {...props} feature="Income" />
export const AnalyticsErrorBoundary  = (props) => <FeatureErrorBoundary {...props} feature="Analytics" />
export const ProjectErrorBoundary    = (props) => <FeatureErrorBoundary {...props} feature="Goals" />

export default FeatureErrorBoundary

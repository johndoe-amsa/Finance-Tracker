import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'

function FullPageFallback({ error, onReset }) {
  return (
    <div className="min-h-screen bg-bg dark:bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error/10 mb-4">
          <AlertTriangle size={22} className="text-error" strokeWidth={1.5} />
        </div>
        <h1 className="text-subtitle font-semibold text-text dark:text-dark-text mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-small text-text-muted dark:text-dark-text-muted mb-6">
          L'application a rencontré un problème inattendu. Rechargez la page pour continuer.
        </p>
        {error?.message && (
          <p className="text-tiny font-mono text-text-subtle dark:text-dark-text-subtle bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg px-3 py-2 mb-6 text-left break-all">
            {error.message}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={() => window.location.reload()} className="w-full justify-center">
            <RefreshCw size={14} />
            Recharger l'application
          </Button>
          {onReset && (
            <Button variant="ghost" onClick={onReset} className="w-full justify-center">
              Réessayer sans recharger
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionFallback({ error, onReset, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-error/10 mb-3">
        <AlertTriangle size={18} className="text-error" strokeWidth={1.5} />
      </div>
      <p className="text-small font-medium text-text dark:text-dark-text mb-1">
        {label || 'Section indisponible'}
      </p>
      <p className="text-xs text-text-muted dark:text-dark-text-muted mb-4">
        Une erreur a empêché l'affichage de cette section.
      </p>
      {onReset && (
        <Button size="sm" variant="secondary" onClick={onReset}>
          <RefreshCw size={12} />
          Réessayer
        </Button>
      )}
    </div>
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error.message, info.componentStack)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fullPage) {
        return (
          <FullPageFallback
            error={this.state.error}
            onReset={this.props.resetable ? this.handleReset : null}
          />
        )
      }
      return (
        <SectionFallback
          error={this.state.error}
          onReset={this.handleReset}
          label={this.props.label}
        />
      )
    }

    return this.props.children
  }
}

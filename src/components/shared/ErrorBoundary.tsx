import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SkyArt } from './SkyArt'

/** Keeps one broken component from blanking the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // Navigating away clears the error so the next page can render.
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto flex min-h-[80dvh] max-w-[420px] flex-col items-center justify-center px-6 text-center">
        <SkyArt size={150} />
        <h1 className="mt-8 text-display">Something went wrong</h1>
        <p className="mt-2 text-body text-ink-3">Something on this screen failed to load. Your trips and expenses are safe on this device.</p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={() => this.setState({ error: null })} className="luminous press h-12 rounded-full px-6 font-semibold">
            Try again
          </button>
          <Link to="/" onClick={() => this.setState({ error: null })} className="press glass-control flex h-12 items-center rounded-full px-6 font-semibold">
            Back to trips
          </Link>
        </div>
      </div>
    )
  }
}

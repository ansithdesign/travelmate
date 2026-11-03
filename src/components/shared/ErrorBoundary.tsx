import { Component, type ReactNode } from 'react'
import { Window } from '../ui/Cover'

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
      <div className="on-sky mx-auto flex min-h-[80dvh] max-w-[420px] flex-col items-center justify-center px-6 text-center">
        <Window seed={2} shade={0.6} className="aspect-[0.76] w-[140px]" />
        <h1 className="text-sky mt-8 text-display">A little turbulence</h1>
        <p className="text-sky-2 mt-2 text-body">Something on this screen failed to load. Your trips and expenses are safe on this device.</p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={() => this.setState({ error: null })} className="press h-12 rounded-full bg-white px-6 font-semibold text-[#0c1736]">
            Try again
          </button>
          <a href="/" className="press glass-control flex h-12 items-center rounded-full px-6 font-semibold text-white">
            Back to trips
          </a>
        </div>
      </div>
    )
  }
}

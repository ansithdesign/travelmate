import { Link } from 'react-router-dom'
import { Milestone } from '../components/ui/Milestone'

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[440px] flex-col items-center justify-center px-6 text-center">
      <Milestone tone="ink" cap="Road" value="end" size="lg" label="Dead end" />
      <h1 className="mt-6 text-title">This page is not on the map</h1>
      <p className="mt-2 text-body text-ink-2">The trip may have been deleted, or the link is wrong.</p>
      <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-md bg-forest px-4 font-medium text-white hover:bg-forest-700">
        Back to trips
      </Link>
    </div>
  )
}

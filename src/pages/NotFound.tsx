import { Link } from 'react-router-dom'
import { SkyHero } from '../components/shared/Page'
import { SkyArt } from '../components/shared/SkyArt'

export function NotFound() {
  return (
    <SkyHero className="flex min-h-[80dvh] flex-col items-center justify-center text-center">
      <SkyArt size={160} />
      <h1 className="mt-8 text-display">Lost in the clouds</h1>
      <p className="mt-2 max-w-[34ch] text-body text-ink-3">This trip may have been deleted, or the link is wrong.</p>
      <Link to="/" className="luminous press mt-6 inline-flex h-14 items-center rounded-full px-[26px] text-base font-semibold">
        Back to trips
      </Link>
    </SkyHero>
  )
}

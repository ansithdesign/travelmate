import { Link } from 'react-router-dom'
import { SkyHero } from '../components/shared/Page'
import { Window } from '../components/ui/Cover'

export function NotFound() {
  return (
    <SkyHero className="flex min-h-[80dvh] flex-col items-center justify-center text-center">
      <Window seed={3} shade={0.55} className="aspect-[0.76] w-[150px]" />
      <h1 className="text-sky mt-8 text-display">Lost in the clouds</h1>
      <p className="text-sky-2 mt-2 max-w-[34ch] text-body">This trip may have been deleted, or the link is wrong.</p>
      <Link to="/" className="press mt-6 inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-[#0c1736] shadow-[0_10px_30px_-12px_rgb(8_20_60/0.5)]">
        Back to trips
      </Link>
    </SkyHero>
  )
}

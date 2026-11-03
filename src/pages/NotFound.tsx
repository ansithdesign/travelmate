import { Link } from 'react-router-dom'
import { ContentSheet, SheetBody, SkyHero } from '../components/shared/Page'
import { SkyArt } from '../components/shared/SkyArt'

export function NotFound() {
  return (
    <>
      <SkyHero className="h-24">
        <span />
      </SkyHero>
      <ContentSheet>
        <SheetBody>
          <div className="my-auto flex flex-col items-center py-8 text-center">
            <SkyArt size={150} />
            <h1 className="mt-6 text-display">Lost in the clouds</h1>
            <p className="mt-2 max-w-[34ch] text-body text-ink-3">This trip may have been deleted, or the link is wrong.</p>
            <Link to="/" className="luminous press mt-6 inline-flex h-14 items-center rounded-full px-[26px] text-base font-semibold">
              Back to trips
            </Link>
          </div>
        </SheetBody>
      </ContentSheet>
    </>
  )
}

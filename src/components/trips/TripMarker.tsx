import type { TripStatus } from '../../hooks/useTrip'
import type { Trip } from '../../types'
import { parseDate } from '../../utils/dates'
import { Milestone } from '../ui/Milestone'

/** Milestone that states where a trip is in time. */
export function TripMarker({ trip, status, size = 'md', className }: { trip: Trip; status: TripStatus; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  switch (status.phase) {
    case 'upcoming':
      return status.days === 1 ? (
        <Milestone tone="amber" cap="From" value="1" unit="day" size={size} className={className} label="Starts tomorrow" />
      ) : (
        <Milestone tone="amber" cap="In" value={status.days} unit="days" size={size} className={className} label={`Starts in ${status.days} days`} />
      )
    case 'ongoing':
      return (
        <Milestone tone="forest" cap="Day" value={status.days} unit={`of ${status.length}`} size={size} className={className} label={`Day ${status.days} of ${status.length}`} />
      )
    case 'ended':
      return <Milestone tone="ink" cap="Ended" value={status.days} unit={status.days === 1 ? 'day ago' : 'days ago'} size={size} className={className} label={`Ended ${status.days} days ago`} />
    case 'completed':
      return <Milestone tone="forest" cap={parseDate(trip.startDate).toLocaleString('en-IN', { month: 'short' })} value={parseDate(trip.startDate).getFullYear()} size={size} className={className} label={`Travelled ${parseDate(trip.startDate).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`} />
  }
}

export function phaseLabel(status: TripStatus): string {
  switch (status.phase) {
    case 'upcoming':
      return status.days === 1 ? 'Starts tomorrow' : `Starts in ${status.days} days`
    case 'ongoing':
      return `On the road, day ${status.days} of ${status.length}`
    case 'ended':
      return 'Ended, not marked complete'
    case 'completed':
      return 'Completed'
  }
}

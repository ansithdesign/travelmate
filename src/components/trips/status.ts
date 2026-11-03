import type { TripStatus } from '../../hooks/useTrip'
import type { Trip } from '../../types'
import { fmt } from '../../utils/dates'

/** The countdown or day count shown in big numerals, plus the words around it. */
export function countdown(status: TripStatus): { pre: string; value: string; post: string } {
  switch (status.phase) {
    case 'upcoming':
      return status.days === 1 ? { pre: 'Leaving', value: '1', post: 'day to go' } : { pre: 'Leaving in', value: String(status.days), post: 'days' }
    case 'ongoing':
      return { pre: 'Day', value: String(status.days), post: `of ${status.length}` }
    case 'ended':
      return { pre: 'Back for', value: String(status.days), post: status.days === 1 ? 'day' : 'days' }
    case 'completed':
      return { pre: '', value: '', post: '' }
  }
}

export function phaseLabel(trip: Trip, status: TripStatus): string {
  switch (status.phase) {
    case 'upcoming':
      return status.days === 1 ? 'Leaving tomorrow' : `In ${status.days} days`
    case 'ongoing':
      return `Day ${status.days} of ${status.length}`
    case 'ended':
      return 'Back home, not marked complete'
    case 'completed':
      return fmt.monthYear(trip.startDate)
  }
}

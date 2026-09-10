import { people } from '../data/mockPeople.js'

export type OccupancyStatus =
  | 'AVAILABLE'
  | 'NEAR_CAPACITY'
  | 'FULL'

export type Occupancy = {
  locationId: string
  current: number
  maximum: number
  status: OccupancyStatus
}

const LOCATION_ID = 'OFFICE-01'
const MAXIMUM_OCCUPANCY = 10

export function calculateOccupancyStatus(
  current: number,
  maximum: number,
): OccupancyStatus {
  if (current >= maximum) {
    return 'FULL'
  }

  if (current >= maximum * 0.8) {
    return 'NEAR_CAPACITY'
  }

  return 'AVAILABLE'
}

export function getOccupancy(
  locationId: string,
): Occupancy | undefined {
  if (locationId !== LOCATION_ID) {
    return undefined
  }

  const current = people.filter((person) => person.inside).length

  return {
    locationId,
    current,
    maximum: MAXIMUM_OCCUPANCY,
    status: calculateOccupancyStatus(
      current,
      MAXIMUM_OCCUPANCY,
    ),
  }
}
import { findPersonByCardUid } from '../data/mockPeople.js'
import type { AccessRequest } from '../types/accessRequest.js'

type ConfirmationDecision = {
  confirmed: boolean
  reasonCode: string | null
}

export function confirmPersonCrossing(
  accessRequest: AccessRequest,
): ConfirmationDecision {
  const person = findPersonByCardUid(accessRequest.cardUid)

  if (!person) {
    return {
      confirmed: false,
      reasonCode: 'CARD_UNKNOWN',
    }
  }

  if (accessRequest.direction === 'ENTRY') {
    if (person.inside) {
      return {
        confirmed: false,
        reasonCode: 'ALREADY_INSIDE',
      }
    }

    person.inside = true
    person.entriesToday += 1
  } else {
    if (!person.inside) {
      return {
        confirmed: false,
        reasonCode: 'ALREADY_OUTSIDE',
      }
    }

    person.inside = false
  }

  return {
    confirmed: true,
    reasonCode: null,
  }
}
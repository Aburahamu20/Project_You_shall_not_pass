import {
  findPersonByCardUid,
  findPersonById,
} from '../data/mockPeople.js'
import { getOccupancy } from './occupancy.js'
import type { AccessRequest } from '../types/accessRequest.js'

type AccessDecision = {
  state: 'AUTHORIZED' | 'REJECTED'
  reasonCode: string | null
}

export function evaluateMockFace(
  accessRequest: AccessRequest,
  mockIdentityId: string,
): AccessDecision {
  const cardOwner = findPersonByCardUid(accessRequest.cardUid)
  const faceOwner = findPersonById(mockIdentityId)

  if (!cardOwner) {
    return {
      state: 'REJECTED',
      reasonCode: 'CARD_UNKNOWN',
    }
  }

  if (!faceOwner || cardOwner.id !== faceOwner.id) {
    return {
      state: 'REJECTED',
      reasonCode: 'FACE_MISMATCH',
    }
  }

  if (cardOwner.blocked) {
    return {
      state: 'REJECTED',
      reasonCode: 'CARD_BLOCKED',
    }
  }

  if (accessRequest.direction === 'ENTRY' && cardOwner.inside) {
    return {
      state: 'REJECTED',
      reasonCode: 'ALREADY_INSIDE',
    }
  }

  if (accessRequest.direction === 'EXIT' && !cardOwner.inside) {
    return {
      state: 'REJECTED',
      reasonCode: 'ALREADY_OUTSIDE',
    }
  }

  if (accessRequest.direction === 'ENTRY') {
    const occupancy = getOccupancy(accessRequest.locationId)

    if (occupancy?.status === 'FULL') {
      return {
        state: 'REJECTED',
        reasonCode: 'CAPACITY_FULL',
      }
    }
  }

  return {
    state: 'AUTHORIZED',
    reasonCode: null,
  }
}
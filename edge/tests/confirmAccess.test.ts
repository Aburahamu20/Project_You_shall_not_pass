import { beforeEach, describe, expect, it } from 'vitest'

import {
  findPersonById,
  resetPeople,
} from '../src/data/mockPeople.js'
import { confirmPersonCrossing } from '../src/services/confirmAccess.js'
import type { AccessRequest } from '../src/types/accessRequest.js'

function createAuthorizedRequest(
  changes: Partial<AccessRequest> = {},
): AccessRequest {
  return {
    requestId: 'REQ-001',
    cardUid: 'RFID-001',
    direction: 'ENTRY',
    source: 'EDGE_SIMULATOR',
    deviceId: 'TURNSTILE-01',
    locationId: 'OFFICE-01',
    state: 'AUTHORIZED',
    reasonCode: null,
    operationMode: 'ONLINE',
    createdAt: '2026-09-09T12:00:00.000Z',
    expiresAt: '2026-09-09T12:05:00.000Z',
    ...changes,
  }
}

describe('confirmPersonCrossing', () => {
  beforeEach(() => {
    resetPeople()
  })

  it('confirma una entrada y actualiza la presencia', () => {
    const decision = confirmPersonCrossing(
      createAuthorizedRequest(),
    )

    expect(decision).toEqual({
      confirmed: true,
      reasonCode: null,
    })
    expect(findPersonById('1')).toMatchObject({
      inside: true,
      entriesToday: 1,
    })
  })

  it('confirma una salida sin aumentar las entradas del día', () => {
    const decision = confirmPersonCrossing(
      createAuthorizedRequest({
        cardUid: 'RFID-002',
        direction: 'EXIT',
      }),
    )

    expect(decision).toEqual({
      confirmed: true,
      reasonCode: null,
    })
    expect(findPersonById('2')).toMatchObject({
      inside: false,
      entriesToday: 1,
    })
  })

  it('rechaza una segunda entrada', () => {
    const decision = confirmPersonCrossing(
      createAuthorizedRequest({
        cardUid: 'RFID-002',
      }),
    )

    expect(decision).toEqual({
      confirmed: false,
      reasonCode: 'ALREADY_INSIDE',
    })
    expect(findPersonById('2')).toMatchObject({
      inside: true,
      entriesToday: 1,
    })
  })

  it('rechaza una salida si la persona no está dentro', () => {
    const decision = confirmPersonCrossing(
      createAuthorizedRequest({
        direction: 'EXIT',
      }),
    )

    expect(decision).toEqual({
      confirmed: false,
      reasonCode: 'ALREADY_OUTSIDE',
    })
    expect(findPersonById('1')).toMatchObject({
      inside: false,
      entriesToday: 0,
    })
  })

  it('rechaza una tarjeta desconocida', () => {
    const decision = confirmPersonCrossing(
      createAuthorizedRequest({
        cardUid: 'RFID-UNKNOWN',
      }),
    )

    expect(decision).toEqual({
      confirmed: false,
      reasonCode: 'CARD_UNKNOWN',
    })
  })
})
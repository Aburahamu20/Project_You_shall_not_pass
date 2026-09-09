import { beforeEach, describe, expect, it } from 'vitest'

import { resetPeople } from '../src/data/mockPeople.js'
import { evaluateMockFace } from '../src/services/accessDecision.js'
import type { AccessRequest } from '../src/types/accessRequest.js'

function createRequest(
  changes: Partial<AccessRequest> = {},
): AccessRequest {
  return {
    requestId: 'REQ-001',
    cardUid: 'RFID-001',
    direction: 'ENTRY',
    source: 'EDGE_SIMULATOR',
    deviceId: 'TURNSTILE-01',
    locationId: 'OFFICE-01',
    state: 'PENDING_FACE',
    reasonCode: null,
    operationMode: 'ONLINE',
    createdAt: '2026-09-09T12:00:00.000Z',
    expiresAt: '2026-09-09T12:05:00.000Z',
    ...changes,
  }
}

describe('evaluateMockFace', () => {
  beforeEach(() => {
    resetPeople()
  })

  it('autoriza cuando la tarjeta y el rostro coinciden', () => {
    const decision = evaluateMockFace(createRequest(), '1')

    expect(decision).toEqual({
      state: 'AUTHORIZED',
      reasonCode: null,
    })
  })

  it('rechaza una tarjeta desconocida', () => {
    const decision = evaluateMockFace(
      createRequest({ cardUid: 'RFID-UNKNOWN' }),
      '1',
    )

    expect(decision).toEqual({
      state: 'REJECTED',
      reasonCode: 'CARD_UNKNOWN',
    })
  })

  it('rechaza cuando la tarjeta y el rostro no coinciden', () => {
    const decision = evaluateMockFace(createRequest(), '2')

    expect(decision).toEqual({
      state: 'REJECTED',
      reasonCode: 'FACE_MISMATCH',
    })
  })

  it('rechaza una tarjeta bloqueada', () => {
    const decision = evaluateMockFace(
      createRequest({ cardUid: 'RFID-003' }),
      '3',
    )

    expect(decision).toEqual({
      state: 'REJECTED',
      reasonCode: 'CARD_BLOCKED',
    })
  })

  it('rechaza una segunda entrada', () => {
    const decision = evaluateMockFace(
      createRequest({ cardUid: 'RFID-002' }),
      '2',
    )

    expect(decision).toEqual({
      state: 'REJECTED',
      reasonCode: 'ALREADY_INSIDE',
    })
  })

  it('rechaza la salida de una persona que no está dentro', () => {
    const decision = evaluateMockFace(
      createRequest({ direction: 'EXIT' }),
      '1',
    )

    expect(decision).toEqual({
      state: 'REJECTED',
      reasonCode: 'ALREADY_OUTSIDE',
    })
  })
})
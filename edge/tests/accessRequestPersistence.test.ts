import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearAccessRequests,
  findAccessRequest,
  findRequestIdByIdempotencyKey,
  saveAccessRequest,
  saveConfirmationIdempotencyKey,
} from '../src/stores/accessRequestStore.js'
import type { AccessRequest } from '../src/types/accessRequest.js'

function createAccessRequest(
  changes: Partial<AccessRequest> = {},
): AccessRequest {
  return {
    requestId: 'REQ-PERSISTENCE-001',
    cardUid: 'RFID-001',
    direction: 'ENTRY',
    source: 'EDGE_SIMULATOR',
    deviceId: 'TURNSTILE-01',
    locationId: 'OFFICE-01',
    state: 'PENDING_FACE',
    reasonCode: null,
    operationMode: 'ONLINE',
    createdAt: '2026-09-11T12:00:00.000Z',
    expiresAt: '2026-09-11T12:05:00.000Z',
    ...changes,
  }
}

describe('Access request persistence', () => {
  beforeEach(() => {
    clearAccessRequests()
  })

  it('guarda y recupera una solicitud completa', () => {
    const accessRequest = createAccessRequest()

    saveAccessRequest(accessRequest)

    expect(
      findAccessRequest(accessRequest.requestId),
    ).toEqual(accessRequest)
  })

  it('actualiza una solicitud existente', () => {
    const accessRequest = createAccessRequest()

    saveAccessRequest(accessRequest)

    saveAccessRequest({
      ...accessRequest,
      state: 'AUTHORIZED',
    })

    expect(
      findAccessRequest(accessRequest.requestId),
    ).toEqual({
      ...accessRequest,
      state: 'AUTHORIZED',
    })
  })

  it('persiste una clave de idempotencia', () => {
    const accessRequest = createAccessRequest()

    saveAccessRequest(accessRequest)

    saveConfirmationIdempotencyKey(
      'IDEMPOTENCY-PERSISTENCE-001',
      accessRequest.requestId,
    )

    expect(
      findRequestIdByIdempotencyKey(
        'IDEMPOTENCY-PERSISTENCE-001',
      ),
    ).toBe(accessRequest.requestId)
  })
})
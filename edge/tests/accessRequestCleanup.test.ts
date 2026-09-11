import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  cleanupAccessRequests,
  clearAccessRequests,
  findAccessRequest,
  findRequestIdByIdempotencyKey,
  saveAccessRequest,
  saveConfirmationIdempotencyKey,
} from '../src/stores/accessRequestStore.js'

import type { AccessRequest } from '../src/types/accessRequest.js'

const currentDate = new Date(
  '2026-09-11T12:00:00.000Z',
)

function createAccessRequest(
  overrides: Partial<AccessRequest> = {},
): AccessRequest {
  return {
    requestId: 'request-default',
    cardUid: 'RFID-001',
    direction: 'ENTRY',
    source: 'EDGE_SIMULATOR',
    deviceId: 'TURNSTILE-01',
    locationId: 'OFFICE-01',
    state: 'PENDING_FACE',
    reasonCode: null,
    operationMode: 'ONLINE',
    createdAt: '2026-09-11T11:55:00.000Z',
    expiresAt: '2026-09-11T12:05:00.000Z',
    ...overrides,
  }
}

describe('Access request cleanup', () => {
  beforeEach(() => {
    clearAccessRequests()
  })

  it('marca las solicitudes activas vencidas como EXPIRED', () => {
    saveAccessRequest(
      createAccessRequest({
        requestId: 'expired-request',
        expiresAt: '2026-09-11T11:59:00.000Z',
      }),
    )

    saveAccessRequest(
      createAccessRequest({
        requestId: 'valid-request',
        expiresAt: '2026-09-11T12:05:00.000Z',
      }),
    )

    const result = cleanupAccessRequests(
      currentDate,
      30,
    )

    expect(result).toEqual({
      expired: 1,
      deleted: 0,
    })

    expect(
      findAccessRequest('expired-request'),
    ).toMatchObject({
      state: 'EXPIRED',
      reasonCode: 'REQUEST_EXPIRED',
    })

    expect(
      findAccessRequest('valid-request'),
    ).toMatchObject({
      state: 'PENDING_FACE',
      reasonCode: null,
    })
  })

  it('elimina estados finales antiguos sin borrar activos', () => {
    saveAccessRequest(
      createAccessRequest({
        requestId: 'old-confirmed',
        state: 'CONFIRMED',
        createdAt: '2026-07-01T12:00:00.000Z',
        expiresAt: '2026-07-01T12:05:00.000Z',
      }),
    )

    saveAccessRequest(
      createAccessRequest({
        requestId: 'old-active',
        state: 'PENDING_FACE',
        createdAt: '2026-07-01T12:00:00.000Z',
        expiresAt: '2026-09-11T12:05:00.000Z',
      }),
    )

    const result = cleanupAccessRequests(
      currentDate,
      30,
    )

    expect(result).toEqual({
      expired: 0,
      deleted: 1,
    })

    expect(
      findAccessRequest('old-confirmed'),
    ).toBeUndefined()

    expect(
      findAccessRequest('old-active'),
    ).toBeDefined()
  })

  it('elimina por cascada la clave de idempotencia', () => {
    const accessRequest = createAccessRequest({
      requestId: 'old-request-with-key',
      state: 'CONFIRMED',
      createdAt: '2026-07-01T12:00:00.000Z',
      expiresAt: '2026-07-01T12:05:00.000Z',
    })

    saveAccessRequest(accessRequest)

    saveConfirmationIdempotencyKey(
      'cleanup-key',
      accessRequest.requestId,
    )

    cleanupAccessRequests(currentDate, 30)

    expect(
      findRequestIdByIdempotencyKey('cleanup-key'),
    ).toBeUndefined()
  })
})
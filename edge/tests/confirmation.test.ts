import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app.js'
import {
  findPersonById,
  resetPeople,
} from '../src/data/mockPeople.js'
import {
  clearAccessRequests,
  findAccessRequest,
  saveAccessRequest,
} from '../src/stores/accessRequestStore.js'
import type { AccessRequest } from '../src/types/accessRequest.js'

type AuthorizedRequestOptions = {
  cardUid?: string
  direction?: 'ENTRY' | 'EXIT'
  mockIdentityId?: string
}

async function createAuthorizedRequest(
  options: AuthorizedRequestOptions = {},
): Promise<AccessRequest> {
  const cardUid = options.cardUid ?? 'RFID-001'
  const direction = options.direction ?? 'ENTRY'
  const mockIdentityId = options.mockIdentityId ?? '1'

  const createdResponse = await request(app)
    .post('/api/v1/access-requests')
    .send({
      cardUid,
      direction,
      source: 'EDGE_SIMULATOR',
      deviceId: 'TURNSTILE-01',
      locationId: 'OFFICE-01',
    })

  const verifiedResponse = await request(app)
    .post(
      `/api/v1/access-requests/${createdResponse.body.requestId}` +
        '/face-verification',
    )
    .send({
      provider: 'MOCK',
      mockIdentityId,
    })

  return verifiedResponse.body as AccessRequest
}

describe('POST /api/v1/access-requests/:requestId/confirm', () => {
  beforeEach(() => {
    clearAccessRequests()
    resetPeople()
  })

  it('confirma una solicitud autorizada', async () => {
    const accessRequest = await createAuthorizedRequest()

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/confirm`,
      )
      .set('Idempotency-Key', 'CONFIRM-001')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      requestId: accessRequest.requestId,
      state: 'CONFIRMED',
      reasonCode: null,
    })
    expect(findPersonById('1')).toMatchObject({
      inside: true,
      entriesToday: 1,
    })
  })

  it('devuelve el mismo resultado al repetir la misma clave', async () => {
    const accessRequest = await createAuthorizedRequest()
    const endpoint =
      `/api/v1/access-requests/${accessRequest.requestId}/confirm`

    const firstResponse = await request(app)
      .post(endpoint)
      .set('Idempotency-Key', 'CONFIRM-RETRY')

    const secondResponse = await request(app)
      .post(endpoint)
      .set('Idempotency-Key', 'CONFIRM-RETRY')

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)
    expect(secondResponse.body).toEqual(firstResponse.body)
    expect(findPersonById('1')).toMatchObject({
      inside: true,
      entriesToday: 1,
    })
  })

  it('rechaza una confirmación sin Idempotency-Key', async () => {
    const accessRequest = await createAuthorizedRequest()

    const response = await request(app).post(
      `/api/v1/access-requests/${accessRequest.requestId}/confirm`,
    )

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      code: 'INVALID_IDEMPOTENCY_KEY',
      message: 'Falta el encabezado Idempotency-Key',
      requestId: accessRequest.requestId,
    })
    expect(findPersonById('1')?.inside).toBe(false)
  })

  it('rechaza una solicitud que todavía no está autorizada', async () => {
    const createdResponse = await request(app)
      .post('/api/v1/access-requests')
      .send({
        cardUid: 'RFID-001',
        direction: 'ENTRY',
        source: 'EDGE_SIMULATOR',
        deviceId: 'TURNSTILE-01',
        locationId: 'OFFICE-01',
      })

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${createdResponse.body.requestId}` +
          '/confirm',
      )
      .set('Idempotency-Key', 'CONFIRM-PENDING')

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      code: 'INVALID_REQUEST_STATE',
      requestId: createdResponse.body.requestId,
    })
  })

  it('responde 404 cuando la solicitud no existe', async () => {
    const response = await request(app)
      .post('/api/v1/access-requests/REQ-INEXISTENTE/confirm')
      .set('Idempotency-Key', 'CONFIRM-MISSING')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      code: 'REQUEST_NOT_FOUND',
      message: 'Solicitud no encontrada',
      requestId: 'REQ-INEXISTENTE',
    })
  })

  it('rechaza la confirmación de una solicitud vencida', async () => {
    const accessRequest = await createAuthorizedRequest()
    const storedRequest = findAccessRequest(accessRequest.requestId)

    if (!storedRequest) {
      throw new Error('No se encontró la solicitud de prueba')
    }

    storedRequest.expiresAt = new Date(Date.now() - 1000).toISOString()
    saveAccessRequest(storedRequest)

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/confirm`,
      )
      .set('Idempotency-Key', 'CONFIRM-EXPIRED')

    expect(response.status).toBe(410)
    expect(response.body).toMatchObject({
      code: 'REQUEST_EXPIRED',
      requestId: accessRequest.requestId,
    })
    expect(findPersonById('1')?.inside).toBe(false)
  })

  it('impide reutilizar una clave en otra solicitud', async () => {
    const firstRequest = await createAuthorizedRequest()

    await request(app)
      .post(
        `/api/v1/access-requests/${firstRequest.requestId}/confirm`,
      )
      .set('Idempotency-Key', 'CONFIRM-SHARED')

    const secondRequest = await createAuthorizedRequest({
      cardUid: 'RFID-002',
      direction: 'EXIT',
      mockIdentityId: '2',
    })

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${secondRequest.requestId}/confirm`,
      )
      .set('Idempotency-Key', 'CONFIRM-SHARED')

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      code: 'SYNC_CONFLICT',
      message: 'La clave ya fue utilizada por otra solicitud',
      requestId: secondRequest.requestId,
    })
    expect(findPersonById('2')?.inside).toBe(true)
  })
})
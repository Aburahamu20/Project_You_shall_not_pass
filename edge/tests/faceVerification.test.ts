import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app.js'
import { resetPeople } from '../src/data/mockPeople.js'
import {
  clearAccessRequests,
  findAccessRequest,
  saveAccessRequest,
} from '../src/stores/accessRequestStore.js'
import type { AccessRequest } from '../src/types/accessRequest.js'

async function createPendingRequest(): Promise<AccessRequest> {
  const response = await request(app)
    .post('/api/v1/access-requests')
    .send({
      cardUid: 'RFID-001',
      direction: 'ENTRY',
      source: 'EDGE_SIMULATOR',
      deviceId: 'TURNSTILE-01',
      locationId: 'OFFICE-01',
    })

  return response.body as AccessRequest
}

describe('POST /api/v1/access-requests/:requestId/face-verification', () => {
  beforeEach(() => {
    clearAccessRequests()
    resetPeople()
  })

  it('autoriza cuando la tarjeta y el rostro coinciden', async () => {
    const accessRequest = await createPendingRequest()

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/face-verification`,
      )
      .send({
        provider: 'MOCK',
        mockIdentityId: '1',
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      requestId: accessRequest.requestId,
      state: 'AUTHORIZED',
      reasonCode: null,
    })
  })

  it('rechaza cuando la tarjeta y el rostro no coinciden', async () => {
    const accessRequest = await createPendingRequest()

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/face-verification`,
      )
      .send({
        provider: 'MOCK',
        mockIdentityId: '2',
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      requestId: accessRequest.requestId,
      state: 'REJECTED',
      reasonCode: 'FACE_MISMATCH',
    })
  })

  it('rechaza datos faciales incompletos', async () => {
    const accessRequest = await createPendingRequest()

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/face-verification`,
      )
      .send({
        provider: 'MOCK',
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      code: 'INVALID_FACE_VERIFICATION',
      message: 'Los datos de validación facial no son válidos',
      requestId: accessRequest.requestId,
    })
  })

  it('responde 404 cuando la solicitud no existe', async () => {
    const response = await request(app)
      .post(
        '/api/v1/access-requests/REQ-INEXISTENTE/face-verification',
      )
      .send({
        provider: 'MOCK',
        mockIdentityId: '1',
      })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      code: 'REQUEST_NOT_FOUND',
      message: 'Solicitud no encontrada',
      requestId: 'REQ-INEXISTENTE',
    })
  })

  it('informa cuando el proveedor todavía no está implementado', async () => {
    const accessRequest = await createPendingRequest()

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/face-verification`,
      )
      .send({
        provider: 'REKOGNITION',
        imageBase64: 'captura-ficticia',
      })

    expect(response.status).toBe(501)
    expect(response.body).toEqual({
      code: 'FACE_PROVIDER_ERROR',
      message: 'El proveedor facial todavía no está implementado',
      requestId: accessRequest.requestId,
    })

    const storedRequest = findAccessRequest(accessRequest.requestId)

    expect(storedRequest?.state).toBe('PENDING_FACE')
    expect(storedRequest).not.toHaveProperty('imageBase64')
  })

  it('impide validar nuevamente una solicitud resuelta', async () => {
    const accessRequest = await createPendingRequest()
    const endpoint =
      `/api/v1/access-requests/${accessRequest.requestId}` +
      '/face-verification'

    await request(app).post(endpoint).send({
      provider: 'MOCK',
      mockIdentityId: '1',
    })

    const response = await request(app).post(endpoint).send({
      provider: 'MOCK',
      mockIdentityId: '1',
    })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST_STATE',
      message: 'La solicitud no espera una validación facial',
      requestId: accessRequest.requestId,
    })
  })

  it('rechaza una solicitud vencida', async () => {
    const accessRequest = await createPendingRequest()
    const storedRequest = findAccessRequest(accessRequest.requestId)

    if (!storedRequest) {
      throw new Error('No se encontró la solicitud de prueba')
    }

    storedRequest.expiresAt = new Date(Date.now() - 1000).toISOString()
    saveAccessRequest(storedRequest)

    const response = await request(app)
      .post(
        `/api/v1/access-requests/${accessRequest.requestId}/face-verification`,
      )
      .send({
        provider: 'MOCK',
        mockIdentityId: '1',
      })

    expect(response.status).toBe(410)
    expect(response.body).toEqual({
      code: 'REQUEST_EXPIRED',
      message: 'La solicitud ha expirado',
      requestId: accessRequest.requestId,
    })

    expect(findAccessRequest(accessRequest.requestId)).toMatchObject({
      state: 'EXPIRED',
      reasonCode: 'REQUEST_EXPIRED',
    })
  })
})
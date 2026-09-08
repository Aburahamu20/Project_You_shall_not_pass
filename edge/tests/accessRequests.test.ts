import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app.js'
import { clearAccessRequests } from '../src/stores/accessRequestStore.js'

const validRequestBody = {
  cardUid: '01:02:03:04',
  direction: 'ENTRY',
  source: 'EDGE_SIMULATOR',
  deviceId: 'TURNSTILE-01',
  locationId: 'OFFICE-01',
}

describe('Access requests', () => {
  beforeEach(() => {
    clearAccessRequests()
  })

  it('crea una solicitud válida pendiente de validación facial', async () => {
    const response = await request(app)
      .post('/api/v1/access-requests')
      .send(validRequestBody)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      ...validRequestBody,
      state: 'PENDING_FACE',
      reasonCode: null,
      operationMode: 'ONLINE',
    })
    expect(response.body.requestId).toEqual(expect.any(String))
    expect(response.body.createdAt).toEqual(expect.any(String))
    expect(response.body.expiresAt).toEqual(expect.any(String))

    const validityMilliseconds =
      new Date(response.body.expiresAt).getTime() -
      new Date(response.body.createdAt).getTime()

    expect(validityMilliseconds).toBe(5 * 60 * 1000)
  })

  it('rechaza una solicitud con datos incompletos', async () => {
    const response = await request(app)
      .post('/api/v1/access-requests')
      .send({
        cardUid: '',
        direction: 'ENTRY',
      })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'INVALID_REQUEST',
      message: 'Los datos de la solicitud no son válidos',
    })
    expect(response.body.requestId).toEqual(expect.any(String))
  })

  it('permite consultar una solicitud creada', async () => {
    const createdResponse = await request(app)
      .post('/api/v1/access-requests')
      .send(validRequestBody)

    const response = await request(app).get(
      `/api/v1/access-requests/${createdResponse.body.requestId}`,
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual(createdResponse.body)
  })

  it('responde 404 cuando la solicitud no existe', async () => {
    const response = await request(app).get(
      '/api/v1/access-requests/REQ-INEXISTENTE',
    )

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      code: 'REQUEST_NOT_FOUND',
      message: 'Solicitud no encontrada',
      requestId: 'REQ-INEXISTENTE',
    })
  })
})
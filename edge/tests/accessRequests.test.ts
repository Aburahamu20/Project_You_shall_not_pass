import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { app } from '../src/app.js'

describe('POST /api/v1/access-requests', () => {
  it('crea una solicitud válida pendiente de validación facial', async () => {
    const requestBody = {
      cardUid: '01:02:03:04',
      direction: 'ENTRY',
      source: 'EDGE_SIMULATOR',
      deviceId: 'TURNSTILE-01',
      locationId: 'OFFICE-01',
    }

    const response = await request(app)
      .post('/api/v1/access-requests')
      .send(requestBody)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      ...requestBody,
      state: 'PENDING_FACE',
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
})
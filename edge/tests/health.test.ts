import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { app } from '../src/app.js'

describe('GET /health', () => {
  it('informa que el simulador Edge está funcionando', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      status: 'OK',
      service: 'edge-simulator',
      simulated: true,
    })
    expect(response.body.serverTime).toEqual(expect.any(String))
  })
})
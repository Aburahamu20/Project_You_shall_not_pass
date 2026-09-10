import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { app } from '../src/app.js'
import { calculateOccupancyStatus } from '../src/services/occupancy.js'

describe('Occupancy', () => {
  it('indica que hay espacio disponible', () => {
    expect(calculateOccupancyStatus(1, 10)).toBe('AVAILABLE')
  })

  it('indica que está cerca de la capacidad máxima', () => {
    expect(calculateOccupancyStatus(8, 10)).toBe(
      'NEAR_CAPACITY',
    )
  })

  it('indica que el lugar está lleno', () => {
    expect(calculateOccupancyStatus(10, 10)).toBe('FULL')
  })

  it('consulta el aforo actual de la oficina', async () => {
    const response = await request(app).get(
      '/api/v1/occupancy?locationId=OFFICE-01',
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      locationId: 'OFFICE-01',
      current: 1,
      maximum: 10,
      status: 'AVAILABLE',
    })
  })

  it('rechaza una consulta sin locationId', async () => {
    const response = await request(app).get(
      '/api/v1/occupancy',
    )

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'Falta indicar una ubicación válida',
      requestId: expect.any(String),
    })
  })

  it('responde 404 cuando la ubicación no existe', async () => {
    const response = await request(app).get(
      '/api/v1/occupancy?locationId=OFFICE-UNKNOWN',
    )

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      code: 'LOCATION_NOT_FOUND',
      message: 'Ubicación no encontrada',
      requestId: expect.any(String),
    })
  })
})
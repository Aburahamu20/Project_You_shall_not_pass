import { randomUUID } from 'node:crypto'

import { Router } from 'express'
import { z } from 'zod'

import { getOccupancy } from '../services/occupancy.js'

const occupancyQuerySchema = z.object({
  locationId: z.string().trim().min(1),
})

export const occupancyRouter = Router()

occupancyRouter.get('/', (request, response) => {
  const validation = occupancyQuerySchema.safeParse(request.query)

  if (!validation.success) {
    response.status(400).json({
      code: 'INVALID_REQUEST',
      message: 'Falta indicar una ubicación válida',
      requestId: randomUUID(),
    })
    return
  }

  const occupancy = getOccupancy(validation.data.locationId)

  if (!occupancy) {
    response.status(404).json({
      code: 'LOCATION_NOT_FOUND',
      message: 'Ubicación no encontrada',
      requestId: randomUUID(),
    })
    return
  }

  response.status(200).json(occupancy)
})
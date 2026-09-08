import { randomUUID } from 'node:crypto'

import { Router } from 'express'

import { createAccessRequestSchema } from '../schemas/accessRequest.js'

export const accessRequestsRouter = Router()

accessRequestsRouter.post('/', (request, response) => {
  const validation = createAccessRequestSchema.safeParse(request.body)

  if (!validation.success) {
    response.status(400).json({
      code: 'INVALID_REQUEST',
      message: 'Los datos de la solicitud no son válidos',
      requestId: randomUUID(),
    })
    return
  }

  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + 5 * 60 * 1000)

  response.status(201).json({
    requestId: randomUUID(),
    ...validation.data,
    state: 'PENDING_FACE',
    operationMode: 'ONLINE',
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  })
})
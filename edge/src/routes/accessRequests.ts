import { randomUUID } from 'node:crypto'

import { Router } from 'express'

import { createAccessRequestSchema } from '../schemas/accessRequest.js'
import {
  findAccessRequest,
  saveAccessRequest,
} from '../stores/accessRequestStore.js'
import type { AccessRequest } from '../types/accessRequest.js'

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

  const accessRequest: AccessRequest = {
    requestId: randomUUID(),
    ...validation.data,
    state: 'PENDING_FACE',
    reasonCode: null,
    operationMode: 'ONLINE',
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  saveAccessRequest(accessRequest)
  response.status(201).json(accessRequest)
})

accessRequestsRouter.get('/:requestId', (request, response) => {
  const { requestId } = request.params
  const accessRequest = findAccessRequest(requestId)

  if (!accessRequest) {
    response.status(404).json({
      code: 'REQUEST_NOT_FOUND',
      message: 'Solicitud no encontrada',
      requestId,
    })
    return
  }

  const hasExpired =
    accessRequest.state === 'PENDING_FACE' &&
    new Date(accessRequest.expiresAt).getTime() <= Date.now()

  if (hasExpired) {
    accessRequest.state = 'EXPIRED'
    accessRequest.reasonCode = 'REQUEST_EXPIRED'
    saveAccessRequest(accessRequest)
  }

  response.status(200).json(accessRequest)
})
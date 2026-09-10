import { randomUUID } from 'node:crypto'

import { Router } from 'express'

import { createAccessRequestSchema } from '../schemas/accessRequest.js'
import { faceVerificationSchema } from '../schemas/faceVerification.js'
import { evaluateMockFace } from '../services/accessDecision.js'
import { confirmPersonCrossing } from '../services/confirmAccess.js'
import {
  findAccessRequest,
  findRequestIdByIdempotencyKey,
  saveAccessRequest,
  saveConfirmationIdempotencyKey,
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

accessRequestsRouter.post(
  '/:requestId/face-verification',
  (request, response) => {
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
      new Date(accessRequest.expiresAt).getTime() <= Date.now()

    if (hasExpired) {
      accessRequest.state = 'EXPIRED'
      accessRequest.reasonCode = 'REQUEST_EXPIRED'
      saveAccessRequest(accessRequest)

      response.status(410).json({
        code: 'REQUEST_EXPIRED',
        message: 'La solicitud ha expirado',
        requestId,
      })
      return
    }

    if (accessRequest.state !== 'PENDING_FACE') {
      response.status(409).json({
        code: 'INVALID_REQUEST_STATE',
        message: 'La solicitud no espera una validación facial',
        requestId,
      })
      return
    }

    const validation = faceVerificationSchema.safeParse(request.body)

    if (!validation.success) {
      response.status(400).json({
        code: 'INVALID_FACE_VERIFICATION',
        message: 'Los datos de validación facial no son válidos',
        requestId,
      })
      return
    }

    if (validation.data.provider !== 'MOCK') {
      response.status(501).json({
        code: 'FACE_PROVIDER_ERROR',
        message: 'El proveedor facial todavía no está implementado',
        requestId,
      })
      return
    }

    const decision = evaluateMockFace(
      accessRequest,
      validation.data.mockIdentityId,
    )

    accessRequest.state = decision.state
    accessRequest.reasonCode = decision.reasonCode
    saveAccessRequest(accessRequest)

    response.status(200).json(accessRequest)
  },
)

accessRequestsRouter.post(
  '/:requestId/confirm',
  (request, response) => {
    const { requestId } = request.params
    const idempotencyKey =
      request.header('Idempotency-Key')?.trim()

    if (!idempotencyKey) {
      response.status(400).json({
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Falta el encabezado Idempotency-Key',
        requestId,
      })
      return
    }

    const previousRequestId =
      findRequestIdByIdempotencyKey(idempotencyKey)

    if (previousRequestId) {
      if (previousRequestId !== requestId) {
        response.status(409).json({
          code: 'SYNC_CONFLICT',
          message: 'La clave ya fue utilizada por otra solicitud',
          requestId,
        })
        return
      }

      const previousRequest = findAccessRequest(previousRequestId)

      if (!previousRequest) {
        response.status(409).json({
          code: 'SYNC_CONFLICT',
          message: 'No se encontró el resultado anterior',
          requestId,
        })
        return
      }

      response.status(200).json(previousRequest)
      return
    }

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
      new Date(accessRequest.expiresAt).getTime() <= Date.now()

    if (hasExpired) {
      accessRequest.state = 'EXPIRED'
      accessRequest.reasonCode = 'REQUEST_EXPIRED'
      saveAccessRequest(accessRequest)

      response.status(410).json({
        code: 'REQUEST_EXPIRED',
        message: 'La solicitud ha expirado',
        requestId,
      })
      return
    }

    if (accessRequest.state !== 'AUTHORIZED') {
      response.status(409).json({
        code: 'INVALID_REQUEST_STATE',
        message: 'La solicitud no está autorizada',
        requestId,
      })
      return
    }

    const decision = confirmPersonCrossing(accessRequest)

    if (!decision.confirmed) {
      accessRequest.state = 'REJECTED'
      accessRequest.reasonCode = decision.reasonCode
      saveAccessRequest(accessRequest)

      response.status(409).json({
        code: decision.reasonCode ?? 'CONFIRMATION_FAILED',
        message: 'El cruce no pudo ser confirmado',
        requestId,
      })
      return
    }

    accessRequest.state = 'CONFIRMED'
    accessRequest.reasonCode = null

    saveAccessRequest(accessRequest)
    saveConfirmationIdempotencyKey(
      idempotencyKey,
      accessRequest.requestId,
    )

    response.status(200).json(accessRequest)
  },
)

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

  const canExpire =
    accessRequest.state === 'PENDING_FACE' ||
    accessRequest.state === 'AUTHORIZED'

  const hasExpired =
    canExpire &&
    new Date(accessRequest.expiresAt).getTime() <= Date.now()

  if (hasExpired) {
    accessRequest.state = 'EXPIRED'
    accessRequest.reasonCode = 'REQUEST_EXPIRED'
    saveAccessRequest(accessRequest)
  }

  response.status(200).json(accessRequest)
})
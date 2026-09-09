import type { AccessRequest } from '../types/accessRequest.js'

const accessRequests = new Map<string, AccessRequest>()
const confirmationRequestIds = new Map<string, string>()

export function saveAccessRequest(
  accessRequest: AccessRequest,
): AccessRequest {
  accessRequests.set(accessRequest.requestId, accessRequest)
  return accessRequest
}

export function findAccessRequest(
  requestId: string,
): AccessRequest | undefined {
  return accessRequests.get(requestId)
}

export function saveConfirmationIdempotencyKey(
  idempotencyKey: string,
  requestId: string,
): void {
  confirmationRequestIds.set(idempotencyKey, requestId)
}

export function findRequestIdByIdempotencyKey(
  idempotencyKey: string,
): string | undefined {
  return confirmationRequestIds.get(idempotencyKey)
}

export function clearAccessRequests(): void {
  accessRequests.clear()
  confirmationRequestIds.clear()
}
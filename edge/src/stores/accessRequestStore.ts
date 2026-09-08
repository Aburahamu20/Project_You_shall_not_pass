import type { AccessRequest } from '../types/accessRequest.js'

const accessRequests = new Map<string, AccessRequest>()

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

export function clearAccessRequests(): void {
  accessRequests.clear()
}
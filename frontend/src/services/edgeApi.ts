export type EdgeDirection = 'ENTRY' | 'EXIT'

export type AccessRequestState =
  | 'PENDING_FACE'
  | 'VALIDATING'
  | 'AUTHORIZED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'

export type EdgeAccessRequest = {
  requestId: string
  cardUid: string
  direction: EdgeDirection
  source: 'EDGE_SIMULATOR'
  deviceId: string
  locationId: string
  state: AccessRequestState
  reasonCode: string | null
  operationMode: 'ONLINE' | 'OFFLINE'
  createdAt: string
  expiresAt: string
}

export type Occupancy = {
  locationId: string
  current: number
  maximum: number
  status: 'AVAILABLE' | 'NEAR_CAPACITY' | 'FULL'
}

type ApiErrorResponse = {
  code?: string
  message?: string
  requestId?: string
}

export class EdgeApiError extends Error {
  code: string
  requestId?: string

  constructor(error: ApiErrorResponse) {
    super(error.message ?? 'Error al comunicarse con el servicio Edge')
    this.name = 'EdgeApiError'
    this.code = error.code ?? 'EDGE_API_ERROR'
    this.requestId = error.requestId
  }
}

async function requestApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/v1${endpoint}`, options)
  const body = (await response.json()) as T | ApiErrorResponse

  if (!response.ok) {
    throw new EdgeApiError(body as ApiErrorResponse)
  }

  return body as T
}

export function createAccessRequest(
  cardUid: string,
  direction: EdgeDirection,
): Promise<EdgeAccessRequest> {
  return requestApi<EdgeAccessRequest>('/access-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cardUid,
      direction,
      source: 'EDGE_SIMULATOR',
      deviceId: 'TURNSTILE-01',
      locationId: 'OFFICE-01',
    }),
  })
}

export function verifyMockFace(
  requestId: string,
  mockIdentityId: string,
): Promise<EdgeAccessRequest> {
  return requestApi<EdgeAccessRequest>(
    `/access-requests/${requestId}/face-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'MOCK',
        mockIdentityId,
      }),
    },
  )
}

export function confirmAccess(
  requestId: string,
): Promise<EdgeAccessRequest> {
  return requestApi<EdgeAccessRequest>(
    `/access-requests/${requestId}/confirm`,
    {
      method: 'POST',
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    },
  )
}

export function getOccupancy(): Promise<Occupancy> {
  return requestApi<Occupancy>(
    '/occupancy?locationId=OFFICE-01',
  )
}
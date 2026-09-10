import type { CreateAccessRequest } from '../schemas/accessRequest.js'

export type AccessRequestState =
  | 'PENDING_FACE'
  | 'VALIDATING'
  | 'AUTHORIZED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'

export type OperationMode =
  | 'ONLINE'
  | 'OFFLINE_VALID'
  | 'OFFLINE_EXPIRED'
  | 'SYNCING'
  | 'LOCKDOWN'

export type AccessRequest = CreateAccessRequest & {
  requestId: string
  state: AccessRequestState
  reasonCode: string | null
  operationMode: OperationMode
  createdAt: string
  expiresAt: string
}
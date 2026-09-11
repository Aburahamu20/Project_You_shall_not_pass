import { getDatabase } from '../database/database.js'
import type { AccessRequest } from '../types/accessRequest.js'

type AccessRequestRow = {
  requestId: string
  cardUid: string
  direction: AccessRequest['direction']
  source: AccessRequest['source']
  deviceId: string
  locationId: string
  state: AccessRequest['state']
  reasonCode: string | null
  operationMode: AccessRequest['operationMode']
  createdAt: string
  expiresAt: string
}

export type AccessRequestCleanupResult = {
  expired: number
  deleted: number
}

const database = getDatabase()

const saveAccessRequestStatement = database.prepare(`
  INSERT INTO access_requests (
    request_id,
    card_uid,
    direction,
    source,
    device_id,
    location_id,
    state,
    reason_code,
    operation_mode,
    created_at,
    expires_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(request_id) DO UPDATE SET
    card_uid = excluded.card_uid,
    direction = excluded.direction,
    source = excluded.source,
    device_id = excluded.device_id,
    location_id = excluded.location_id,
    state = excluded.state,
    reason_code = excluded.reason_code,
    operation_mode = excluded.operation_mode,
    created_at = excluded.created_at,
    expires_at = excluded.expires_at
`)

const findAccessRequestStatement = database.prepare(`
  SELECT
    request_id AS requestId,
    card_uid AS cardUid,
    direction,
    source,
    device_id AS deviceId,
    location_id AS locationId,
    state,
    reason_code AS reasonCode,
    operation_mode AS operationMode,
    created_at AS createdAt,
    expires_at AS expiresAt
  FROM access_requests
  WHERE request_id = ?
`)

const saveIdempotencyKeyStatement = database.prepare(`
  INSERT INTO confirmation_idempotency_keys (
    idempotency_key,
    request_id
  )
  VALUES (?, ?)
  ON CONFLICT(idempotency_key) DO UPDATE SET
    request_id = excluded.request_id
`)

const findIdempotencyKeyStatement = database.prepare(`
  SELECT request_id AS requestId
  FROM confirmation_idempotency_keys
  WHERE idempotency_key = ?
`)

const expireAccessRequestsStatement = database.prepare(`
  UPDATE access_requests
  SET
    state = 'EXPIRED',
    reason_code = 'REQUEST_EXPIRED'
  WHERE state IN (
    'PENDING_FACE',
    'VALIDATING',
    'AUTHORIZED'
  )
    AND expires_at <= ?
`)

const deleteOldAccessRequestsStatement = database.prepare(`
  DELETE FROM access_requests
  WHERE state IN (
    'CONFIRMED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
  )
    AND created_at <= ?
`)

export function saveAccessRequest(
  accessRequest: AccessRequest,
): AccessRequest {
  saveAccessRequestStatement.run(
    accessRequest.requestId,
    accessRequest.cardUid,
    accessRequest.direction,
    accessRequest.source,
    accessRequest.deviceId,
    accessRequest.locationId,
    accessRequest.state,
    accessRequest.reasonCode,
    accessRequest.operationMode,
    accessRequest.createdAt,
    accessRequest.expiresAt,
  )

  return accessRequest
}

export function findAccessRequest(
  requestId: string,
): AccessRequest | undefined {
  const row = findAccessRequestStatement.get(
    requestId,
  ) as AccessRequestRow | undefined

  return row ? { ...row } : undefined
}

export function saveConfirmationIdempotencyKey(
  idempotencyKey: string,
  requestId: string,
): void {
  saveIdempotencyKeyStatement.run(
    idempotencyKey,
    requestId,
  )
}

export function findRequestIdByIdempotencyKey(
  idempotencyKey: string,
): string | undefined {
  const row = findIdempotencyKeyStatement.get(
    idempotencyKey,
  ) as { requestId: string } | undefined

  return row?.requestId
}

export function cleanupAccessRequests(
  now = new Date(),
  retentionDays = 30,
): AccessRequestCleanupResult {
  if (
    !Number.isFinite(retentionDays) ||
    retentionDays <= 0
  ) {
    throw new RangeError(
      'retentionDays debe ser un número mayor que cero',
    )
  }

  const nowTimestamp = now.toISOString()
  const retentionMilliseconds =
    retentionDays * 24 * 60 * 60 * 1000

  const retentionLimit = new Date(
    now.getTime() - retentionMilliseconds,
  ).toISOString()

  database.exec('BEGIN')

  try {
    const expirationResult =
      expireAccessRequestsStatement.run(nowTimestamp)

    const deletionResult =
      deleteOldAccessRequestsStatement.run(retentionLimit)

    database.exec('COMMIT')

    return {
      expired: Number(expirationResult.changes),
      deleted: Number(deletionResult.changes),
    }
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

export function clearAccessRequests(): void {
  database.exec('BEGIN')

  try {
    database.exec(
      'DELETE FROM confirmation_idempotency_keys',
    )
    database.exec('DELETE FROM access_requests')
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const moduleDirectory = dirname(fileURLToPath(import.meta.url))
const edgeDirectory = resolve(moduleDirectory, '..', '..')

export const defaultDatabasePath = resolve(
  edgeDirectory,
  'data',
  'edge.sqlite',
)

let activeDatabase: DatabaseSync | undefined

export function createDatabase(
  databasePath: string,
): DatabaseSync {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true })
  }

  const database = new DatabaseSync(databasePath)

  database.exec('PRAGMA foreign_keys = ON;')

  if (databasePath !== ':memory:') {
    database.exec('PRAGMA journal_mode = WAL;')
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      card_uid TEXT NOT NULL UNIQUE,
      inside INTEGER NOT NULL DEFAULT 0
        CHECK (inside IN (0, 1)),
      blocked INTEGER NOT NULL DEFAULT 0
        CHECK (blocked IN (0, 1)),
      entries_today INTEGER NOT NULL DEFAULT 0
        CHECK (entries_today >= 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS access_requests (
      request_id TEXT PRIMARY KEY,
      card_uid TEXT NOT NULL,
      direction TEXT NOT NULL
        CHECK (direction IN ('ENTRY', 'EXIT')),
      source TEXT NOT NULL
        CHECK (
          source IN (
            'WEB_SIMULATOR',
            'EDGE_SIMULATOR',
            'RASPBERRY_PI',
            'PHYSICAL_READER'
          )
        ),
      device_id TEXT NOT NULL,
      location_id TEXT NOT NULL,
      state TEXT NOT NULL
        CHECK (
          state IN (
            'PENDING_FACE',
            'VALIDATING',
            'AUTHORIZED',
            'CONFIRMED',
            'REJECTED',
            'EXPIRED',
            'CANCELLED'
          )
        ),
      reason_code TEXT,
      operation_mode TEXT NOT NULL
        CHECK (
          operation_mode IN (
            'ONLINE',
            'OFFLINE_VALID',
            'OFFLINE_EXPIRED',
            'SYNCING',
            'LOCKDOWN'
          )
        ),
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS confirmation_idempotency_keys (
      idempotency_key TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id)
        REFERENCES access_requests(request_id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS
      idx_access_requests_location_created
      ON access_requests(location_id, created_at);

    CREATE INDEX IF NOT EXISTS
      idx_access_requests_state
      ON access_requests(state);
  `)

  return database
}

export function getDatabase(): DatabaseSync {
  if (!activeDatabase) {
    const databasePath =
      process.env.EDGE_DATABASE_PATH ??
      (process.env.VITEST ? ':memory:' : defaultDatabasePath)

    activeDatabase = createDatabase(databasePath)
  }

  return activeDatabase
}

export function initializeDatabase(): DatabaseSync {
  return getDatabase()
}

export function closeDatabase(): void {
  if (!activeDatabase) {
    return
  }

  activeDatabase.close()
  activeDatabase = undefined
}
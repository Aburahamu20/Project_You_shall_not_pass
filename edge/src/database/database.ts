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
  `)

  return database
}

export function getDatabase(): DatabaseSync {
  if (!activeDatabase) {
    const databasePath =
      process.env.EDGE_DATABASE_PATH ?? defaultDatabasePath

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
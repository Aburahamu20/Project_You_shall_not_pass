import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createDatabase } from '../src/database/database.js'

describe('SQLite database', () => {
  let database: ReturnType<typeof createDatabase>

  beforeEach(() => {
    database = createDatabase(':memory:')
  })

  afterEach(() => {
    database.close()
  })

  it('crea la tabla de personas', () => {
    const table = database
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = 'people'
      `)
      .get() as { name: string } | undefined

    expect(table?.name).toBe('people')
  })

  it('guarda y recupera una persona', () => {
    database
      .prepare(`
        INSERT INTO people (
          id,
          name,
          card_uid,
          inside,
          blocked,
          entries_today
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run('1', 'Ana Torres', 'RFID-001', 0, 0, 0)

    const person = database
      .prepare(`
        SELECT
          id,
          name,
          card_uid AS cardUid,
          inside,
          blocked,
          entries_today AS entriesToday
        FROM people
        WHERE id = ?
      `)
      .get('1') as
      | {
          id: string
          name: string
          cardUid: string
          inside: number
          blocked: number
          entriesToday: number
        }
      | undefined

    expect(person).toEqual({
      id: '1',
      name: 'Ana Torres',
      cardUid: 'RFID-001',
      inside: 0,
      blocked: 0,
      entriesToday: 0,
    })
  })

  it('rechaza un estado inside inválido', () => {
    const insertPerson = database.prepare(`
      INSERT INTO people (
        id,
        name,
        card_uid,
        inside,
        blocked,
        entries_today
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    expect(() =>
      insertPerson.run(
        '1',
        'Ana Torres',
        'RFID-001',
        2,
        0,
        0,
      ),
    ).toThrow()
  })
})
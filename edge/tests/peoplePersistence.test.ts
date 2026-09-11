import { beforeEach, describe, expect, it } from 'vitest'

import {
  findPersonById,
  resetPeople,
  savePerson,
} from '../src/data/mockPeople.js'
import { getDatabase } from '../src/database/database.js'

describe('People persistence', () => {
  beforeEach(() => {
    resetPeople()
  })

  it('persiste la presencia y los ingresos de una persona', () => {
    const ana = findPersonById('1')

    if (!ana) {
      throw new Error('No se encontró a Ana Torres')
    }

    ana.inside = true
    ana.entriesToday = 1
    savePerson(ana)

    const storedPerson = getDatabase()
      .prepare(`
        SELECT
          inside,
          entries_today AS entriesToday
        FROM people
        WHERE id = ?
      `)
      .get('1') as
      | {
          inside: number
          entriesToday: number
        }
      | undefined

    expect(storedPerson).toEqual({
      inside: 1,
      entriesToday: 1,
    })
  })

  it('restablece las personas en memoria y SQLite', () => {
    const bruno = findPersonById('2')

    if (!bruno) {
      throw new Error('No se encontró a Bruno Silva')
    }

    bruno.inside = false
    savePerson(bruno)

    resetPeople()

    expect(findPersonById('2')).toMatchObject({
      inside: true,
      entriesToday: 1,
    })

    const storedPerson = getDatabase()
      .prepare(`
        SELECT inside, entries_today AS entriesToday
        FROM people
        WHERE id = ?
      `)
      .get('2') as
      | {
          inside: number
          entriesToday: number
        }
      | undefined

    expect(storedPerson).toEqual({
      inside: 1,
      entriesToday: 1,
    })
  })
})
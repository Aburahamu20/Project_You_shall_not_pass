import { getDatabase } from '../database/database.js'
import type { Person } from '../types/person.js'

type PersonRow = {
  id: string
  name: string
  cardUid: string
  inside: number
  blocked: number
  entriesToday: number
}

const initialPeople: Person[] = [
  {
    id: '1',
    name: 'Ana Torres',
    cardUid: 'RFID-001',
    inside: false,
    blocked: false,
    entriesToday: 0,
  },
  {
    id: '2',
    name: 'Bruno Silva',
    cardUid: 'RFID-002',
    inside: true,
    blocked: false,
    entriesToday: 1,
  },
  {
    id: '3',
    name: 'Camila Rojas',
    cardUid: 'RFID-003',
    inside: false,
    blocked: true,
    entriesToday: 0,
  },
]

const database = getDatabase()

const insertPersonStatement = database.prepare(`
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

const selectPeopleStatement = database.prepare(`
  SELECT
    id,
    name,
    card_uid AS cardUid,
    inside,
    blocked,
    entries_today AS entriesToday
  FROM people
  ORDER BY id
`)

const updatePersonStatement = database.prepare(`
  UPDATE people
  SET
    name = ?,
    card_uid = ?,
    inside = ?,
    blocked = ?,
    entries_today = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`)

function insertPerson(person: Person): void {
  insertPersonStatement.run(
    person.id,
    person.name,
    person.cardUid,
    person.inside ? 1 : 0,
    person.blocked ? 1 : 0,
    person.entriesToday,
  )
}

function mapPersonRow(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    cardUid: row.cardUid,
    inside: row.inside === 1,
    blocked: row.blocked === 1,
    entriesToday: row.entriesToday,
  }
}

function loadPeople(): Person[] {
  const rows =
    selectPeopleStatement.all() as unknown as PersonRow[]

  return rows.map(mapPersonRow)
}

function replaceDatabasePeople(sourcePeople: Person[]): void {
  database.exec('BEGIN')

  try {
    database.exec('DELETE FROM people')

    for (const person of sourcePeople) {
      insertPerson(person)
    }

    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

function seedInitialPeople(): void {
  const result = database
    .prepare('SELECT COUNT(*) AS total FROM people')
    .get() as { total: number }

  if (result.total > 0) {
    return
  }

  replaceDatabasePeople(initialPeople)
}

seedInitialPeople()

export const people = loadPeople()

export function findPersonByCardUid(
  cardUid: string,
): Person | undefined {
  return people.find((person) => person.cardUid === cardUid)
}

export function findPersonById(
  personId: string,
): Person | undefined {
  return people.find((person) => person.id === personId)
}

export function savePerson(person: Person): Person {
  const result = updatePersonStatement.run(
    person.name,
    person.cardUid,
    person.inside ? 1 : 0,
    person.blocked ? 1 : 0,
    person.entriesToday,
    person.id,
  )

  if (result.changes === 0) {
    throw new Error(`Persona no encontrada: ${person.id}`)
  }

  const index = people.findIndex(
    (currentPerson) => currentPerson.id === person.id,
  )

  if (index >= 0 && people[index] !== person) {
    people[index] = { ...person }
  }

  return person
}

export function resetPeople(): void {
  replaceDatabasePeople(initialPeople)

  people.splice(
    0,
    people.length,
    ...loadPeople(),
  )
}
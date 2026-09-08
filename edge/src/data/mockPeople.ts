import type { Person } from '../types/person.js'

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

export const people = initialPeople.map((person) => ({ ...person }))

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

export function resetPeople(): void {
  people.splice(
    0,
    people.length,
    ...initialPeople.map((person) => ({ ...person })),
  )
}
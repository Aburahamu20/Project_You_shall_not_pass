import type { Person } from '../types/access'

export const initialPeople: Person[] = [
  {
    id: 1,
    name: 'Ana Torres',
    cardId: 'RFID-001',
    inside: false,
    blocked: false,
    entriesToday: 0,
  },
  {
    id: 2,
    name: 'Bruno Silva',
    cardId: 'RFID-002',
    inside: true,
    blocked: false,
    entriesToday: 1,
  },
  {
    id: 3,
    name: 'Camila Rojas',
    cardId: 'RFID-003',
    inside: false,
    blocked: true,
    entriesToday: 0,
  },
]
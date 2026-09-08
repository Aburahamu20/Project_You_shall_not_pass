import { describe, expect, it } from 'vitest'
import { initialPeople } from '../data/mockPeople'
import { evaluateAccess } from './accessRules'

const validInput = {
  people: initialPeople,
  selectedCard: 'RFID-001',
  selectedFace: '1',
  direction: 'ENTRADA' as const,
  occupancy: 1,
  capacity: 10,
}

describe('evaluateAccess', () => {
  it('autoriza cuando la tarjeta y el rostro son válidos', () => {
    const decision = evaluateAccess(validInput)

    expect(decision.authorized).toBe(true)
    expect(decision.code).toBe('AUTHORIZED')
    expect(decision.person?.name).toBe('Ana Torres')
  })

  it('rechaza cuando falta la tarjeta o el rostro', () => {
    const decision = evaluateAccess({
      ...validInput,
      selectedFace: '',
    })

    expect(decision.authorized).toBe(false)
    expect(decision.code).toBe('MISSING_CREDENTIALS')
  })

  it('rechaza cuando la tarjeta y el rostro no coinciden', () => {
    const decision = evaluateAccess({
      ...validInput,
      selectedFace: '2',
    })

    expect(decision.authorized).toBe(false)
    expect(decision.code).toBe('IDENTITY_MISMATCH')
  })

  it('rechaza una tarjeta bloqueada', () => {
    const decision = evaluateAccess({
      ...validInput,
      selectedCard: 'RFID-003',
      selectedFace: '3',
    })

    expect(decision.authorized).toBe(false)
    expect(decision.code).toBe('CARD_BLOCKED')
  })

  it('rechaza una segunda entrada si la persona ya está dentro', () => {
    const decision = evaluateAccess({
      ...validInput,
      selectedCard: 'RFID-002',
      selectedFace: '2',
    })

    expect(decision.authorized).toBe(false)
    expect(decision.code).toBe('ALREADY_INSIDE')
  })

  it('rechaza una salida si la persona no aparece dentro', () => {
    const decision = evaluateAccess({
      ...validInput,
      direction: 'SALIDA',
    })

    expect(decision.authorized).toBe(false)
    expect(decision.code).toBe('NOT_INSIDE')
  })

  it('rechaza una entrada cuando el aforo está completo', () => {
    const decision = evaluateAccess({
      ...validInput,
      occupancy: 10,
    })

    expect(decision.authorized).toBe(false)
    expect(decision.code).toBe('CAPACITY_REACHED')
  })
})
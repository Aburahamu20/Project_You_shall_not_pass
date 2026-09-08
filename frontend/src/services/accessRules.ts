import type { Direction, Person } from '../types/access'

export type AccessDecisionCode =
  | 'AUTHORIZED'
  | 'MISSING_CREDENTIALS'
  | 'IDENTITY_MISMATCH'
  | 'CARD_BLOCKED'
  | 'ALREADY_INSIDE'
  | 'NOT_INSIDE'
  | 'CAPACITY_REACHED'

type EvaluateAccessInput = {
  people: Person[]
  selectedCard: string
  selectedFace: string
  direction: Direction
  occupancy: number
  capacity: number
}

export type AccessDecision = {
  authorized: boolean
  code: AccessDecisionCode
  reason: string
  person: Person | null
}

export function evaluateAccess({
  people,
  selectedCard,
  selectedFace,
  direction,
  occupancy,
  capacity,
}: EvaluateAccessInput): AccessDecision {
  const cardOwner = people.find(
    (person) => person.cardId === selectedCard,
  )

  const faceOwner = people.find(
    (person) => person.id === Number(selectedFace),
  )

  if (!cardOwner || !faceOwner) {
    return {
      authorized: false,
      code: 'MISSING_CREDENTIALS',
      reason: 'Falta presentar RFID o rostro',
      person: cardOwner ?? null,
    }
  }

  if (cardOwner.id !== faceOwner.id) {
    return {
      authorized: false,
      code: 'IDENTITY_MISMATCH',
      reason: 'La tarjeta y el rostro no coinciden',
      person: cardOwner,
    }
  }

  if (cardOwner.blocked) {
    return {
      authorized: false,
      code: 'CARD_BLOCKED',
      reason: 'La tarjeta está bloqueada',
      person: cardOwner,
    }
  }

  if (direction === 'ENTRADA' && cardOwner.inside) {
    return {
      authorized: false,
      code: 'ALREADY_INSIDE',
      reason: 'La persona ya aparece dentro',
      person: cardOwner,
    }
  }

  if (direction === 'SALIDA' && !cardOwner.inside) {
    return {
      authorized: false,
      code: 'NOT_INSIDE',
      reason: 'La persona no aparece dentro',
      person: cardOwner,
    }
  }

  if (direction === 'ENTRADA' && occupancy >= capacity) {
    return {
      authorized: false,
      code: 'CAPACITY_REACHED',
      reason: 'Aforo máximo alcanzado',
      person: cardOwner,
    }
  }

  return {
    authorized: true,
    code: 'AUTHORIZED',
    reason: 'Identidad validada',
    person: cardOwner,
  }
}
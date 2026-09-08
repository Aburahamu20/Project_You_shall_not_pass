export type Direction = 'ENTRADA' | 'SALIDA'

export type AccessResult = 'AUTORIZADO' | 'RECHAZADO'

export type Person = {
  id: number
  name: string
  cardId: string
  inside: boolean
  blocked: boolean
  entriesToday: number
}

export type AccessLog = {
  id: number
  person: string
  direction: Direction
  result: AccessResult
  reason: string
  time: string
}
import type { Direction, Person } from '../types/access'

type AccessFormProps = {
  people: Person[]
  direction: Direction
  selectedCard: string
  selectedFace: string
  onDirectionChange: (direction: Direction) => void
  onCardChange: (cardId: string) => void
  onFaceChange: (personId: string) => void
  onValidate: () => void
}

export function AccessForm({
  people,
  direction,
  selectedCard,
  selectedFace,
  onDirectionChange,
  onCardChange,
  onFaceChange,
  onValidate,
}: AccessFormProps) {
  return (
    <article className="panel">
      <h2>Simulador de validación</h2>

      <div className="direction-buttons">
        <button
          className={direction === 'ENTRADA' ? 'active' : ''}
          onClick={() => onDirectionChange('ENTRADA')}
        >
          Entrada
        </button>

        <button
          className={direction === 'SALIDA' ? 'active' : ''}
          onClick={() => onDirectionChange('SALIDA')}
        >
          Salida
        </button>
      </div>

      <label>
        Tarjeta RFID
        <select
          value={selectedCard}
          onChange={(event) => onCardChange(event.target.value)}
        >
          <option value="">Seleccione una tarjeta</option>

          {people.map((person) => (
            <option key={person.cardId} value={person.cardId}>
              {person.cardId} — {person.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Rostro simulado
        <select
          value={selectedFace}
          onChange={(event) => onFaceChange(event.target.value)}
        >
          <option value="">Seleccione un rostro</option>

          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>

      <button className="validate-button" onClick={onValidate}>
        Validar identidad
      </button>
    </article>
  )
}
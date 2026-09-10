import type { Direction, Person } from '../types/access'

type AccessFormProps = {
  people: Person[]
  direction: Direction
  selectedCard: string
  selectedFace: string
  validating: boolean
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
  validating,
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
          type="button"
          className={direction === 'ENTRADA' ? 'active' : ''}
          disabled={validating}
          onClick={() => onDirectionChange('ENTRADA')}
        >
          Entrada
        </button>

        <button
          type="button"
          className={direction === 'SALIDA' ? 'active' : ''}
          disabled={validating}
          onClick={() => onDirectionChange('SALIDA')}
        >
          Salida
        </button>
      </div>

      <label>
        Tarjeta RFID
        <select
          value={selectedCard}
          disabled={validating}
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
          disabled={validating}
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

      <button
        type="button"
        className="validate-button"
        disabled={validating}
        aria-busy={validating}
        onClick={onValidate}
      >
        {validating ? 'Validando…' : 'Validar identidad'}
      </button>
    </article>
  )
}
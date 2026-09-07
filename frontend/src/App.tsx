import { useState } from 'react'
import './App.css'

type Direction = 'ENTRADA' | 'SALIDA'
type AccessResult = 'AUTORIZADO' | 'RECHAZADO'

type Person = {
  id: number
  name: string
  cardId: string
  inside: boolean
  blocked: boolean
  entriesToday: number
}

type AccessLog = {
  id: number
  person: string
  direction: Direction
  result: AccessResult
  reason: string
  time: string
}

const initialPeople: Person[] = [
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

function App() {
  const [people, setPeople] = useState(initialPeople)
  const [occupancy, setOccupancy] = useState(1)
  const [capacity] = useState(10)
  const [direction, setDirection] = useState<Direction>('ENTRADA')
  const [selectedCard, setSelectedCard] = useState('')
  const [selectedFace, setSelectedFace] = useState('')
  const [online, setOnline] = useState(true)
  const [turnstileOpen, setTurnstileOpen] = useState(false)
  const [message, setMessage] = useState('Esperando una validación')
  const [logs, setLogs] = useState<AccessLog[]>([])

  const addLog = (
    person: string,
    result: AccessResult,
    reason: string,
  ) => {
    const newLog: AccessLog = {
      id: Date.now(),
      person,
      direction,
      result,
      reason,
      time: new Date().toLocaleTimeString('es-CL'),
    }

    setLogs((currentLogs) => [newLog, ...currentLogs].slice(0, 8))
  }

  const rejectAccess = (person: string, reason: string) => {
    setTurnstileOpen(false)
    setMessage(reason)
    addLog(person, 'RECHAZADO', reason)
  }

  const validateAccess = () => {
    const cardOwner = people.find(
      (person) => person.cardId === selectedCard,
    )
    const faceOwner = people.find(
      (person) => person.id === Number(selectedFace),
    )

    if (!cardOwner || !faceOwner) {
      rejectAccess('Persona desconocida', 'Falta presentar RFID o rostro')
      return
    }

    if (cardOwner.id !== faceOwner.id) {
      rejectAccess(cardOwner.name, 'La tarjeta y el rostro no coinciden')
      return
    }

    if (cardOwner.blocked) {
      rejectAccess(cardOwner.name, 'La tarjeta está bloqueada')
      return
    }

    if (direction === 'ENTRADA' && cardOwner.inside) {
      rejectAccess(cardOwner.name, 'La persona ya aparece dentro')
      return
    }

    if (direction === 'SALIDA' && !cardOwner.inside) {
      rejectAccess(cardOwner.name, 'La persona no aparece dentro')
      return
    }

    if (direction === 'ENTRADA' && occupancy >= capacity) {
      rejectAccess(cardOwner.name, 'Aforo máximo alcanzado')
      return
    }

    setPeople((currentPeople) =>
      currentPeople.map((person) =>
        person.id === cardOwner.id
          ? {
              ...person,
              inside: direction === 'ENTRADA',
              entriesToday:
                direction === 'ENTRADA'
                  ? person.entriesToday + 1
                  : person.entriesToday,
            }
          : person,
      ),
    )

    setOccupancy((currentOccupancy) =>
      direction === 'ENTRADA'
        ? currentOccupancy + 1
        : Math.max(0, currentOccupancy - 1),
    )

    setTurnstileOpen(true)
    setMessage(`Acceso autorizado para ${cardOwner.name}`)
    addLog(cardOwner.name, 'AUTORIZADO', 'Identidad validada')

    window.setTimeout(() => {
      setTurnstileOpen(false)
      setMessage('Esperando una validación')
    }, 3000)
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="project-name">Project You Shall Not Pass</p>
          <h1>Control de acceso</h1>
        </div>

        <button
          className={online ? 'connection online' : 'connection offline'}
          onClick={() => setOnline((current) => !current)}
        >
          {online ? 'AWS conectado' : 'Modo local Raspberry Pi'}
        </button>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Personas dentro</span>
          <strong>
            {occupancy} / {capacity}
          </strong>
          <p>{occupancy >= capacity ? 'Aforo completo' : 'Acceso disponible'}</p>
        </article>

        <article className="summary-card">
          <span>Modo de operación</span>
          <strong>{online ? 'ONLINE' : 'OFFLINE'}</strong>
          <p>
            {online
              ? 'Validación mediante AWS'
              : 'Reglas locales vigentes por 12 horas'}
          </p>
        </article>

        <article className="summary-card">
          <span>Torniquete</span>
          <strong className={turnstileOpen ? 'success' : 'danger'}>
            {turnstileOpen ? 'HABILITADO' : 'BLOQUEADO'}
          </strong>
          <p>{message}</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h2>Simulador de validación</h2>

          <div className="direction-buttons">
            <button
              className={direction === 'ENTRADA' ? 'active' : ''}
              onClick={() => setDirection('ENTRADA')}
            >
              Entrada
            </button>

            <button
              className={direction === 'SALIDA' ? 'active' : ''}
              onClick={() => setDirection('SALIDA')}
            >
              Salida
            </button>
          </div>

          <label>
            Tarjeta RFID
            <select
              value={selectedCard}
              onChange={(event) => setSelectedCard(event.target.value)}
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
              onChange={(event) => setSelectedFace(event.target.value)}
            >
              <option value="">Seleccione un rostro</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>

          <button className="validate-button" onClick={validateAccess}>
            Validar identidad
          </button>
        </article>

        <article className="panel">
          <h2>Últimos intentos</h2>

          {logs.length === 0 ? (
            <p className="empty-state">Todavía no existen registros.</p>
          ) : (
            <div className="log-list">
              {logs.map((log) => (
                <div className="log-item" key={log.id}>
                  <div>
                    <strong>{log.person}</strong>
                    <p>
                      {log.direction} · {log.time}
                    </p>
                    <small>{log.reason}</small>
                  </div>

                  <span
                    className={
                      log.result === 'AUTORIZADO'
                        ? 'log-success'
                        : 'log-danger'
                    }
                  >
                    {log.result}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default App
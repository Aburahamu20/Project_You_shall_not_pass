import { useEffect, useState } from 'react'

import './App.css'
import { AccessForm } from './components/AccessForm'
import { AccessHistory } from './components/AccessHistory'
import { SummaryCard } from './components/SummaryCard'
import { initialPeople } from './data/mockPeople'
import {
  confirmAccess,
  createAccessRequest,
  EdgeApiError,
  getOccupancy,
  verifyMockFace,
} from './services/edgeApi'
import type {
  AccessLog,
  AccessResult,
  Direction,
  Person,
} from './types/access'

function getReasonMessage(reasonCode: string | null): string {
  switch (reasonCode) {
    case 'CARD_UNKNOWN':
      return 'La tarjeta no está registrada'
    case 'FACE_MISMATCH':
      return 'El rostro no coincide con el propietario de la tarjeta'
    case 'CARD_BLOCKED':
      return 'La tarjeta está bloqueada'
    case 'ALREADY_INSIDE':
      return 'La persona ya se encuentra dentro'
    case 'ALREADY_OUTSIDE':
      return 'La persona ya se encuentra fuera'
    case 'CAPACITY_FULL':
      return 'El lugar alcanzó su capacidad máxima'
    case 'REQUEST_EXPIRED':
      return 'La solicitud de acceso venció'
    default:
      return 'Acceso rechazado'
  }
}

function App() {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [occupancy, setOccupancy] = useState(1)
  const [capacity, setCapacity] = useState(10)
  const [direction, setDirection] = useState<Direction>('ENTRADA')
  const [selectedCard, setSelectedCard] = useState('')
  const [selectedFace, setSelectedFace] = useState('')
  const [online, setOnline] = useState(true)
  const [validating, setValidating] = useState(false)
  const [turnstileOpen, setTurnstileOpen] = useState(false)
  const [message, setMessage] = useState('Esperando una validación')
  const [logs, setLogs] = useState<AccessLog[]>([])

  useEffect(() => {
    void getOccupancy()
      .then((currentOccupancy) => {
        setOccupancy(currentOccupancy.current)
        setCapacity(currentOccupancy.maximum)
      })
      .catch(() => {
        setMessage('Servicio Edge no disponible')
      })
  }, [])

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

  const validateAccess = async () => {
    if (validating) {
      return
    }

    const selectedPerson = people.find(
      (person) => person.cardId === selectedCard,
    )

    if (!selectedCard || !selectedFace) {
      rejectAccess(
        selectedPerson?.name ?? 'Persona desconocida',
        'Debe seleccionar una tarjeta y un rostro',
      )
      return
    }

    setValidating(true)
    setTurnstileOpen(false)
    setMessage('Validando identidad…')

    try {
      const edgeDirection =
        direction === 'ENTRADA' ? 'ENTRY' : 'EXIT'

      const accessRequest = await createAccessRequest(
        selectedCard,
        edgeDirection,
      )

      const faceResult = await verifyMockFace(
        accessRequest.requestId,
        selectedFace,
      )

      if (faceResult.state !== 'AUTHORIZED') {
        rejectAccess(
          selectedPerson?.name ?? 'Persona desconocida',
          getReasonMessage(faceResult.reasonCode),
        )
        return
      }

      await confirmAccess(accessRequest.requestId)

      if (!selectedPerson) {
        rejectAccess(
          'Persona desconocida',
          'No se encontró la persona seleccionada',
        )
        return
      }

      setPeople((currentPeople) =>
        currentPeople.map((person) =>
          person.id === selectedPerson.id
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

      try {
        const currentOccupancy = await getOccupancy()
        setOccupancy(currentOccupancy.current)
        setCapacity(currentOccupancy.maximum)
      } catch {
        // Se conserva temporalmente el cálculo local.
      }

      const successMessage =
        `Acceso autorizado para ${selectedPerson.name}`

      setTurnstileOpen(true)
      setMessage(successMessage)
      addLog(
        selectedPerson.name,
        'AUTORIZADO',
        'Identidad verificada y cruce confirmado',
      )

      window.setTimeout(() => {
        setTurnstileOpen(false)
        setMessage('Esperando una validación')
      }, 3000)
    } catch (error) {
      const reason =
        error instanceof EdgeApiError
          ? error.message
          : 'No se pudo conectar con el servicio Edge'

      rejectAccess(
        selectedPerson?.name ?? 'Persona desconocida',
        reason,
      )
    } finally {
      setValidating(false)
    }
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
          {online ? 'AWS simulado' : 'Raspberry Pi simulado'}
        </button>
      </header>

      <section className="summary-grid">
        <SummaryCard
          title="Personas dentro"
          value={`${occupancy} / ${capacity}`}
          description={
            occupancy >= capacity
              ? 'Aforo completo'
              : 'Acceso disponible'
          }
        />

        <SummaryCard
          title="Modo de operación"
          value={online ? 'ONLINE' : 'OFFLINE'}
          description={
            online
              ? 'Validación mediante el servicio Edge'
              : 'Validación local simulada con reglas vigentes por 12 horas'
          }
        />

        <SummaryCard
          title="Torniquete"
          value={turnstileOpen ? 'HABILITADO' : 'BLOQUEADO'}
          description={message}
          variant={turnstileOpen ? 'success' : 'danger'}
        />
      </section>

      <section className="content-grid">
        <AccessForm
          people={people}
          direction={direction}
          selectedCard={selectedCard}
          selectedFace={selectedFace}
          validating={validating}
          onDirectionChange={setDirection}
          onCardChange={setSelectedCard}
          onFaceChange={setSelectedFace}
          onValidate={validateAccess}
        />

        <AccessHistory logs={logs} />
      </section>
    </main>
  )
}

export default App
import { useState } from 'react'
import { AccessForm } from './components/AccessForm'
import { AccessHistory } from './components/AccessHistory'
import { SummaryCard } from './components/SummaryCard'
import { initialPeople } from './data/mockPeople'
import { evaluateAccess } from './services/accessRules'
import type {
  AccessLog,
  AccessResult,
  Direction,
  Person,
} from './types/access'
import './App.css'

function App() {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [occupancy, setOccupancy] = useState(1)
  const [direction, setDirection] = useState<Direction>('ENTRADA')
  const [selectedCard, setSelectedCard] = useState('')
  const [selectedFace, setSelectedFace] = useState('')
  const [online, setOnline] = useState(true)
  const [turnstileOpen, setTurnstileOpen] = useState(false)
  const [message, setMessage] = useState('Esperando una validación')
  const [logs, setLogs] = useState<AccessLog[]>([])

  const capacity = 10

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
    const decision = evaluateAccess({
      people,
      selectedCard,
      selectedFace,
      direction,
      occupancy,
      capacity,
    })

    if (!decision.authorized || !decision.person) {
      rejectAccess(
        decision.person?.name ?? 'Persona desconocida',
        decision.reason,
      )
      return
    }

    const authorizedPerson = decision.person

    setPeople((currentPeople) =>
      currentPeople.map((person) =>
        person.id === authorizedPerson.id
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
    setMessage(`Acceso autorizado para ${authorizedPerson.name}`)
    addLog(authorizedPerson.name, 'AUTORIZADO', decision.reason)

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
          {online ? 'AWS simulado' : 'Raspberry Pi simulado'}
        </button>
      </header>

      <section className="summary-grid">
        <SummaryCard
          title="Personas dentro"
          value={`${occupancy} / ${capacity}`}
          description={
            occupancy >= capacity ? 'Aforo completo' : 'Acceso disponible'
          }
        />

        <SummaryCard
          title="Modo de operación"
          value={online ? 'ONLINE' : 'OFFLINE'}
          description={
            online
              ? 'Validación simulada mediante AWS'
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
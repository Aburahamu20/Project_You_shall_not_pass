import type { AccessLog } from '../types/access'

type AccessHistoryProps = {
  logs: AccessLog[]
}

export function AccessHistory({ logs }: AccessHistoryProps) {
  return (
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
  )
}
import { app } from './app.js'
import { initializeDatabase } from './database/database.js'
import { cleanupAccessRequests } from './stores/accessRequestStore.js'

const port = Number(process.env.PORT ?? 8080)

const retentionDays = getPositiveNumber(
  process.env.ACCESS_REQUEST_RETENTION_DAYS,
  30,
)

const cleanupIntervalMinutes = getPositiveNumber(
  process.env.ACCESS_REQUEST_CLEANUP_INTERVAL_MINUTES,
  60,
)

function getPositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined) {
    return fallback
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) &&
    parsedValue > 0
    ? parsedValue
    : fallback
}

function runAccessRequestCleanup(): void {
  try {
    const result = cleanupAccessRequests(
      new Date(),
      retentionDays,
    )

    if (result.expired > 0 || result.deleted > 0) {
      console.log(
        `Limpieza SQLite: ${result.expired} expiradas, ` +
          `${result.deleted} eliminadas`,
      )
    }
  } catch (error) {
    console.error(
      'No se pudo ejecutar la limpieza de solicitudes',
      error,
    )
  }
}

initializeDatabase()
runAccessRequestCleanup()

const cleanupTimer = setInterval(
  runAccessRequestCleanup,
  cleanupIntervalMinutes * 60 * 1000,
)

cleanupTimer.unref()

app.listen(port, () => {
  console.log(
    `Edge Simulator ejecutándose en http://localhost:${port}`,
  )
})
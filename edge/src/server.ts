import { app } from './app.js'
import { initializeDatabase } from './database/database.js'

const port = Number(process.env.PORT ?? 8080)

initializeDatabase()

app.listen(port, () => {
  console.log(
    `Edge Simulator ejecutándose en http://localhost:${port}`,
  )
})
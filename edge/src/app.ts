import cors from 'cors'
import express from 'express'

export const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'edge-simulator',
    simulated: true,
    timestamp: new Date().toISOString(),
  })
})
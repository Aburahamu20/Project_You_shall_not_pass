import cors from 'cors'
import express from 'express'

import { accessRequestsRouter } from './routes/accessRequests.js'

export const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.use(express.json())

app.use('/api/v1/access-requests', accessRequestsRouter)

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'OK',
    service: 'edge-simulator',
    simulated: true,
    serverTime: new Date().toISOString(),
  })
})
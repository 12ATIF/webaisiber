import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { analyzeRouter } from '../server/src/routes/analyze'

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked: ${origin}`))
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json({ limit: '20mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'WaspadaSiber API', timestamp: new Date().toISOString() })
})

app.use('/v1', analyzeRouter)

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' })
})

export default app

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { analyzeRouter } from './routes/analyze'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Security & parsing middleware
app.use(helmet())

const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman) or matching origins
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

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'WaspadaSiber API', timestamp: new Date().toISOString() })
})

// API routes
app.use('/v1', analyzeRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' })
})

// Start server (only when not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✅ WaspadaSiber API berjalan di port ${PORT}`)
  })
}

export { app }

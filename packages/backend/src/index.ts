import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import type { GenerationResponse } from 'shared-types'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'text-to-animated-video-generator-backend'
  })
})

// API routes
app.get('/api/status', (_req, res) => {
  res.json({ 
    message: 'Backend API is running',
    services: {
      remotion: 'initialized',
      threejs: 'initialized', 
      manim: 'initialized'
    }
  })
})

// Video generation endpoint placeholder
app.post('/api/generate', (_req, res) => {
  // Placeholder response
  const response: GenerationResponse = {
    sessionId: `session_${Date.now()}`,
    status: 'pending',
    progress: 0
  }
  
  res.json(response)
})

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API status: http://localhost:${PORT}/api/status`)
})
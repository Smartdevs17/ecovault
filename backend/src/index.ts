import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { connectDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import projectRoutes from './routes/projects'
import impactRoutes from './routes/impact'
import userRoutes from './routes/users'

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())

const allowedOrigins = [
	process.env.FRONTEND_URL,
	'http://localhost:8080',
	'http://localhost:5173',
	'http://localhost:3000',
].filter(Boolean) as string[]

app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true)
		
		// Check if origin is in allowed list
		if (allowedOrigins.includes(origin)) {
			callback(null, true)
		} else {
			// In development, allow all localhost origins
			if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req, res) => {
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	})
})

// API Routes
app.use('/api/projects', projectRoutes)
app.use('/api/impact', impactRoutes)
app.use('/api/users', userRoutes)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

if (require.main === module) {
	async function startServer() {
		try {
			await connectDatabase()

			const server = app.listen(PORT, () => {
				console.log(`Server running on port ${PORT}`)
			})

			server.on('error', (error: NodeJS.ErrnoException) => {
				if (error.code === 'EADDRINUSE') {
					console.error(`Port ${PORT} is already in use`)
					process.exit(1)
				} else {
					console.error('Server error:', error)
					process.exit(1)
				}
			})
		} catch (error) {
			console.error('Failed to start server:', error)
			process.exit(1)
		}
	}

	startServer()
}

export default app


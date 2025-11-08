import mongoose from 'mongoose'

export async function connectDatabase() {
	try {
		// Read MONGO_URI directly from process.env to ensure it's loaded
		const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecovault'

		if (!mongoUri) {
			throw new Error('MONGO_URI is not defined in environment variables')
		}

		if (mongoUri === 'mongodb://localhost:27017/ecovault') {
			console.warn('Using default localhost MongoDB URI. Set MONGO_URI in .env file.')
		}

		// MongoDB Atlas connection options - optimized for unstable networks
		const options: mongoose.ConnectOptions = {
			serverSelectionTimeoutMS: 30000, // Increased from 5s to 30s for unstable networks
			socketTimeoutMS: 60000, // Increased from 45s to 60s
			connectTimeoutMS: 30000, // 30 second connection timeout
			heartbeatFrequencyMS: 10000, // Check connection health every 10s
			retryWrites: true,
			retryReads: true,
			maxPoolSize: 10, // Maximum number of connections in pool
			minPoolSize: 2, // Minimum number of connections to maintain
			maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
		}

		// Retry connection with exponential backoff (handles DNS timeouts and network issues)
		let retries = 0
		const maxRetries = 5
		const baseDelay = 3000 // Start with 3 seconds for unstable networks

		while (retries < maxRetries) {
			try {
				await mongoose.connect(mongoUri, options)
				break
			} catch (error) {
				retries++
				const isDNSTimeout = error instanceof Error && (
					error.message.includes('ETIMEOUT') ||
					error.message.includes('queryTxt') ||
					error.message.includes('ENOTFOUND') ||
					error.code === 'ETIMEOUT'
				)
				
				if (retries >= maxRetries) {
					if (isDNSTimeout) {
						console.error('MongoDB connection failed: DNS timeout. Check network connection.')
					} else {
						console.error('MongoDB connection failed after all retry attempts')
					}
					throw error
				}
				
				const delay = baseDelay * Math.pow(2, retries - 1)
				
				await new Promise(resolve => setTimeout(resolve, delay))
			}
		}

		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err)
		})

		mongoose.connection.on('disconnected', () => {
			console.warn('MongoDB disconnected')
		})

		mongoose.connection.on('connected', () => {
			// Connection established
		})

		mongoose.connection.on('reconnected', () => {
			// Reconnection successful
		})
	} catch (error) {
		console.error('MongoDB connection error:', error instanceof Error ? error.message : error)
		throw error
	}
}

export async function disconnectDatabase() {
	try {
		await mongoose.disconnect()
	} catch (error) {
		console.error('MongoDB disconnection error:', error)
		throw error
	}
}


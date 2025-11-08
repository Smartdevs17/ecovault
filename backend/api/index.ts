import { connectDatabase } from '../src/config/database'
import app from '../src/index'

connectDatabase().catch(console.error)

export default app

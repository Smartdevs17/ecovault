import { Router } from 'express'
import { getUser, getUserStats, getLeaderboard } from '../controllers/users'

const router = Router()

// Get user by address
router.get('/:address', getUser)

// Get user stats
router.get('/:address/stats', getUserStats)

// Get leaderboard
router.get('/leaderboard/top', getLeaderboard)

export default router


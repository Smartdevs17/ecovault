import { Router } from 'express'
import { body } from 'express-validator'
import { logImpact, getUserImpact, getAllImpacts } from '../controllers/impact'
import { validate } from '../middleware/validate'

const router = Router()

// Log new impact
router.post(
	'/',
	validate([
		body('user').matches(/^0x[a-fA-F0-9]{40}$/),
		body('actionType').isIn(['recycling', 'transport', 'water', 'energy', 'tree_planting', 'project_funding', 'other']),
		body('amount').trim().isLength({ min: 1 }),
		body('description').trim().isLength({ min: 1, max: 1000 }),
		body('carbonReduced').isFloat({ min: 0 }),
	]),
	logImpact
)

// Get user's impact
router.get('/user/:address', getUserImpact)

// Get all impacts
router.get('/', getAllImpacts)

export default router


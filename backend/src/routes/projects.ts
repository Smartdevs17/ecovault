import { Router } from 'express'
import { body } from 'express-validator'
import {
	getAllProjects,
	getProject,
	createProject,
	updateProject,
	getUserProjects,
	getProjectContribution,
	verifyProject,
} from '../controllers/projects'
import { validate } from '../middleware/validate'

const router = Router()

// Get all projects
router.get('/', getAllProjects)

// Get project by ID
router.get('/:id', getProject)

// Create new project
router.post(
	'/',
	validate([
		body('name').trim().isLength({ min: 1, max: 200 }),
		body('description').trim().isLength({ min: 1, max: 5000 }),
		body('fundingGoal').isString().notEmpty(),
		body('owner').matches(/^0x[a-fA-F0-9]{40}$/),
	]),
	createProject
)

// Update project
router.patch('/:id', updateProject)

// Get user's projects
router.get('/user/:address', getUserProjects)

// Get user's contribution to a project
router.get('/:projectId/contribution/:userAddress', getProjectContribution)

// Verify project (only verifiers)
router.post('/:id/verify', verifyProject)

export default router


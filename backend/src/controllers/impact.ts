import { Request, Response, NextFunction } from 'express'
import { Impact } from '../models/Impact'
import { User } from '../models/User'
import { createError } from '../middleware/errorHandler'

export const logImpact = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { user, actionType, amount, description, carbonReduced, waterSaved, projectId } = req.body

		if (!user || !actionType || !amount || !description || carbonReduced === undefined) {
			throw createError('Missing required fields', 400)
		}

		// Calculate points based on action type
		const points = calculatePoints(actionType, carbonReduced)

		const impact = await Impact.create({
			user: user.toLowerCase(),
			actionType,
			amount,
			description,
			carbonReduced,
			waterSaved,
			points,
			projectId,
		})

		// Update user stats
		await updateUserStats(user.toLowerCase(), {
			points,
			carbonReduced,
			waterSaved: waterSaved || 0,
		})

		res.status(201).json({
			success: true,
			data: impact,
		})
	} catch (error) {
		next(error)
	}
}

export const getUserImpact = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { address } = req.params

		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
			throw createError('Invalid wallet address', 400)
		}

		const impacts = await Impact.find({ user: address.toLowerCase() })
			.sort({ createdAt: -1 })
			.populate('projectId', 'name description')

		// Get user stats
		const user = await User.findOne({ walletAddress: address.toLowerCase() })

		res.json({
			success: true,
			data: {
				impacts,
				stats: user || {
					totalImpactPoints: 0,
					totalCarbonReduced: 0,
					totalWaterSaved: 0,
					totalContributions: 0,
					nftCount: 0,
				},
			},
		})
	} catch (error) {
		next(error)
	}
}

export const getAllImpacts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { actionType, limit = 50, skip = 0 } = req.query

		const filter: Record<string, string> = {}
		if (actionType) filter.actionType = actionType as string

		const impacts = await Impact.find(filter)
			.sort({ createdAt: -1 })
			.limit(Number(limit))
			.skip(Number(skip))
			.populate('projectId', 'name description')

		res.json({
			success: true,
			data: impacts,
			count: impacts.length,
		})
	} catch (error) {
		next(error)
	}
}

function calculatePoints(actionType: string, carbonReduced: number): number {
	const basePoints: Record<string, number> = {
		recycling: 10,
		transport: 8,
		water: 5,
		energy: 12,
		tree_planting: 25,
		project_funding: 50,
		other: 5,
	}

	const base = basePoints[actionType] || 5
	return base + Math.floor(carbonReduced / 10) // Bonus points for carbon reduced
}

async function updateUserStats(walletAddress: string, stats: { points: number; carbonReduced: number; waterSaved: number }) {
	await User.findOneAndUpdate(
		{ walletAddress },
		{
			$inc: {
				totalImpactPoints: stats.points,
				totalCarbonReduced: stats.carbonReduced,
				totalWaterSaved: stats.waterSaved,
				totalContributions: 1,
			},
		},
		{ upsert: true, new: true }
	)
}


import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User'
import { Impact } from '../models/Impact'
import { Project } from '../models/Project'
import { createError } from '../middleware/errorHandler'

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { address } = req.params

		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
			throw createError('Invalid wallet address', 400)
		}

		let user = await User.findOne({ walletAddress: address.toLowerCase() })

		if (!user) {
			// Create user if doesn't exist
			user = await User.create({
				walletAddress: address.toLowerCase(),
			})
		}

		// Get additional stats
		const impactCount = await Impact.countDocuments({ user: address.toLowerCase() })
		const projectCount = await Project.countDocuments({ owner: address.toLowerCase() })

		res.json({
			success: true,
			data: {
				...user.toObject(),
				impactCount,
				projectCount,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { address } = req.params

		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
			throw createError('Invalid wallet address', 400)
		}

		const user = await User.findOne({ walletAddress: address.toLowerCase() })
		const impacts = await Impact.find({ user: address.toLowerCase() })

		// Calculate stats
		const stats = {
			totalImpactPoints: user?.totalImpactPoints || 0,
			totalCarbonReduced: user?.totalCarbonReduced || 0,
			totalWaterSaved: user?.totalWaterSaved || 0,
			totalContributions: impacts.length,
			nftCount: user?.nftCount || 0,
			byActionType: impacts.reduce((acc, impact) => {
				acc[impact.actionType] = (acc[impact.actionType] || 0) + 1
				return acc
			}, {} as Record<string, number>),
		}

		res.json({
			success: true,
			data: stats,
		})
	} catch (error) {
		next(error)
	}
}

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { limit = 10 } = req.query

		const users = await User.find()
			.sort({ totalImpactPoints: -1 })
			.limit(Number(limit))
			.select('walletAddress totalImpactPoints totalCarbonReduced totalContributions')

		res.json({
			success: true,
			data: users,
		})
	} catch (error) {
		next(error)
	}
}


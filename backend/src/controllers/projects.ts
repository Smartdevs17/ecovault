import { Request, Response, NextFunction } from 'express'
import { Project } from '../models/Project'
import { createError } from '../middleware/errorHandler'
import { getProjectFromChain, getProjectFundings, getUserContribution, verifyProjectOnChain, findProjectOnChainId, getProjectTotalContributions } from '../services/blockchain'

export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { verified, active } = req.query

		const filter: Record<string, boolean> = {}
		if (verified !== undefined) filter.isVerified = verified === 'true'
		if (active !== undefined) filter.isActive = active === 'true'

		const projects = await Project.find(filter).sort({ createdAt: -1 })

		const syncPromises = projects
			.filter(p => p.onChainId)
			.map(async (project) => {
				try {
					const [totalContributionsResult, fundingsResult] = await Promise.allSettled([
						getProjectTotalContributions(project.onChainId!),
						getProjectFundings(project.onChainId!),
					])
					
					if (totalContributionsResult.status === 'fulfilled') {
						project.totalFunds = totalContributionsResult.value
					}
					
					if (fundingsResult.status === 'fulfilled') {
						const uniqueContributors = new Set(fundingsResult.value.map(f => f.funder.toLowerCase()))
						project.contributors = uniqueContributors.size
					}
					
					if (totalContributionsResult.status === 'fulfilled' || fundingsResult.status === 'fulfilled') {
						await project.save()
					}
				} catch (error) {
				}
			})
		
		Promise.allSettled(syncPromises).catch(() => {
		})

		res.json({
			success: true,
			data: projects,
			count: projects.length,
		})
	} catch (error) {
		next(error)
	}
}

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params

		let project = await Project.findById(id)
		
		if (!project && req.query.onChainId) {
			const onChainId = Number(req.query.onChainId)
			const chainProject = await getProjectFromChain(onChainId)
			
			project = await Project.create({
				name: chainProject.name,
				description: chainProject.description,
				owner: chainProject.owner,
				fundingGoal: chainProject.fundingGoal,
				totalFunds: chainProject.totalFunds,
				isVerified: chainProject.isVerified,
				isActive: chainProject.isActive,
				onChainId: chainProject.id,
			})
		}

		if (!project) {
			throw createError('Project not found', 404)
		}

		let fundings: Array<{ funder: string; amount: string; timestamp: number }> = []
		let totalFunds = project.totalFunds || '0'
		let contributors = project.contributors || 0
		
		if (project.onChainId) {
			try {
				const fundingPromise = getProjectFundings(project.onChainId)
				const totalContributionsPromise = getProjectTotalContributions(project.onChainId)
				
				const [fundingsResult, totalContributionsResult] = await Promise.allSettled([
					fundingPromise,
					totalContributionsPromise,
				])
				
				if (fundingsResult.status === 'fulfilled') {
					fundings = fundingsResult.value
					const uniqueContributors = new Set(fundings.map(f => f.funder.toLowerCase()))
					contributors = uniqueContributors.size
				}
				
				if (totalContributionsResult.status === 'fulfilled') {
					totalFunds = totalContributionsResult.value
					project.totalFunds = totalFunds
					project.contributors = contributors
					await project.save()
				}
			} catch (error) {
			}
		}

		res.json({
			success: true,
			data: {
				...project.toObject(),
				totalFunds,
				contributors,
				fundings,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, description, fundingGoal, owner, onChainId } = req.body

		if (!name || !description || !fundingGoal || !owner) {
			throw createError('Missing required fields', 400)
		}

		const project = await Project.create({
			name,
			description,
			owner: owner.toLowerCase(),
			fundingGoal,
			totalFunds: '0',
			isVerified: false,
			isActive: true, // Explicitly set to true
			onChainId: onChainId || undefined,
		})

		res.status(201).json({
			success: true,
			data: project,
		})
	} catch (error) {
		next(error)
	}
}

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params
		const updates = req.body

		const project = await Project.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		})

		if (!project) {
			throw createError('Project not found', 404)
		}

		res.json({
			success: true,
			data: project,
		})
	} catch (error) {
		next(error)
	}
}

export const getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { address } = req.params

		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
			throw createError('Invalid wallet address', 400)
		}

		const projects = await Project.find({ owner: address.toLowerCase() }).sort({ createdAt: -1 })

		res.json({
			success: true,
			data: projects,
			count: projects.length,
		})
	} catch (error) {
		next(error)
	}
}

export const getProjectContribution = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { projectId, userAddress } = req.params

		const project = await Project.findById(projectId)
		if (!project || !project.onChainId) {
			throw createError('Project not found or not on-chain', 404)
		}

		const contribution = await getUserContribution(userAddress, project.onChainId)

		res.json({
			success: true,
			data: {
				userAddress,
				projectId: project.onChainId,
				contribution,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const verifyProject = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params

		const project = await Project.findById(id)
		if (!project) {
			throw createError('Project not found', 404)
		}

		if (project.isVerified) {
			throw createError('Project is already verified', 400)
		}

		// If onChainId is missing, try to find it from on-chain data
		let onChainId = project.onChainId
		if (!onChainId) {
			const foundId = await findProjectOnChainId(project.name, project.owner)
			if (foundId) {
				onChainId = foundId
				project.onChainId = foundId
				await project.save()
			} else {
				throw createError('Project is not on-chain. Cannot verify. Please ensure the project was created on-chain first.', 400)
			}
		}

		const txHash = await verifyProjectOnChain(onChainId)

		project.isVerified = true
		await project.save()

		res.json({
			success: true,
			data: {
				...project.toObject(),
				verificationTxHash: txHash,
			},
		})
	} catch (error) {
		next(error)
	}
}


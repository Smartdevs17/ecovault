import mongoose, { Schema, Document } from 'mongoose'

export interface IImpact extends Document {
	user: string // Wallet address
	projectId?: mongoose.Types.ObjectId
	onChainProjectId?: number
	actionType: string // e.g., 'recycling', 'transport', 'tree_planting'
	amount: string // e.g., '5 kg', '10 km'
	description: string
	carbonReduced: number // In kg
	waterSaved?: number // In liters
	points: number
	nftTokenId?: number
	onChainTxHash?: string
	createdAt: Date
	updatedAt: Date
}

const ImpactSchema = new Schema<IImpact>(
	{
		user: {
			type: String,
			required: true,
			lowercase: true,
			validate: {
				validator: (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v),
				message: 'Invalid wallet address format',
			},
		},
		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
		},
		onChainProjectId: {
			type: Number,
		},
		actionType: {
			type: String,
			required: true,
			enum: ['recycling', 'transport', 'water', 'energy', 'tree_planting', 'project_funding', 'other'],
		},
		amount: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1000,
		},
		carbonReduced: {
			type: Number,
			required: true,
			min: 0,
		},
		waterSaved: {
			type: Number,
			min: 0,
		},
		points: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
		},
		nftTokenId: {
			type: Number,
		},
		onChainTxHash: {
			type: String,
			validate: {
				validator: (v: string) => !v || /^0x[a-fA-F0-9]{64}$/.test(v),
				message: 'Invalid transaction hash format',
			},
		},
	},
	{
		timestamps: true,
	}
)

// Indexes
ImpactSchema.index({ user: 1 })
ImpactSchema.index({ projectId: 1 })
ImpactSchema.index({ onChainProjectId: 1 })
ImpactSchema.index({ actionType: 1 })
ImpactSchema.index({ createdAt: -1 })

export const Impact = mongoose.model<IImpact>('Impact', ImpactSchema)


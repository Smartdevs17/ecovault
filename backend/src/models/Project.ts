import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
	name: string
	description: string
	owner: string // Wallet address
	fundingGoal: string // In wei
	totalFunds: string // In wei
	contributors?: number // Number of unique contributors
	isVerified: boolean
	isActive: boolean
	onChainId?: number // Project ID on blockchain
	createdAt: Date
	updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 200,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 5000,
		},
		owner: {
			type: String,
			required: true,
			lowercase: true,
			validate: {
				validator: (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v),
				message: 'Invalid wallet address format',
			},
		},
		fundingGoal: {
			type: String,
			required: true,
		},
		totalFunds: {
			type: String,
			default: '0',
		},
		contributors: {
			type: Number,
			default: 0,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		onChainId: {
			type: Number,
			unique: true,
			sparse: true,
		},
	},
	{
		timestamps: true,
	}
)

// Indexes (onChainId already has unique index from schema definition)
ProjectSchema.index({ owner: 1 })
ProjectSchema.index({ isVerified: 1 })
ProjectSchema.index({ isActive: 1 })

export const Project = mongoose.model<IProject>('Project', ProjectSchema)


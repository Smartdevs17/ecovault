import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
	walletAddress: string // Primary identifier
	totalImpactPoints: number
	totalCarbonReduced: number // In kg
	totalWaterSaved: number // In liters
	totalContributions: number // Number of contributions
	nftCount: number
	createdAt: Date
	updatedAt: Date
}

const UserSchema = new Schema<IUser>(
	{
		walletAddress: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			validate: {
				validator: (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v),
				message: 'Invalid wallet address format',
			},
		},
		totalImpactPoints: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalCarbonReduced: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalWaterSaved: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalContributions: {
			type: Number,
			default: 0,
			min: 0,
		},
		nftCount: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{
		timestamps: true,
	}
)

// Indexes (walletAddress already has unique index from schema definition)

export const User = mongoose.model<IUser>('User', UserSchema)


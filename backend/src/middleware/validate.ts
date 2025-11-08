import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'

export function validate(validations: ValidationChain[]) {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		await Promise.all(validations.map((validation) => validation.run(req)))

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				error: {
					message: 'Validation failed',
					errors: errors.array(),
				},
			})
			return
		}

		next()
	}
}

export function validateWalletAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function validateTransactionHash(hash: string): boolean {
	return /^0x[a-fA-F0-9]{64}$/.test(hash)
}


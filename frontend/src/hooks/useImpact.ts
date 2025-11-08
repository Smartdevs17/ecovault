/**
 * React Query hooks for Impact API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { impactApi } from '@/lib/api'
import { useAccount } from 'wagmi'

// Get user's impact
export function useUserImpact() {
	const { address } = useAccount()

	return useQuery({
		queryKey: ['user-impact', address],
		queryFn: async () => {
			if (!address) return null
			const response = await impactApi.getUserImpact(address)
			return response.data
		},
		enabled: !!address,
	})
}

// Get all impacts
export function useImpacts(params?: { actionType?: string; limit?: number; skip?: number }) {
	return useQuery({
		queryKey: ['impacts', params],
		queryFn: async () => {
			const response = await impactApi.getAll(params)
			return response.data
		},
	})
}

// Log impact mutation
export function useLogImpact() {
	const queryClient = useQueryClient()
	const { address } = useAccount()

	return useMutation({
		mutationFn: (data: {
			actionType: string
			amount: string
			description: string
			carbonReduced: number
			waterSaved?: number
			projectId?: string
		}) => {
			if (!address) throw new Error('Wallet not connected')
			return impactApi.log({
				...data,
				user: address,
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-impact'] })
			queryClient.invalidateQueries({ queryKey: ['impacts'] })
			queryClient.invalidateQueries({ queryKey: ['user-stats'] })
		},
	})
}


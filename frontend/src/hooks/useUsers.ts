/**
 * React Query hooks for Users API
 */

import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import { useAccount } from 'wagmi'

// Get current user
export function useUser() {
	const { address } = useAccount()

	return useQuery({
		queryKey: ['user', address],
		queryFn: async () => {
			if (!address) return null
			const response = await usersApi.getUser(address)
			return response.data
		},
		enabled: !!address,
	})
}

// Get user stats
export function useUserStats() {
	const { address } = useAccount()

	return useQuery({
		queryKey: ['user-stats', address],
		queryFn: async () => {
			if (!address) return null
			const response = await usersApi.getUserStats(address)
			return response.data
		},
		enabled: !!address,
	})
}

// Get leaderboard
export function useLeaderboard(limit: number = 10) {
	return useQuery({
		queryKey: ['leaderboard', limit],
		queryFn: async () => {
			const response = await usersApi.getLeaderboard(limit)
			return response.data
		},
	})
}


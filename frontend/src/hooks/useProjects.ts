/**
 * React Query hooks for Projects API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, type ApiResponse } from '@/lib/api'
import { useAccount } from 'wagmi'

// Get all projects
export function useProjects(params?: { verified?: string; active?: string }) {
	return useQuery({
		queryKey: ['projects', params],
		queryFn: async () => {
			const response = await projectsApi.getAll(params)
			return response.data
		},
	})
}

// Get project by ID
export function useProject(id: string | undefined) {
	return useQuery({
		queryKey: ['project', id],
		queryFn: async () => {
			if (!id) return null
			const response = await projectsApi.getById(id)
			return response.data
		},
		enabled: !!id,
	})
}

// Get user's projects
export function useUserProjects() {
	const { address } = useAccount()

	return useQuery({
		queryKey: ['user-projects', address],
		queryFn: async () => {
			if (!address) return null
			const response = await projectsApi.getUserProjects(address)
			return response.data
		},
		enabled: !!address,
	})
}

// Create project mutation
export function useCreateProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			name: string
			description: string
			fundingGoal: string
			owner: string
			onChainId?: number
		}) => projectsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
		},
	})
}

// Update project mutation
export function useUpdateProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
			projectsApi.update(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
			queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
		},
	})
}

// Get user contribution
export function useUserContribution(projectId: string | undefined) {
	const { address } = useAccount()

	return useQuery({
		queryKey: ['contribution', projectId, address],
		queryFn: async () => {
			if (!projectId || !address) return null
			const response = await projectsApi.getUserContribution(projectId, address)
			return response.data
		},
		enabled: !!projectId && !!address,
	})
}

// Verify project mutation
export function useVerifyProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => projectsApi.verify(id),
		onSuccess: (_, variables) => {
			// Invalidate all project-related queries to refresh the UI immediately
			queryClient.invalidateQueries({ queryKey: ['projects'] })
			queryClient.invalidateQueries({ queryKey: ['project', variables] })
			queryClient.invalidateQueries({ queryKey: ['project'] })
		},
	})
}


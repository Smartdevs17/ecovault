/**
 * API Client for EcoVault Backend
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
})

// Request interceptor (for adding auth tokens, etc.)
apiClient.interceptors.request.use(
	(config) => {
		// Add any auth tokens here if needed
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			// Server responded with error
			return Promise.reject(error.response.data)
		} else if (error.request) {
			// Request made but no response
			return Promise.reject(new Error('Network error. Please check your connection.'))
		} else {
			// Something else happened
			return Promise.reject(error)
		}
	}
)

// API Response Types
export interface ApiResponse<T> {
	success: boolean
	data: T
	count?: number
}

export interface ApiError {
	success: false
	error: {
		message: string
		errors?: Array<{ msg: string; param: string }>
	}
}

// Projects API
export const projectsApi = {
	getAll: (params?: { verified?: string; active?: string }) =>
		apiClient.get<ApiResponse<any[]>>('/projects', { params }),

	getById: (id: string) =>
		apiClient.get<ApiResponse<any>>(`/projects/${id}`),

	create: (data: {
		name: string
		description: string
		fundingGoal: string
		owner: string
		onChainId?: number
	}) =>
		apiClient.post<ApiResponse<any>>('/projects', data),

	update: (id: string, data: Partial<any>) =>
		apiClient.patch<ApiResponse<any>>(`/projects/${id}`, data),

	getUserProjects: (address: string) =>
		apiClient.get<ApiResponse<any[]>>(`/projects/user/${address}`),

	getUserContribution: (projectId: string, userAddress: string) =>
		apiClient.get<ApiResponse<any>>(`/projects/${projectId}/contribution/${userAddress}`),

	verify: (id: string) =>
		apiClient.post<ApiResponse<any>>(`/projects/${id}/verify`),
}

// Impact API
export const impactApi = {
	log: (data: {
		user: string
		actionType: string
		amount: string
		description: string
		carbonReduced: number
		waterSaved?: number
		projectId?: string
	}) =>
		apiClient.post<ApiResponse<any>>('/impact', data),

	getUserImpact: (address: string) =>
		apiClient.get<ApiResponse<{ impacts: any[]; stats: any }>>(`/impact/user/${address}`),

	getAll: (params?: { actionType?: string; limit?: number; skip?: number }) =>
		apiClient.get<ApiResponse<any[]>>('/impact', { params }),
}

// Users API
export const usersApi = {
	getUser: (address: string) =>
		apiClient.get<ApiResponse<any>>(`/users/${address}`),

	getUserStats: (address: string) =>
		apiClient.get<ApiResponse<any>>(`/users/${address}/stats`),

	getLeaderboard: (limit?: number) =>
		apiClient.get<ApiResponse<any[]>>('/users/leaderboard/top', {
			params: { limit },
		}),
}

// Health Check
export const healthApi = {
	check: () => axios.get(`${API_URL.replace('/api', '')}/health`),
}


/**
 * Wagmi hooks for ProjectRegistry contract interactions
 */

import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { projectRegistryContract } from '@/lib/contracts/abis'
import { parseEther } from 'viem'
import { SUPPORTED_NETWORK } from '@/lib/web3-config'

// Create project
export function useCreateProject() {
	const { chainId } = useAccount()
	const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
	const { 
		isLoading: isConfirming, 
		isSuccess, 
		isError: isReceiptError,
		error: receiptError,
		data: receipt
	} = useWaitForTransactionReceipt({
		hash,
		query: {
			retry: 10,
			retryDelay: 2000,
			enabled: !!hash,
			refetchInterval: (query) => {
				// Poll every 2 seconds if still confirming
				if (query.state.status === 'pending') {
					return 2000
				}
				return false
			},
		},
		timeout: 120000, // 2 minute timeout
	})

	const createProject = async (name: string, description: string, fundingGoal: string) => {
		// Enforce Base Sepolia network before transaction
		if (chainId !== SUPPORTED_NETWORK.BASE_SEPOLIA) {
			throw new Error(`Wrong network! You're on chain ID ${chainId}. Please switch to Base Sepolia (${SUPPORTED_NETWORK.BASE_SEPOLIA}) before creating a project.`)
		}
		
		// writeContract triggers the write and returns void
		// The hash will be set in the hook's state after MetaMask confirms
		writeContract({
			...projectRegistryContract,
			functionName: 'createProject',
			args: [name, description, parseEther(fundingGoal)],
			chainId: SUPPORTED_NETWORK.BASE_SEPOLIA, // Explicitly set chain ID
		})
	}

	return {
		createProject,
		hash,
		isPending,
		isConfirming,
		isSuccess,
		isReceiptError,
		receiptError,
		receipt,
		error,
		reset,
	}
}

// Get project
export function useProject(projectId: bigint | undefined) {
	return useReadContract({
		...projectRegistryContract,
		functionName: 'getProject',
		args: projectId ? [projectId] : undefined,
		query: {
			enabled: !!projectId,
		},
	})
}

// Get project count
export function useProjectCount() {
	return useReadContract({
		...projectRegistryContract,
		functionName: 'projectCount',
	})
}

// Get user projects
export function useUserProjectsOnChain() {
	const { address } = useAccount()

	return useReadContract({
		...projectRegistryContract,
		functionName: 'getUserProjects',
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	})
}

// Get contract owner
export function useContractOwner() {
	return useReadContract({
		...projectRegistryContract,
		functionName: 'owner',
	})
}

// Check if address is verifier
export function useIsVerifier(address: string | undefined) {
	return useReadContract({
		...projectRegistryContract,
		functionName: 'verifiers',
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	})
}

// Check if current user is verifier (owner or in verifiers mapping)
export function useIsUserVerifier() {
	const { address } = useAccount()
	const { data: owner } = useContractOwner()
	const { data: isVerifier } = useIsVerifier(address)

	return {
		isVerifier: address && (address.toLowerCase() === owner?.toLowerCase() || isVerifier === true),
		isLoading: owner === undefined || (address !== undefined && isVerifier === undefined),
	}
}


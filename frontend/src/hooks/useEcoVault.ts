/**
 * Wagmi hooks for EcoVault contract interactions
 */

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { ecoVaultContract } from '@/lib/contracts/abis'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'

// Fund project
export function useFundProject() {
	const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash,
	})

	const fundProject = async (projectId: bigint, amount: string) => {
		return writeContract({
			...ecoVaultContract,
			functionName: 'fundProject',
			args: [projectId],
			value: parseEther(amount),
		})
	}

	return {
		fundProject,
		hash,
		isPending,
		isConfirming,
		isSuccess,
		error,
		reset,
	}
}

// Get project fundings
export function useProjectFundings(projectId: bigint | undefined) {
	return useReadContract({
		...ecoVaultContract,
		functionName: 'getProjectFundings',
		args: projectId ? [projectId] : undefined,
		query: {
			enabled: !!projectId,
		},
	})
}

// Get user contribution
export function useUserContributionOnChain(projectId: bigint | undefined) {
	const { address } = useAccount()

	return useReadContract({
		...ecoVaultContract,
		functionName: 'getUserContribution',
		args: address && projectId ? [address, projectId] : undefined,
		query: {
			enabled: !!address && !!projectId,
			refetchInterval: 5000, // Refetch every 5 seconds to get latest data
		},
	})
}

// Get project total contributions
export function useProjectTotalContributions(projectId: bigint | undefined) {
	return useReadContract({
		...ecoVaultContract,
		functionName: 'getProjectTotalContributions',
		args: projectId ? [projectId] : undefined,
		query: {
			enabled: !!projectId,
			refetchInterval: 5000, // Refetch every 5 seconds to get latest data
		},
	})
}

// Get minimum funding amount
export function useMinFundingAmount() {
	return useReadContract({
		...ecoVaultContract,
		functionName: 'MIN_FUNDING_AMOUNT',
	})
}

// Get NFT mint threshold
export function useNFTMintThreshold() {
	return useReadContract({
		...ecoVaultContract,
		functionName: 'NFT_MINT_THRESHOLD',
	})
}


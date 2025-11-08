import { useReadContract } from 'wagmi'
import { contractAddresses } from '@/lib/web3-config'

const TREASURY_VAULT_ABI = [
	{
		inputs: [],
		name: 'totalDeposits',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'availableYield',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'projectDeposits',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const

const treasuryVaultContract = {
	address: contractAddresses.treasuryVault as `0x${string}`,
	abi: TREASURY_VAULT_ABI,
} as const

export function useTotalDeposits() {
	return useReadContract({
		...treasuryVaultContract,
		functionName: 'totalDeposits',
		query: {
			refetchInterval: 5000,
		},
	})
}

export function useAvailableYield() {
	return useReadContract({
		...treasuryVaultContract,
		functionName: 'availableYield',
		query: {
			refetchInterval: 5000,
		},
	})
}

export function useProjectDeposits(projectId: bigint | undefined) {
	return useReadContract({
		...treasuryVaultContract,
		functionName: 'projectDeposits',
		args: projectId ? [projectId] : undefined,
		query: {
			enabled: !!projectId && projectId > 0n,
			refetchInterval: 5000, // Refetch every 5 seconds
		},
	})
}


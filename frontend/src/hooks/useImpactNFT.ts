/**
 * Wagmi hooks for ImpactNFT contract interactions
 */

import { useReadContract } from 'wagmi'
import { impactNFTContract } from '@/lib/contracts/abis'
import { useAccount } from 'wagmi'

// Get impact data for a token
export function useImpactData(tokenId: bigint | undefined) {
	return useReadContract({
		...impactNFTContract,
		functionName: 'getImpactData',
		args: tokenId ? [tokenId] : undefined,
		query: {
			enabled: !!tokenId,
		},
	})
}

// Get user NFTs
export function useUserNFTs() {
	const { address } = useAccount()

	return useReadContract({
		...impactNFTContract,
		functionName: 'getUserNFTs',
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	})
}

// Get total supply
export function useNFTTotalSupply() {
	return useReadContract({
		...impactNFTContract,
		functionName: 'totalSupply',
	})
}

// Get token owner
export function useNFTOwner(tokenId: bigint | undefined) {
	return useReadContract({
		...impactNFTContract,
		functionName: 'ownerOf',
		args: tokenId ? [tokenId] : undefined,
		query: {
			enabled: !!tokenId,
		},
	})
}

// Get token URI
export function useTokenURI(tokenId: bigint | undefined) {
	return useReadContract({
		...impactNFTContract,
		functionName: 'tokenURI',
		args: tokenId ? [tokenId] : undefined,
		query: {
			enabled: !!tokenId,
		},
	})
}


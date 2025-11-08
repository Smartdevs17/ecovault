/**
 * Contract addresses and ABIs
 * These are loaded from environment variables or use defaults
 */

import { contractAddresses } from './web3-config'

export const CONTRACT_ADDRESSES = contractAddresses

// Contract ABIs will be imported from typechain-types after compilation
// For now, you can use the contract interfaces from wagmi

export const CONTRACT_CONFIG = {
	projectRegistry: {
		address: CONTRACT_ADDRESSES.projectRegistry,
		abi: [], // Will be populated from typechain-types
	},
	impactNFT: {
		address: CONTRACT_ADDRESSES.impactNFT,
		abi: [], // Will be populated from typechain-types
	},
	ecoVault: {
		address: CONTRACT_ADDRESSES.ecoVault,
		abi: [], // Will be populated from typechain-types
	},
}

// Helper function to get contract address
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES): string {
	return CONTRACT_ADDRESSES[contractName]
}

// Network configuration
export const NETWORK_CONFIG = {
	chainId: import.meta.env.VITE_CHAIN_ID ? Number(import.meta.env.VITE_CHAIN_ID) : 84532,
	networkName: import.meta.env.VITE_NETWORK_NAME || 'baseSepolia',
	rpcUrl: import.meta.env.VITE_RPC_URL || 'https://sepolia.base.org',
	blockExplorer: import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://sepolia.basescan.org',
}


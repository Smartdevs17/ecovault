import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''
// Use multiple RPC endpoints for better reliability
const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://sepolia.base.org'
const altRpcUrl = import.meta.env.VITE_ALT_RPC_URL || 'https://base-sepolia-rpc.publicnode.com'

export const config = createConfig({
	chains: [baseSepolia],
	connectors: [
		metaMask(),
		...(projectId ? [walletConnect({ projectId })] : []),
	],
	transports: {
		[baseSepolia.id]: http(rpcUrl, {
			batch: {
				multicall: {
					batchSize: 1024 * 200,
					wait: 16,
				},
			},
			fetchOptions: {
				timeout: 30000, // 30 second timeout
			},
		}),
	},
})

export const chains = [baseSepolia]

// Supported network for the app - Base Sepolia testnet only
export const SUPPORTED_NETWORK = {
	BASE_SEPOLIA: 84532,
} as const

export const NETWORK_NAME = 'Base Sepolia'

// Contract addresses from environment variables
export const contractAddresses = {
	projectRegistry: import.meta.env.VITE_PROJECT_REGISTRY_ADDRESS || '0x2637DaA81d7bDa9be540D9337642feB313Bc734c',
	impactNFT: import.meta.env.VITE_IMPACT_NFT_ADDRESS || '0x92bfb1fe59eCd73920a3a2c29f61bDD7b43F2519',
	ecoVault: import.meta.env.VITE_ECO_VAULT_ADDRESS || '0xAFdF5236B7564E885F835C9bb3FfA97Ae27bEb6A',
	treasuryVault: import.meta.env.VITE_TREASURY_VAULT_ADDRESS || '0xE604Dbf839c5f69116CFB5303E5f0f604F8562ad',
	octantYieldRouter: import.meta.env.VITE_OCTANT_YIELD_ROUTER_ADDRESS || '0xa94079b654C070EBb1734daF9BAEd81293a97f8F',
}


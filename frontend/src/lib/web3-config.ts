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
	projectRegistry: import.meta.env.VITE_PROJECT_REGISTRY_ADDRESS || '0x01fB5005481DA32adB5A289db24fd08CBA46B07F',
	impactNFT: import.meta.env.VITE_IMPACT_NFT_ADDRESS || '0x188B7587A753Ebd74fF0f5eF093933A041b52A96',
	ecoVault: import.meta.env.VITE_ECO_VAULT_ADDRESS || '0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2',
}


/**
 * Backend Configuration
 * Loads all configuration from environment variables
 */

export const SERVER_CONFIG = {
	port: process.env.PORT ? Number(process.env.PORT) : 5000,
	nodeEnv: process.env.NODE_ENV || 'development',
	apiUrl: process.env.API_URL || 'http://localhost:5000/api',
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export const DATABASE_CONFIG = {
	mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecovault',
}

export const NETWORK_CONFIG = {
	chainId: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 84532,
	networkName: process.env.NETWORK_NAME || 'baseSepolia',
	rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
	blockExplorer: process.env.BLOCK_EXPLORER_URL || 'https://sepolia.basescan.org',
}

export const CONTRACT_ADDRESSES = {
	projectRegistry: process.env.PROJECT_REGISTRY_ADDRESS || '0x01fB5005481DA32adB5A289db24fd08CBA46B07F',
	impactNFT: process.env.IMPACT_NFT_ADDRESS || '0x188B7587A753Ebd74fF0f5eF093933A041b52A96',
	ecoVault: process.env.ECO_VAULT_ADDRESS || '0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2',
}

export const WALLET_CONFIG = {
	privateKey: process.env.PRIVATE_KEY || '',
}


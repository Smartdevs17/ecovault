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
	projectRegistry: process.env.PROJECT_REGISTRY_ADDRESS || '0x2637DaA81d7bDa9be540D9337642feB313Bc734c',
	impactNFT: process.env.IMPACT_NFT_ADDRESS || '0x92bfb1fe59eCd73920a3a2c29f61bDD7b43F2519',
	ecoVault: process.env.ECO_VAULT_ADDRESS || '0xAFdF5236B7564E885F835C9bb3FfA97Ae27bEb6A',
	treasuryVault: process.env.TREASURY_VAULT_ADDRESS || '0xE604Dbf839c5f69116CFB5303E5f0f604F8562ad',
	octantYieldRouter: process.env.OCTANT_YIELD_ROUTER_ADDRESS || '0xa94079b654C070EBb1734daF9BAEd81293a97f8F',
}

export const WALLET_CONFIG = {
	privateKey: process.env.PRIVATE_KEY || '',
}


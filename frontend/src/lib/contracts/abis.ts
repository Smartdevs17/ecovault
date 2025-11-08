/**
 * Contract ABIs for EcoVault Smart Contracts
 * These are extracted from the compiled Hardhat artifacts
 */

import { contractAddresses } from '../web3-config'

// ProjectRegistry ABI
export const PROJECT_REGISTRY_ABI = [
	{
		inputs: [],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'id',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'string',
				name: 'name',
				type: 'string',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'fundingGoal',
				type: 'uint256',
			},
		],
		name: 'ProjectCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'id',
				type: 'uint256',
			},
		],
		name: 'ProjectUpdated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'id',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'verifier',
				type: 'address',
			},
		],
		name: 'ProjectVerified',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: '_name',
				type: 'string',
			},
			{
				internalType: 'string',
				name: '_description',
				type: 'string',
			},
			{
				internalType: 'uint256',
				name: '_fundingGoal',
				type: 'uint256',
			},
		],
		name: 'createProject',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_id',
				type: 'uint256',
			},
		],
		name: 'getProject',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'id',
						type: 'uint256',
					},
					{
						internalType: 'string',
						name: 'name',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'description',
						type: 'string',
					},
					{
						internalType: 'address payable',
						name: 'owner',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'totalFunds',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'fundingGoal',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'isVerified',
						type: 'bool',
					},
					{
						internalType: 'bool',
						name: 'isActive',
						type: 'bool',
					},
					{
						internalType: 'uint256',
						name: 'createdAt',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'updatedAt',
						type: 'uint256',
					},
				],
				internalType: 'struct ProjectRegistry.Project',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'projectCount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'userProjects',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_user',
				type: 'address',
			},
		],
		name: 'getUserProjects',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'verifiers',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const

// EcoVault ABI
export const ECO_VAULT_ABI = [
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_projectId',
				type: 'uint256',
			},
		],
		name: 'fundProject',
		outputs: [],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'projectId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'funder',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'timestamp',
				type: 'uint256',
			},
		],
		name: 'ProjectFunded',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_projectId',
				type: 'uint256',
			},
		],
		name: 'getProjectFundings',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'funder',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'amount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'timestamp',
						type: 'uint256',
					},
				],
				internalType: 'struct EcoVault.Funding[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_user',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_projectId',
				type: 'uint256',
			},
		],
		name: 'getUserContribution',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_projectId',
				type: 'uint256',
			},
		],
		name: 'getProjectTotalContributions',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'MIN_FUNDING_AMOUNT',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'NFT_MINT_THRESHOLD',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const

// ImpactNFT ABI
export const IMPACT_NFT_ABI = [
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_tokenId',
				type: 'uint256',
			},
		],
		name: 'getImpactData',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'projectId',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'contributionAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'carbonReduced',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'timestamp',
						type: 'uint256',
					},
					{
						internalType: 'string',
						name: 'impactType',
						type: 'string',
					},
				],
				internalType: 'struct ImpactNFT.ImpactData',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_user',
				type: 'address',
			},
		],
		name: 'getUserNFTs',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalSupply',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'tokenId',
				type: 'uint256',
			},
		],
		name: 'ownerOf',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'tokenId',
				type: 'uint256',
			},
		],
		name: 'tokenURI',
		outputs: [
			{
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const

// Contract configurations
export const projectRegistryContract = {
	address: contractAddresses.projectRegistry,
	abi: PROJECT_REGISTRY_ABI,
} as const

export const ecoVaultContract = {
	address: contractAddresses.ecoVault,
	abi: ECO_VAULT_ABI,
} as const

export const impactNFTContract = {
	address: contractAddresses.impactNFT,
	abi: IMPACT_NFT_ABI,
} as const


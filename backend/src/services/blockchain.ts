import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/config'

// Contract ABIs (simplified - in production, import from typechain-types)
const PROJECT_REGISTRY_ABI = [
	'function createProject(string memory _name, string memory _description, uint256 _fundingGoal) public returns (uint256)',
	'function getProject(uint256 _id) public view returns (tuple(uint256 id, string name, string description, address owner, uint256 totalFunds, uint256 fundingGoal, bool isVerified, bool isActive, uint256 createdAt, uint256 updatedAt))',
	'function getUserProjects(address _user) public view returns (uint256[])',
	'function projectCount() public view returns (uint256)',
	'function verifyProject(uint256 _id) public',
	'event ProjectCreated(uint256 indexed id, string name, address indexed owner, uint256 fundingGoal)',
	'event ProjectVerified(uint256 indexed id, address indexed verifier)',
]

const ECO_VAULT_ABI = [
	'function fundProject(uint256 _projectId) public payable',
	'function getProjectFundings(uint256 _projectId) public view returns (tuple(address funder, uint256 amount, uint256 timestamp)[])',
	'function getUserContribution(address _user, uint256 _projectId) public view returns (uint256)',
	'function getProjectTotalContributions(uint256 _projectId) public view returns (uint256)',
	'event ProjectFunded(uint256 indexed projectId, address indexed funder, uint256 amount, uint256 timestamp)',
]

let provider: ethers.Provider | null = null
let signer: ethers.Signer | null = null

export function getProvider(): ethers.Provider {
	if (!provider) {
		provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl)
	}
	return provider
}

export function getSigner(): ethers.Signer | null {
	if (!signer && process.env.PRIVATE_KEY) {
		const provider = getProvider()
		// Clean up PRIVATE_KEY - remove any "PRIVATE_KEY=" or "0xPRIVATE_KEY=" prefix
		let privateKey = process.env.PRIVATE_KEY.trim()
		
		// Remove "PRIVATE_KEY=" prefix if present
		if (privateKey.startsWith('PRIVATE_KEY=')) {
			privateKey = privateKey.replace(/^PRIVATE_KEY=/, '')
		}
		
		// Remove "0xPRIVATE_KEY=" prefix if present
		if (privateKey.startsWith('0xPRIVATE_KEY=')) {
			privateKey = privateKey.replace(/^0xPRIVATE_KEY=/, '')
		}
		
		// Ensure it starts with 0x if it's a hex string
		if (privateKey && !privateKey.startsWith('0x')) {
			privateKey = '0x' + privateKey
		}
		
		signer = new ethers.Wallet(privateKey, provider)
	}
	return signer
}

export function getProjectRegistryContract() {
	const provider = getProvider()
	return new ethers.Contract(
		CONTRACT_ADDRESSES.projectRegistry,
		PROJECT_REGISTRY_ABI,
		provider
	)
}

export function getEcoVaultContract() {
	const provider = getProvider()
	return new ethers.Contract(
		CONTRACT_ADDRESSES.ecoVault,
		ECO_VAULT_ABI,
		provider
	)
}

export async function getProjectFromChain(projectId: number) {
	try {
		const contract = getProjectRegistryContract()
		const project = await contract.getProject(projectId)
		return {
			id: Number(project.id),
			name: project.name,
			description: project.description,
			owner: project.owner,
			totalFunds: project.totalFunds.toString(),
			fundingGoal: project.fundingGoal.toString(),
			isVerified: project.isVerified,
			isActive: project.isActive,
		}
	} catch (error) {
		throw error
	}
}

interface Funding {
	funder: string
	amount: bigint
	timestamp: bigint
}

export async function getProjectFundings(projectId: number) {
	try {
		const contract = getEcoVaultContract()
		const fundings = await contract.getProjectFundings(projectId) as Funding[]
		return fundings.map((funding: Funding) => ({
			funder: funding.funder,
			amount: funding.amount.toString(),
			timestamp: Number(funding.timestamp),
		}))
	} catch (error) {
		throw error
	}
}

export async function getUserContribution(userAddress: string, projectId: number) {
	try {
		const contract = getEcoVaultContract()
		const contribution = await contract.getUserContribution(userAddress, projectId)
		return contribution.toString()
	} catch (error) {
		throw error
	}
}

export async function getProjectTotalContributions(projectId: number) {
	try {
		const contract = getEcoVaultContract()
		const totalContributions = await contract.getProjectTotalContributions(projectId)
		return totalContributions.toString()
	} catch (error) {
		throw error
	}
}

export async function getUserProjectsOnChain(userAddress: string) {
	try {
		const contract = getProjectRegistryContract()
		const projectIds = await contract.getUserProjects(userAddress) as bigint[]
		return projectIds.map(id => Number(id))
	} catch (error) {
		throw error
	}
}

export async function findProjectOnChainId(projectName: string, ownerAddress: string): Promise<number | null> {
	try {
		const contract = getProjectRegistryContract()
		const projectIds = await contract.getUserProjects(ownerAddress) as bigint[]
		
		// Search through user's projects to find matching one
		for (const projectId of projectIds) {
			const project = await contract.getProject(projectId)
			if (project.name === projectName && project.owner.toLowerCase() === ownerAddress.toLowerCase()) {
				return Number(projectId)
			}
		}
		
		return null
	} catch (error) {
		return null
	}
}

export async function verifyProjectOnChain(projectId: number) {
	try {
		const signer = getSigner()
		if (!signer) {
			throw new Error('No signer available. PRIVATE_KEY must be set in environment variables.')
		}

		const contract = getProjectRegistryContract()
		const contractWithSigner = contract.connect(signer)
		
		const tx = await contractWithSigner.verifyProject(projectId)
		await tx.wait()
		
		return tx.hash
	} catch (error) {
		throw error
	}
}


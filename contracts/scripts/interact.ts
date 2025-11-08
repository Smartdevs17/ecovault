import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Example interaction script
 * This shows how to interact with deployed contracts
 */
async function main() {
	const [deployer, user1, user2] = await ethers.getSigners();

	// Load deployment addresses
	const deploymentsDir = path.join(__dirname, "../deployments");
	const networkName = (await ethers.provider.getNetwork()).name;
	const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);

	if (!fs.existsSync(deploymentFile)) {
		console.error("Deployment file not found. Please deploy contracts first.");
		process.exit(1);
	}

	const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
	const { projectRegistry, impactNFT, ecoVault } = deployment.deployments;

	console.log("Interacting with contracts...");
	console.log("ProjectRegistry:", projectRegistry);
	console.log("ImpactNFT:", impactNFT);
	console.log("EcoVault:", ecoVault);

	// Get contract instances
	const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
	const ImpactNFT = await ethers.getContractFactory("ImpactNFT");
	const EcoVault = await ethers.getContractFactory("EcoVault");

	const projectRegistryContract = ProjectRegistry.attach(projectRegistry);
	const impactNFTContract = ImpactNFT.attach(impactNFT);
	const ecoVaultContract = EcoVault.attach(ecoVault);

	// Example: Create a project
	console.log("\n1. Creating a project...");
	const createTx = await projectRegistryContract
		.connect(user1)
		.createProject(
			"Community Tree Planting",
			"Planting 10,000 trees in urban areas",
			ethers.parseEther("10")
		);
	await createTx.wait();
	console.log("Project created!");

	// Example: Verify the project
	console.log("\n2. Verifying the project...");
	const verifyTx = await projectRegistryContract.connect(deployer).verifyProject(1);
	await verifyTx.wait();
	console.log("Project verified!");

	// Example: Fund the project
	console.log("\n3. Funding the project...");
	const fundTx = await ecoVaultContract.connect(user2).fundProject(1, {
		value: ethers.parseEther("0.1"),
	});
	await fundTx.wait();
	console.log("Project funded!");

	// Example: Check project details
	console.log("\n4. Checking project details...");
	const project = await projectRegistryContract.getProject(1);
	console.log("Project Name:", project.name);
	console.log("Total Funds:", ethers.formatEther(project.totalFunds), "ETH");
	console.log("Is Verified:", project.isVerified);

	// Example: Check user contribution
	console.log("\n5. Checking user contribution...");
	const contribution = await ecoVaultContract.getUserContribution(user2.address, 1);
	console.log("User Contribution:", ethers.formatEther(contribution), "ETH");

	console.log("\n✅ Interaction complete!");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});


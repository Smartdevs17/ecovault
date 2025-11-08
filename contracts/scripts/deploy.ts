import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);
	console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

	// Deploy ProjectRegistry
	console.log("\n1. Deploying ProjectRegistry...");
	const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
	const projectRegistry = await ProjectRegistry.deploy();
	await projectRegistry.waitForDeployment();
	const projectRegistryAddress = await projectRegistry.getAddress();
	console.log("ProjectRegistry deployed to:", projectRegistryAddress);

	// Deploy ImpactNFT
	console.log("\n2. Deploying ImpactNFT...");
	const ImpactNFT = await ethers.getContractFactory("ImpactNFT");
	const impactNFT = await ImpactNFT.deploy();
	await impactNFT.waitForDeployment();
	const impactNFTAddress = await impactNFT.getAddress();
	console.log("ImpactNFT deployed to:", impactNFTAddress);

	// Deploy EcoVault
	console.log("\n3. Deploying EcoVault...");
	const EcoVault = await ethers.getContractFactory("EcoVault");
	const ecoVault = await EcoVault.deploy(projectRegistryAddress, impactNFTAddress);
	await ecoVault.waitForDeployment();
	const ecoVaultAddress = await ecoVault.getAddress();
	console.log("EcoVault deployed to:", ecoVaultAddress);

	// Authorize EcoVault to mint NFTs
	console.log("\n4. Authorizing EcoVault to mint NFTs...");
	const authorizeTx = await impactNFT.addAuthorizedMinter(ecoVaultAddress);
	await authorizeTx.wait();
	console.log("EcoVault authorized to mint NFTs");

	// Save deployment addresses
	const deploymentInfo = {
		network: (await ethers.provider.getNetwork()).name,
		chainId: (await ethers.provider.getNetwork()).chainId.toString(),
		deployer: deployer.address,
		deployments: {
			projectRegistry: projectRegistryAddress,
			impactNFT: impactNFTAddress,
			ecoVault: ecoVaultAddress,
		},
		timestamp: new Date().toISOString(),
	};

	const deploymentsDir = path.join(__dirname, "../deployments");
	if (!fs.existsSync(deploymentsDir)) {
		fs.mkdirSync(deploymentsDir, { recursive: true });
	}

	const networkName = (await ethers.provider.getNetwork()).name;
	const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
	fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

	console.log("\n✅ Deployment complete!");
	console.log("\nDeployment addresses saved to:", deploymentFile);
	console.log("\nContract Addresses:");
	console.log("  ProjectRegistry:", projectRegistryAddress);
	console.log("  ImpactNFT:", impactNFTAddress);
	console.log("  EcoVault:", ecoVaultAddress);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});


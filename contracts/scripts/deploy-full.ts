import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy all contracts including yield system
 * This script deploys:
 * 1. ProjectRegistry
 * 2. ImpactNFT
 * 3. TreasuryVault
 * 4. SimpleERC4626Vault (testnet)
 * 5. SimpleOctantV2Allocator (testnet)
 * 6. OctantYieldRouter
 * 7. EcoVault (with treasury integration)
 */
async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();

	console.log("Deploying all contracts with the account:", deployer.address);
	console.log("Network:", network.name);
	console.log("Chain ID:", network.chainId.toString());
	console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

	// Step 1: Deploy ProjectRegistry
	console.log("\n1. Deploying ProjectRegistry...");
	const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
	const projectRegistry = await ProjectRegistry.deploy();
	await projectRegistry.waitForDeployment();
	const projectRegistryAddress = await projectRegistry.getAddress();
	console.log("✅ ProjectRegistry deployed to:", projectRegistryAddress);

	// Step 2: Deploy ImpactNFT
	console.log("\n2. Deploying ImpactNFT...");
	const ImpactNFT = await ethers.getContractFactory("ImpactNFT");
	const impactNFT = await ImpactNFT.deploy();
	await impactNFT.waitForDeployment();
	const impactNFTAddress = await impactNFT.getAddress();
	console.log("✅ ImpactNFT deployed to:", impactNFTAddress);

	// Step 3: Deploy TreasuryVault
	console.log("\n3. Deploying TreasuryVault...");
	const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
	const treasuryVault = await TreasuryVault.deploy(projectRegistryAddress);
	await treasuryVault.waitForDeployment();
	const treasuryVaultAddress = await treasuryVault.getAddress();
	console.log("✅ TreasuryVault deployed to:", treasuryVaultAddress);

	// Step 4: Deploy SimpleERC4626Vault (for testnet)
	console.log("\n4. Deploying SimpleERC4626Vault (testnet)...");
	const testnetWETH = "0x4200000000000000000000000000000000000006"; // Base Sepolia WETH
	const SimpleERC4626Vault = await ethers.getContractFactory("SimpleERC4626Vault");
	const simpleVault = await SimpleERC4626Vault.deploy(
		testnetWETH,
		"EcoVault Yield Vault",
		"ECO-VAULT"
	);
	await simpleVault.waitForDeployment();
	const simpleVaultAddress = await simpleVault.getAddress();
	console.log("✅ SimpleERC4626Vault deployed to:", simpleVaultAddress);

	// Step 5: Deploy SimpleOctantV2Allocator (for testnet)
	console.log("\n5. Deploying SimpleOctantV2Allocator (testnet)...");
	const SimpleOctantV2Allocator = await ethers.getContractFactory("SimpleOctantV2Allocator");
	const simpleOctant = await SimpleOctantV2Allocator.deploy(ethers.ZeroAddress); // Native ETH
	await simpleOctant.waitForDeployment();
	const simpleOctantAddress = await simpleOctant.getAddress();
	console.log("✅ SimpleOctantV2Allocator deployed to:", simpleOctantAddress);

	// Step 6: Deploy OctantYieldRouter
	console.log("\n6. Deploying OctantYieldRouter...");
	const OctantYieldRouter = await ethers.getContractFactory("OctantYieldRouter");
	const octantRouter = await OctantYieldRouter.deploy(
		treasuryVaultAddress,
		projectRegistryAddress,
		ethers.ZeroAddress, // Native ETH for testnet
		simpleOctantAddress
	);
	await octantRouter.waitForDeployment();
	const octantRouterAddress = await octantRouter.getAddress();
	console.log("✅ OctantYieldRouter deployed to:", octantRouterAddress);

	// Step 7: Deploy EcoVault (with treasury integration)
	console.log("\n7. Deploying EcoVault (with treasury integration)...");
	const EcoVault = await ethers.getContractFactory("EcoVault");
	const ecoVault = await EcoVault.deploy(
		projectRegistryAddress,
		impactNFTAddress,
		treasuryVaultAddress
	);
	await ecoVault.waitForDeployment();
	const ecoVaultAddress = await ecoVault.getAddress();
	console.log("✅ EcoVault deployed to:", ecoVaultAddress);

	// Step 8: Configure contracts
	console.log("\n8. Configuring contracts...");

	// Authorize EcoVault to mint NFTs
	console.log("  - Authorizing EcoVault to mint NFTs...");
	const authorizeTx = await impactNFT.addAuthorizedMinter(ecoVaultAddress);
	await authorizeTx.wait();
	console.log("  ✅ EcoVault authorized to mint NFTs");

	// Authorize EcoVault to deposit to TreasuryVault
	console.log("  - Authorizing EcoVault to deposit to TreasuryVault...");
	await treasuryVault.addAuthorizedDepositor(ecoVaultAddress);
	console.log("  ✅ EcoVault authorized as depositor");

	// Set yield source in TreasuryVault
	console.log("  - Setting yield source in TreasuryVault...");
	await treasuryVault.setKalaniVault(simpleVaultAddress);
	await treasuryVault.setActiveYieldSource(simpleVaultAddress);
	console.log("  ✅ Yield source set");

	// Authorize OctantYieldRouter to distribute yield
	console.log("  - Authorizing OctantYieldRouter to distribute yield...");
	await treasuryVault.addYieldDistributor(octantRouterAddress);
	console.log("  ✅ OctantYieldRouter authorized as yield distributor");

	// Step 9: Save deployment info
	const deploymentInfo = {
		network: network.name,
		chainId: network.chainId.toString(),
		deployer: deployer.address,
		timestamp: new Date().toISOString(),
		deployments: {
			projectRegistry: projectRegistryAddress,
			impactNFT: impactNFTAddress,
			treasuryVault: treasuryVaultAddress,
			simpleERC4626Vault: simpleVaultAddress,
			simpleOctantV2Allocator: simpleOctantAddress,
			octantYieldRouter: octantRouterAddress,
			ecoVault: ecoVaultAddress,
			weth: ethers.ZeroAddress,
		},
		configuration: {
			isTestnet: network.chainId === 84532n,
			isMainnet: network.chainId === 8453n,
			usesSimpleImplementations: network.chainId === 84532n,
		},
	};

	const deploymentsDir = path.join(__dirname, "../deployments");
	if (!fs.existsSync(deploymentsDir)) {
		fs.mkdirSync(deploymentsDir, { recursive: true });
	}

	const networkName = network.name === "unknown" ? "hardhat" : network.name;
	const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
	fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

	console.log("\n✅ Deployment complete!");
	console.log("\nDeployment addresses saved to:", deploymentFile);
	console.log("\n=== Contract Addresses ===");
	console.log("ProjectRegistry:", projectRegistryAddress);
	console.log("ImpactNFT:", impactNFTAddress);
	console.log("TreasuryVault:", treasuryVaultAddress);
	console.log("SimpleERC4626Vault:", simpleVaultAddress);
	console.log("SimpleOctantV2Allocator:", simpleOctantAddress);
	console.log("OctantYieldRouter:", octantRouterAddress);
	console.log("EcoVault:", ecoVaultAddress);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});


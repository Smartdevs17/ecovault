import { ethers } from "hardhat";

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();

	console.log("Network:", network.name);
	console.log("Chain ID:", network.chainId.toString());
	console.log("\nDeployer Address:", deployer.address);

	const balance = await ethers.provider.getBalance(deployer.address);
	const balanceInEth = ethers.formatEther(balance);

	console.log("Balance:", balanceInEth, "ETH");
	console.log("Balance (Wei):", balance.toString());

	if (balance === 0n) {
		console.log("\n⚠️  WARNING: Your account has 0 ETH!");
		console.log("You need testnet ETH to deploy contracts.");
		
		if (network.chainId === 84532n) {
			console.log("\nGet Base Sepolia ETH from:");
			console.log("  https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
		}
	} else if (ethers.parseEther("0.01") > balance) {
		console.log("\n⚠️  WARNING: Your balance is very low!");
		console.log("You may not have enough ETH to deploy all contracts.");
		console.log("Recommended: At least 0.1 ETH for deployment.");
	} else {
		console.log("\n✅ You have sufficient balance for deployment!");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});


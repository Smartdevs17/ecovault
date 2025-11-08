import hre from 'hardhat'

async function main() {
	const network = await hre.network
	console.log(`\n🔍 Verifying contracts on ${network.name}...`)
	console.log(`Network ID: ${network.config.chainId}`)

	const deployments = require('../deployments/baseSepolia.json')
	const deployAddresses = deployments.deployments
	const testnetWETH = '0x4200000000000000000000000000000000000006'

	const contracts = [
		{
			name: 'ProjectRegistry',
			address: deployAddresses.projectRegistry,
			args: [],
		},
		{
			name: 'ImpactNFT',
			address: deployAddresses.impactNFT,
			args: [],
		},
		{
			name: 'SimpleERC4626Vault',
			address: deployAddresses.simpleERC4626Vault,
			args: [
				testnetWETH,
				'EcoVault Yield Vault',
				'ECO-VAULT',
			],
		},
		{
			name: 'SimpleOctantV2Allocator',
			address: deployAddresses.simpleOctantV2Allocator,
			args: ['0x0000000000000000000000000000000000000000'],
		},
		{
			name: 'TreasuryVault',
			address: deployAddresses.treasuryVault,
			args: [deployAddresses.projectRegistry],
		},
		{
			name: 'OctantYieldRouter',
			address: deployAddresses.octantYieldRouter,
			args: [
				deployAddresses.treasuryVault,
				deployAddresses.projectRegistry,
				'0x0000000000000000000000000000000000000000',
				deployAddresses.simpleOctantV2Allocator,
			],
		},
		{
			name: 'EcoVault',
			address: deployAddresses.ecoVault,
			args: [
				deployAddresses.projectRegistry,
				deployAddresses.impactNFT,
				deployAddresses.treasuryVault,
			],
		},
	]

	console.log(`\n📋 Contracts to verify: ${contracts.length}\n`)

	for (const contract of contracts) {
		try {
			console.log(`\n🔍 Verifying ${contract.name}...`)
			console.log(`   Address: ${contract.address}`)
			console.log(`   Args: ${contract.args.length > 0 ? contract.args.join(', ') : 'None'}`)

			await hre.run('verify:verify', {
				address: contract.address,
				constructorArguments: contract.args,
			})

			console.log(`✅ ${contract.name} verified successfully!`)
			console.log(`   View on Basescan: https://sepolia.basescan.org/address/${contract.address}`)
		} catch (error: any) {
			if (error.message.includes('Already Verified')) {
				console.log(`⚠️  ${contract.name} is already verified`)
			} else {
				console.log(`❌ Failed to verify ${contract.name}:`, error.message)
			}
		}

		await new Promise(resolve => setTimeout(resolve, 2000))
	}

	console.log(`\n✅ Verification process complete!\n`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})


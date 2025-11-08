import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ProjectRegistry, ImpactNFT, EcoVault } from "../typechain-types";

describe("EcoVault", function () {
	let projectRegistry: ProjectRegistry;
	let impactNFT: ImpactNFT;
	let ecoVault: EcoVault;
	let owner: HardhatEthersSigner;
	let user1: HardhatEthersSigner;
	let user2: HardhatEthersSigner;

	const MIN_FUNDING = ethers.parseEther("0.001");
	const NFT_THRESHOLD = ethers.parseEther("0.01");

	beforeEach(async function () {
		[owner, user1, user2] = await ethers.getSigners();

		// Deploy ProjectRegistry
		const ProjectRegistryFactory = await ethers.getContractFactory("ProjectRegistry");
		projectRegistry = await ProjectRegistryFactory.deploy();
		await projectRegistry.waitForDeployment();

		// Deploy ImpactNFT
		const ImpactNFTFactory = await ethers.getContractFactory("ImpactNFT");
		impactNFT = await ImpactNFTFactory.deploy();
		await impactNFT.waitForDeployment();

		// Deploy EcoVault
		const EcoVaultFactory = await ethers.getContractFactory("EcoVault");
		ecoVault = await EcoVaultFactory.deploy(
			await projectRegistry.getAddress(),
			await impactNFT.getAddress()
		);
		await ecoVault.waitForDeployment();

		// Authorize EcoVault to mint NFTs
		await impactNFT.addAuthorizedMinter(await ecoVault.getAddress());
	});

	describe("Project Creation", function () {
		it("Should create a project", async function () {
			const tx = await projectRegistry
				.connect(user1)
				.createProject("Test Project", "Test Description", ethers.parseEther("10"));

			await expect(tx)
				.to.emit(projectRegistry, "ProjectCreated")
				.withArgs(1, "Test Project", user1.address, ethers.parseEther("10"));

			const project = await projectRegistry.getProject(1);
			expect(project.name).to.equal("Test Project");
			expect(project.owner).to.equal(user1.address);
			expect(project.fundingGoal).to.equal(ethers.parseEther("10"));
		});

		it("Should verify a project", async function () {
			await projectRegistry.connect(user1).createProject("Test", "Desc", ethers.parseEther("10"));

			await projectRegistry.connect(owner).verifyProject(1);

			const project = await projectRegistry.getProject(1);
			expect(project.isVerified).to.be.true;
		});
	});

	describe("Project Funding", function () {
		beforeEach(async function () {
			await projectRegistry
				.connect(user1)
				.createProject("Test Project", "Description", ethers.parseEther("10"));
			await projectRegistry.connect(owner).verifyProject(1);
		});

		it("Should fund a verified project", async function () {
			const fundingAmount = ethers.parseEther("0.1");

			await expect(ecoVault.connect(user2).fundProject(1, { value: fundingAmount }))
				.to.emit(ecoVault, "ProjectFunded")
				.withArgs(1, user2.address, fundingAmount, (timestamp: bigint) => timestamp > 0n);

			const contribution = await ecoVault.getUserContribution(user2.address, 1);
			expect(contribution).to.equal(fundingAmount);
		});

		it("Should reject funding below minimum", async function () {
			await expect(
				ecoVault.connect(user2).fundProject(1, { value: ethers.parseEther("0.0001") })
			).to.be.revertedWith("Funding amount too low");
		});

		it("Should reject funding unverified project", async function () {
			await projectRegistry.connect(user1).createProject("Unverified", "Desc", ethers.parseEther("10"));

			await expect(
				ecoVault.connect(user2).fundProject(2, { value: MIN_FUNDING })
			).to.be.revertedWith("Project must be verified before funding");
		});

		it("Should mint NFT for funding above threshold", async function () {
			const fundingAmount = NFT_THRESHOLD;

			await expect(ecoVault.connect(user2).fundProject(1, { value: fundingAmount }))
				.to.emit(ecoVault, "ImpactNFTMintedForFunding");

			const userNFTs = await impactNFT.getUserNFTs(user2.address);
			expect(userNFTs.length).to.equal(1);
		});
	});

	describe("Impact NFT", function () {
		it("Should mint impact NFT", async function () {
			const tokenURI = "https://example.com/nft/1";

			await impactNFT.mintImpactNFT(
				user1.address,
				1,
				ethers.parseEther("1"),
				1000,
				"tree_planting",
				tokenURI
			);

			expect(await impactNFT.balanceOf(user1.address)).to.equal(1);
			expect(await impactNFT.ownerOf(1)).to.equal(user1.address);
		});

		it("Should reject unauthorized minting", async function () {
			await expect(
				impactNFT
					.connect(user1)
					.mintImpactNFT(user1.address, 1, ethers.parseEther("1"), 1000, "test", "uri")
			).to.be.revertedWith("Not authorized to mint");
		});
	});
});


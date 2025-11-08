// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProjectRegistry.sol";
import "./ImpactNFT.sol";

/**
 * @title EcoVault
 * @notice Main contract that manages funding, NFT minting, and project interactions
 */
contract EcoVault is Ownable, ReentrancyGuard {
	ProjectRegistry public projectRegistry;
	ImpactNFT public impactNFT;

	struct Funding {
		address funder;
		uint256 amount;
		uint256 timestamp;
	}

	mapping(uint256 => Funding[]) public projectFundings;
	mapping(address => mapping(uint256 => uint256)) public userProjectContributions; // user => projectId => total contribution
	mapping(uint256 => uint256) public projectTotalContributions; // projectId => total contributions

	uint256 public constant MIN_FUNDING_AMOUNT = 0.001 ether;
	uint256 public constant NFT_MINT_THRESHOLD = 0.01 ether; // Minimum contribution to mint NFT

	event ProjectFunded(
		uint256 indexed projectId,
		address indexed funder,
		uint256 amount,
		uint256 timestamp
	);
	event ImpactNFTMintedForFunding(
		uint256 indexed projectId,
		address indexed recipient,
		uint256 indexed tokenId
	);
	event ProjectRegistryUpdated(address indexed newRegistry);
	event ImpactNFTUpdated(address indexed newImpactNFT);

	modifier validProject(uint256 _projectId) {
		require(_projectId > 0, "Invalid project ID");
		_;
	}

	constructor(address _projectRegistry, address _impactNFT) Ownable(msg.sender) {
		require(_projectRegistry != address(0), "Invalid project registry address");
		require(_impactNFT != address(0), "Invalid impact NFT address");

		projectRegistry = ProjectRegistry(_projectRegistry);
		impactNFT = ImpactNFT(_impactNFT);
	}

	/**
	 * @notice Fund a sustainability project
	 * @param _projectId Project ID to fund
	 */
	function fundProject(uint256 _projectId) public payable nonReentrant validProject(_projectId) {
		require(msg.value >= MIN_FUNDING_AMOUNT, "Funding amount too low");
		require(msg.value > 0, "No ETH sent");

		ProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
		require(project.isActive, "Project is not active");
		require(project.isVerified, "Project must be verified before funding");

		// Record the funding
		projectFundings[_projectId].push(Funding({
			funder: msg.sender,
			amount: msg.value,
			timestamp: block.timestamp
		}));

		// Update contribution tracking
		userProjectContributions[msg.sender][_projectId] += msg.value;
		projectTotalContributions[_projectId] += msg.value;

		// Transfer funds to project owner
		(bool success, ) = project.owner.call{value: msg.value}("");
		require(success, "Transfer failed");

		emit ProjectFunded(_projectId, msg.sender, msg.value, block.timestamp);

		// Mint NFT if contribution threshold is met
		if (msg.value >= NFT_MINT_THRESHOLD) {
			_mintImpactNFTForFunding(_projectId, msg.sender, msg.value);
		}
	}

	/**
	 * @notice Mint an impact NFT for a funding contribution
	 * @param _projectId Project ID
	 * @param _recipient NFT recipient
	 * @param _amount Contribution amount
	 */
	function _mintImpactNFTForFunding(
		uint256 _projectId,
		address _recipient,
		uint256 _amount
	) internal {
		// Calculate carbon impact (simplified: 1 ETH = 1000 kg CO2 reduced)
		uint256 carbonReduced = (_amount * 1000) / 1 ether;

		// Create metadata URI (in production, this would be stored on IPFS)
		string memory tokenURI = string(abi.encodePacked(
			"https://ecovault.io/api/nft/",
			uint2str(_projectId),
			"/",
			uint2str(block.timestamp)
		));

		uint256 tokenId = impactNFT.mintImpactNFT(
			_recipient,
			_projectId,
			_amount,
			carbonReduced,
			"project_funding",
			tokenURI
		);

		emit ImpactNFTMintedForFunding(_projectId, _recipient, tokenId);
	}

	/**
	 * @notice Get all fundings for a project
	 * @param _projectId Project ID
	 */
	function getProjectFundings(uint256 _projectId) public view returns (Funding[] memory) {
		return projectFundings[_projectId];
	}

	/**
	 * @notice Get user's total contribution to a project
	 * @param _user User address
	 * @param _projectId Project ID
	 */
	function getUserContribution(address _user, uint256 _projectId) public view returns (uint256) {
		return userProjectContributions[_user][_projectId];
	}

	/**
	 * @notice Get total contributions to a project
	 * @param _projectId Project ID
	 */
	function getProjectTotalContributions(uint256 _projectId) public view returns (uint256) {
		return projectTotalContributions[_projectId];
	}

	/**
	 * @notice Update project registry address (only owner)
	 * @param _newRegistry New project registry address
	 */
	function updateProjectRegistry(address _newRegistry) public onlyOwner {
		require(_newRegistry != address(0), "Invalid registry address");
		projectRegistry = ProjectRegistry(_newRegistry);
		emit ProjectRegistryUpdated(_newRegistry);
	}

	/**
	 * @notice Update impact NFT address (only owner)
	 * @param _newImpactNFT New impact NFT address
	 */
	function updateImpactNFT(address _newImpactNFT) public onlyOwner {
		require(_newImpactNFT != address(0), "Invalid NFT address");
		impactNFT = ImpactNFT(_newImpactNFT);
		emit ImpactNFTUpdated(_newImpactNFT);
	}

	/**
	 * @notice Utility function to convert uint to string
	 */
	function uint2str(uint256 _i) internal pure returns (string memory) {
		if (_i == 0) {
			return "0";
		}
		uint256 j = _i;
		uint256 len;
		while (j != 0) {
			len++;
			j /= 10;
		}
		bytes memory bstr = new bytes(len);
		uint256 k = len;
		while (_i != 0) {
			k = k - 1;
			uint8 temp = (48 + uint8(_i - _i / 10 * 10));
			bytes1 b1 = bytes1(temp);
			bstr[k] = b1;
			_i /= 10;
		}
		return string(bstr);
	}

	/**
	 * @notice Emergency withdraw function (only owner)
	 */
	function emergencyWithdraw() public onlyOwner {
		payable(owner()).transfer(address(this).balance);
	}
}


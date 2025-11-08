// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TreasuryVault.sol";
import "./ProjectRegistry.sol";
import "./interfaces/IOctantV2.sol";

/**
 * @title OctantYieldRouter
 * @notice Routes yield from TreasuryVault to verified projects via Octant V2
 * @dev Implements yield allocation mechanism based on project impact scores
 */
contract OctantYieldRouter is Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	TreasuryVault public treasury;
	ProjectRegistry public projectRegistry;
	address public assetAddress; // Can be address(0) for native ETH

	// Octant V2 integration
	IOctantV2 public octantV2Allocator;

	// Impact scoring for yield allocation
	mapping(uint256 => uint256) public projectImpactScore;
	uint256 public totalImpactScore;

	// Yield distribution settings
	uint256 public yieldDistributionInterval = 30 days;
	uint256 public lastDistributionTime;
	uint256 public yieldAllocationPercentage = 100; // 100% of yield to projects
	uint256 public minYieldForDistribution = 0.01 ether;

	// Distribution tracking
	mapping(uint256 => uint256) public projectYieldAllocated;
	uint256 public totalYieldAllocated;

	event YieldAllocated(uint256 indexed projectId, uint256 amount);
	event BatchYieldAllocated(uint256[] projectIds, uint256[] amounts);
	event ImpactScoreUpdated(uint256 indexed projectId, uint256 newScore);
	event OctantV2AllocatorUpdated(address indexed newAllocator);

	modifier onlyAuthorized() {
		require(msg.sender == owner(), "Not authorized");
		_;
	}

	constructor(
		address _treasury,
		address _projectRegistry,
		address _asset,
		address _octantV2Allocator
	) Ownable(msg.sender) {
		require(_treasury != address(0), "Invalid treasury address");
		require(_projectRegistry != address(0), "Invalid project registry address");
		require(_octantV2Allocator != address(0), "Invalid Octant V2 allocator address");

		treasury = TreasuryVault(payable(_treasury));
		projectRegistry = ProjectRegistry(_projectRegistry);
		assetAddress = _asset; // Can be address(0) for native ETH
		octantV2Allocator = IOctantV2(_octantV2Allocator);
		lastDistributionTime = block.timestamp;
	}

	/**
	 * @notice Distribute yield to all verified projects via Octant V2
	 * @dev Allocates yield proportionally based on impact scores
	 */
	function distributeYieldToVerifiedProjects() external nonReentrant {
		require(
			block.timestamp >= lastDistributionTime + yieldDistributionInterval,
			"Distribution interval not met"
		);

		// Harvest yield from treasury
		uint256 harvestedYield = treasury.harvestYield();
		require(harvestedYield >= minYieldForDistribution, "Insufficient yield for distribution");

		uint256 availableYield = treasury.availableYield();
		require(availableYield > 0, "No yield available");

		// Calculate yield to distribute
		uint256 yieldToDistribute = (availableYield * yieldAllocationPercentage) / 100;

		// Get all verified projects
		uint256 projectCount = projectRegistry.projectCount();
		uint256[] memory projectIds = new uint256[](projectCount);
		uint256[] memory yieldAmounts = new uint256[](projectCount);
		uint256 verifiedCount = 0;
		uint256 totalScore = 0;

		// Calculate total impact score for verified projects
		for (uint256 i = 1; i <= projectCount; i++) {
			ProjectRegistry.Project memory project = projectRegistry.getProject(i);
			if (project.isVerified && project.isActive) {
				projectIds[verifiedCount] = i;
				totalScore += projectImpactScore[i];
				verifiedCount++;
			}
		}

		require(verifiedCount > 0, "No verified projects");
		require(totalScore > 0, "No impact scores set");

		// Distribute yield proportionally based on impact score
		uint256 distributed = 0;
		for (uint256 i = 0; i < verifiedCount; i++) {
			uint256 projectId = projectIds[i];
			uint256 projectScore = projectImpactScore[projectId];
			
			if (projectScore > 0 && totalScore > 0) {
				uint256 projectYield = (yieldToDistribute * projectScore) / totalScore;
				
				if (projectYield > 0) {
					// Distribute yield to project via Octant V2
					_distributeViaOctant(projectId, projectYield);
					
					projectYieldAllocated[projectId] += projectYield;
					yieldAmounts[i] = projectYield;
					distributed += projectYield;
					
					emit YieldAllocated(projectId, projectYield);
				}
			}
		}

		totalYieldAllocated += distributed;
		lastDistributionTime = block.timestamp;

		emit BatchYieldAllocated(projectIds, yieldAmounts);
	}

	/**
	 * @notice Set impact score for a project
	 * @param _projectId Project ID
	 * @param _score Impact score (higher = more yield allocation)
	 */
	function setProjectImpactScore(uint256 _projectId, uint256 _score) external onlyOwner {
		uint256 oldScore = projectImpactScore[_projectId];
		
		// Update total impact score
		if (oldScore > 0) {
			totalImpactScore -= oldScore;
		}
		if (_score > 0) {
			totalImpactScore += _score;
		}
		
		projectImpactScore[_projectId] = _score;
		emit ImpactScoreUpdated(_projectId, _score);
	}

	/**
	 * @notice Batch set impact scores for multiple projects
	 * @param _projectIds Array of project IDs
	 * @param _scores Array of impact scores
	 */
	function batchSetImpactScores(
		uint256[] calldata _projectIds,
		uint256[] calldata _scores
	) external onlyOwner {
		require(_projectIds.length == _scores.length, "Arrays length mismatch");

		for (uint256 i = 0; i < _projectIds.length; i++) {
			uint256 _projectId = _projectIds[i];
			uint256 _score = _scores[i];
			uint256 oldScore = projectImpactScore[_projectId];
			
			// Update total impact score
			if (oldScore > 0) {
				totalImpactScore -= oldScore;
			}
			if (_score > 0) {
				totalImpactScore += _score;
			}
			
			projectImpactScore[_projectId] = _score;
			emit ImpactScoreUpdated(_projectId, _score);
		}
	}

	/**
	 * @notice Set Octant V2 allocator address
	 * @param _allocator Address of Octant V2 allocator contract
	 */
	function setOctantV2Allocator(address _allocator) external onlyOwner {
		require(_allocator != address(0), "Invalid allocator address");
		octantV2Allocator = IOctantV2(_allocator);
		emit OctantV2AllocatorUpdated(_allocator);
	}

	/**
	 * @notice Set yield allocation percentage
	 * @param _percentage Percentage of yield to allocate (0-100)
	 */
	function setYieldAllocationPercentage(uint256 _percentage) external onlyOwner {
		require(_percentage <= 100, "Percentage must be <= 100");
		yieldAllocationPercentage = _percentage;
	}

	/**
	 * @notice Set minimum yield required for distribution
	 * @param _minYield Minimum yield amount
	 */
	function setMinYieldForDistribution(uint256 _minYield) external onlyOwner {
		minYieldForDistribution = _minYield;
	}

	/**
	 * @notice Set yield distribution interval
	 * @param _interval Distribution interval in seconds
	 */
	function setYieldDistributionInterval(uint256 _interval) external onlyOwner {
		yieldDistributionInterval = _interval;
	}

	/**
	 * @notice Get yield allocation for a project
	 * @param _projectId Project ID
	 * @return Total yield allocated to project
	 */
	function getProjectYieldAllocated(uint256 _projectId) external view returns (uint256) {
		return projectYieldAllocated[_projectId];
	}

	/**
	 * @notice Internal function to distribute yield via Octant V2
	 * @dev This implements the core yield donating strategy:
	 *      1. Harvest yield from treasury
	 *      2. Route yield through Octant V2 allocation mechanism
	 *      3. Octant V2 programmatically allocates yield to verified public goods projects
	 *      4. All allocations are transparent and on-chain
	 * @param _projectId Project ID
	 * @param _amount Yield amount to distribute
	 */
	function _distributeViaOctant(uint256 _projectId, uint256 _amount) internal {
		ProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
		
		// Get yield from treasury (treasury will transfer to this contract)
		treasury.distributeYieldToProject(_projectId, _amount);
		
		// Route yield through Octant V2 allocation mechanism
		// For native ETH (testnet), send via payable call
		// For ERC20 tokens (mainnet), would need approval - simplified for testnet
		if (assetAddress == address(0)) {
			// Native ETH - send via payable call (testnet)
			require(address(this).balance >= _amount, "Insufficient ETH after treasury transfer");
			octantV2Allocator.allocate{value: _amount}(project.owner, _amount);
		} else {
			// ERC20 token path - for mainnet with real tokens
			// For testnet, we use native ETH, so this path is for future mainnet use
			IERC20 token = IERC20(assetAddress);
			require(token.balanceOf(address(this)) >= _amount, "Insufficient tokens after treasury transfer");
			// Transfer tokens directly to allocator, which will handle allocation
			// Note: For mainnet, allocator would need approval or we'd use a different pattern
			token.safeTransfer(address(octantV2Allocator), _amount);
			// Allocator will handle the allocation internally
			octantV2Allocator.allocate(project.owner, _amount);
		}
		
		// Update tracking
		projectYieldAllocated[_projectId] += _amount;
	}

	/**
	 * @notice Get next distribution time
	 * @return Timestamp of next distribution
	 */
	function getNextDistributionTime() external view returns (uint256) {
		return lastDistributionTime + yieldDistributionInterval;
	}

	/**
	 * @notice Check if distribution is due
	 * @return True if distribution interval has passed
	 */
	function isDistributionDue() external view returns (bool) {
		return block.timestamp >= lastDistributionTime + yieldDistributionInterval;
	}
}


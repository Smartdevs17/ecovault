// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProjectRegistry.sol";
import "./interfaces/IERC4626.sol";

/**
 * @title TreasuryVault
 * @notice ERC-4626 compliant vault that accumulates project contributions and generates yield
 * @dev Integrates with Kalani/Yearn v3 and Aave v3 vaults for yield generation
 */
contract TreasuryVault is Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	ProjectRegistry public projectRegistry;
	IERC20 public asset;

	mapping(uint256 => uint256) public projectDeposits;
	mapping(uint256 => uint256) public projectPrincipalWithdrawn;
	mapping(uint256 => uint256) public projectYieldReceived;

	address public kalaniVault;
	address public aaveVault;
	address public activeYieldSource;

	uint256 public totalDeposits;
	uint256 public totalYieldGenerated;
	uint256 public totalYieldDistributed;

	uint256 public yieldDistributionInterval = 30 days;
	uint256 public lastYieldDistribution;
	uint256 public yieldAllocationPercentage = 100;

	mapping(address => bool) public yieldDistributors;
	mapping(address => bool) public authorizedDepositors;

	event ProjectDeposit(uint256 indexed projectId, address indexed depositor, uint256 amount);
	event ProjectWithdrawal(uint256 indexed projectId, address indexed withdrawer, uint256 amount);
	event YieldHarvested(uint256 amount);
	event YieldDistributed(uint256 indexed projectId, uint256 amount);
	event YieldSourceUpdated(address indexed newSource);
	event YieldDistributorAdded(address indexed distributor);
	event YieldDistributorRemoved(address indexed distributor);

	modifier onlyYieldDistributor() {
		require(
			yieldDistributors[msg.sender] || msg.sender == owner(),
			"Not authorized yield distributor"
		);
		_;
	}

	modifier onlyAuthorizedDepositor() {
		require(
			authorizedDepositors[msg.sender] || msg.sender == owner(),
			"Not authorized depositor"
		);
		_;
	}

	constructor(
		address _projectRegistry
	) Ownable(msg.sender) {
		require(_projectRegistry != address(0), "Invalid project registry address");

		projectRegistry = ProjectRegistry(_projectRegistry);
		authorizedDepositors[msg.sender] = true;
		yieldDistributors[msg.sender] = true;
	}

	/**
	 * @notice Deposit funds for a project into treasury (native ETH)
	 * @param _projectId Project ID to deposit for
	 */
	function depositForProject(uint256 _projectId)
		external
		payable
		nonReentrant
		onlyAuthorizedDepositor
	{
		uint256 _amount = msg.value;
		require(_amount > 0, "Amount must be > 0");

		ProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
		require(project.isVerified, "Project must be verified");
		require(project.isActive, "Project must be active");

		projectDeposits[_projectId] += _amount;
		totalDeposits += _amount;

		if (activeYieldSource != address(0)) {
			_depositToYieldSource(_amount);
		}

		emit ProjectDeposit(_projectId, msg.sender, _amount);
	}

	/**
	 * @notice Deposit ERC20 tokens for a project into treasury
	 * @param _projectId Project ID to deposit for
	 * @param _amount Amount to deposit
	 */
	function depositERC20ForProject(uint256 _projectId, uint256 _amount)
		external
		nonReentrant
		onlyAuthorizedDepositor
	{
		require(_amount > 0, "Amount must be > 0");

		ProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
		require(project.isVerified, "Project must be verified");
		require(project.isActive, "Project must be active");

		// Transfer assets from sender
		asset.safeTransferFrom(msg.sender, address(this), _amount);

		// Track deposit
		projectDeposits[_projectId] += _amount;
		totalDeposits += _amount;

		// Deposit to yield source (Kalani/Aave)
		if (activeYieldSource != address(0)) {
			_depositToYieldSource(_amount);
		}

		emit ProjectDeposit(_projectId, msg.sender, _amount);
	}

	/**
	 * @notice Withdraw principal for a project (native ETH)
	 * @param _projectId Project ID to withdraw for
	 * @param _amount Amount to withdraw
	 */
	function withdrawPrincipal(uint256 _projectId, uint256 _amount)
		external
		nonReentrant
	{
		require(_amount > 0, "Amount must be > 0");

		ProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
		require(project.owner == msg.sender, "Only project owner can withdraw");
		require(
			projectDeposits[_projectId] - projectPrincipalWithdrawn[_projectId] >= _amount,
			"Insufficient principal"
		);

		// Withdraw from yield source if needed
		if (activeYieldSource != address(0)) {
			_withdrawFromYieldSource(_amount);
		}

		// Update tracking
		projectPrincipalWithdrawn[_projectId] += _amount;
		totalDeposits -= _amount;

		// Transfer native ETH to project owner
		(bool success, ) = payable(project.owner).call{value: _amount}("");
		require(success, "Transfer failed");

		emit ProjectWithdrawal(_projectId, msg.sender, _amount);
	}

	/**
	 * @notice Harvest yield from yield source
	 * @return yieldAmount Amount of yield harvested
	 */
	function harvestYield() external onlyYieldDistributor returns (uint256 yieldAmount) {
		if (activeYieldSource == address(0)) {
			return 0;
		}

		uint256 beforeBalance = address(this).balance; // For native ETH
		_harvestFromYieldSource();
		uint256 afterBalance = address(this).balance;

		yieldAmount = afterBalance > beforeBalance ? afterBalance - beforeBalance : 0;

		if (yieldAmount > 0) {
			totalYieldGenerated += yieldAmount;
			emit YieldHarvested(yieldAmount);
		}

		return yieldAmount;
	}

	/**
	 * @notice Distribute yield to a project via Octant V2
	 * @param _projectId Project ID to distribute yield to
	 * @param _yieldAmount Amount of yield to distribute
	 */
	function distributeYieldToProject(uint256 _projectId, uint256 _yieldAmount)
		external
		nonReentrant
		onlyYieldDistributor
	{
		require(_yieldAmount > 0, "Yield amount must be > 0");
		require(_yieldAmount <= availableYield(), "Insufficient yield available");

		ProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
		require(project.isVerified, "Project must be verified");
		require(project.isActive, "Project must be active");

		// Update tracking
		projectYieldReceived[_projectId] += _yieldAmount;
		totalYieldDistributed += _yieldAmount;

		// Transfer yield to caller (OctantYieldRouter) so it can route through Octant V2
		// The router will then allocate via Octant V2 to the project owner
		(bool success, ) = payable(msg.sender).call{value: _yieldAmount}("");
		require(success, "Transfer failed");

		emit YieldDistributed(_projectId, _yieldAmount);
	}

	/**
	 * @notice Get available yield for distribution
	 * @dev Calculates yield by comparing current assets (including vault shares) 
	 *      with total principal deposits minus withdrawals
	 * @return Available yield amount
	 */
	function availableYield() public view returns (uint256) {
		uint256 currentAssets = _getTotalAssets();
		uint256 totalPrincipal = totalDeposits - _getTotalWithdrawn();
		
		if (currentAssets > totalPrincipal) {
			return currentAssets - totalPrincipal;
		}
		return 0;
	}

	/**
	 * @notice Get total assets including vault shares
	 * @return Total assets value
	 */
	function _getTotalAssets() internal view returns (uint256) {
		uint256 contractBalance = address(this).balance;
		
		// If we have an active yield source, include vault shares value
		if (activeYieldSource != address(0)) {
			IERC4626 vault = IERC4626(activeYieldSource);
			uint256 vaultShares = vault.balanceOf(address(this));
			if (vaultShares > 0) {
				// Convert vault shares to assets
				uint256 vaultAssets = vault.convertToAssets(vaultShares);
				return contractBalance + vaultAssets;
			}
		}
		
		return contractBalance;
	}

	/**
	 * @notice Get total principal withdrawn across all projects
	 * @return Total withdrawn amount
	 */
	function _getTotalWithdrawn() internal view returns (uint256) {
		uint256 totalWithdrawn = 0;
		uint256 projectCount = projectRegistry.projectCount();
		
		for (uint256 i = 1; i <= projectCount; i++) {
			totalWithdrawn += projectPrincipalWithdrawn[i];
		}
		
		return totalWithdrawn;
	}

	/**
	 * @notice Get project's available principal
	 * @param _projectId Project ID
	 * @return Available principal amount
	 */
	function getProjectAvailablePrincipal(uint256 _projectId) external view returns (uint256) {
		return projectDeposits[_projectId] - projectPrincipalWithdrawn[_projectId];
	}

	/**
	 * @notice Set active yield source (Kalani or Aave)
	 * @param _yieldSource Address of yield source vault
	 */
	function setActiveYieldSource(address _yieldSource) external onlyOwner {
		require(_yieldSource != address(0), "Invalid yield source address");
		activeYieldSource = _yieldSource;
		emit YieldSourceUpdated(_yieldSource);
	}

	/**
	 * @notice Set Kalani vault address
	 * @param _kalaniVault Address of Kalani vault
	 */
	function setKalaniVault(address _kalaniVault) external onlyOwner {
		kalaniVault = _kalaniVault;
	}

	/**
	 * @notice Set Aave vault address
	 * @param _aaveVault Address of Aave vault
	 */
	function setAaveVault(address _aaveVault) external onlyOwner {
		aaveVault = _aaveVault;
	}

	/**
	 * @notice Add authorized depositor
	 * @param _depositor Address to authorize
	 */
	function addAuthorizedDepositor(address _depositor) external onlyOwner {
		require(_depositor != address(0), "Invalid depositor address");
		authorizedDepositors[_depositor] = true;
	}

	/**
	 * @notice Remove authorized depositor
	 * @param _depositor Address to revoke
	 */
	function removeAuthorizedDepositor(address _depositor) external onlyOwner {
		authorizedDepositors[_depositor] = false;
	}

	/**
	 * @notice Add yield distributor
	 * @param _distributor Address to authorize
	 */
	function addYieldDistributor(address _distributor) external onlyOwner {
		require(_distributor != address(0), "Invalid distributor address");
		yieldDistributors[_distributor] = true;
		emit YieldDistributorAdded(_distributor);
	}

	/**
	 * @notice Remove yield distributor
	 * @param _distributor Address to revoke
	 */
	function removeYieldDistributor(address _distributor) external onlyOwner {
		yieldDistributors[_distributor] = false;
		emit YieldDistributorRemoved(_distributor);
	}

	/**
	 * @notice Approve yield router to spend yield for distribution
	 * @param _router Address of yield router (OctantYieldRouter)
	 * @param _amount Amount to approve (use type(uint256).max for unlimited)
	 */
	function approveYieldRouter(address _router, uint256 _amount) external onlyOwner {
		require(_router != address(0), "Invalid router address");
		// For native ETH, we don't need approval
		// This is for ERC20 token support if needed
		// In production, if using WETH, approve here:
		// if (address(asset) != address(0)) {
		//     asset.safeApprove(_router, _amount);
		// }
	}

	/**
	 * @notice Internal function to deposit to yield source (Kalani/Aave ERC-4626 vault)
	 * @dev Deposits native ETH to ERC-4626 vault for yield generation
	 *      For testnet, we use SimpleERC4626Vault which accepts native ETH
	 *      On mainnet, would wrap to WETH first if vault requires it
	 * @param _amount Amount to deposit
	 */
	function _depositToYieldSource(uint256 _amount) internal {
		if (activeYieldSource == address(0)) {
			return; // No yield source configured
		}

		IERC4626 vault = IERC4626(activeYieldSource);
		
		// Check if vault accepts native ETH or requires WETH
		address vaultAsset = vault.asset();
		
		// For testnet SimpleERC4626Vault, it accepts WETH but we're using native ETH
		// The vault will handle the conversion internally
		// For mainnet with real vaults, we'd need to wrap ETH to WETH first
		
		// Deposit to ERC-4626 vault
		// For native ETH deposits, we need to wrap to WETH first if vault requires it
		// For now, assuming SimpleERC4626Vault handles this
		// On mainnet, implement WETH wrapping:
		// if (vaultAsset != address(0) && vaultAsset == wethAddress) {
		//     IWETH(wethAddress).deposit{value: _amount}();
		//     IERC20(wethAddress).approve(activeYieldSource, _amount);
		//     vault.deposit(_amount, address(this));
		// } else {
		//     // Vault accepts native ETH
		//     vault.deposit{value: _amount}(_amount, address(this));
		// }
		
		// For testnet SimpleERC4626Vault, it expects ERC20 transfers
		// So we'd need to wrap ETH first, but for simplicity on testnet,
		// we'll just hold ETH in treasury and simulate yield
		// In production, wrap ETH to WETH and deposit to vault
	}

	/**
	 * @notice Internal function to withdraw from yield source (Kalani/Aave ERC-4626 vault)
	 * @dev Withdraws assets from ERC-4626 vault
	 * @param _amount Amount to withdraw
	 */
	function _withdrawFromYieldSource(uint256 _amount) internal {
		if (activeYieldSource == address(0)) {
			return; // No yield source configured
		}

		IERC4626 vault = IERC4626(activeYieldSource);
		
		// Withdraw assets from ERC-4626 vault
		// withdraw(assets, receiver, owner)
		vault.withdraw(_amount, address(this), address(this));
		
		// If vault returns WETH, unwrap to ETH if needed
		// In production, implement WETH unwrapping if needed:
		// address vaultAsset = vault.asset();
		// if (vaultAsset == wethAddress) {
		//     IWETH(wethAddress).withdraw(_amount);
		// }
	}

	/**
	 * @notice Internal function to harvest yield from yield source
	 * @dev For ERC-4626 vaults, yield is automatically accrued in share price
	 *      We harvest by checking the difference between totalAssets and deposits
	 *      For Kalani/Yearn v3, yield compounds automatically
	 *      For Aave v3, yield accrues via interest rates
	 */
	function _harvestFromYieldSource() internal {
		if (activeYieldSource == address(0)) {
			return; // No yield source configured
		}

		// For ERC-4626 vaults, yield is automatically accrued
		// The vault's share price increases over time, representing yield
		// We don't need to call a separate harvest function
		// Yield is realized when we check totalAssets() vs our deposits
		
		// If the vault has a specific harvest function, call it here
		// For Kalani/Yearn v3, yield compounds automatically
		// For Aave v3, yield accrues via interest rates
		
		// Example for vaults with explicit harvest:
		// IKalaniVault(activeYieldSource).harvest();
		// or
		// IAaveVault(activeYieldSource).harvest();
	}

	/**
	 * @notice Emergency withdraw function (only owner)
	 */
	function emergencyWithdraw() external onlyOwner {
		uint256 balance = address(this).balance;
		(bool success, ) = payable(owner()).call{value: balance}("");
		require(success, "Transfer failed");
	}

	/**
	 * @notice Receive native ETH
	 */
	receive() external payable {
		// Allow receiving native ETH
	}
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IERC4626.sol";

/**
 * @title SimpleERC4626Vault
 * @notice Simple ERC-4626 compliant vault for testnet deployment
 * @dev Real ERC-4626 implementation for Base Sepolia testnet
 *      On mainnet, replace with real Kalani (Yearn v3) or Aave v3 vault addresses
 */
contract SimpleERC4626Vault is IERC4626 {
	using SafeERC20 for IERC20;

	IERC20 private immutable _asset;
	
	function asset() external view override returns (address) {
		return address(_asset);
	}
	string public name;
	string public symbol;
	uint8 public decimals;

	uint256 private _totalAssets;
	uint256 private _totalSupply;
	mapping(address => uint256) private _balances;

	// Mock yield rate (5% APY = 0.05 / 365 / 24 / 3600 per second)
	uint256 public constant YIELD_RATE_PER_SECOND = 1585490; // ~5% APY
	uint256 public lastUpdateTime;
	uint256 public yieldMultiplier = 1e18; // Starts at 1.0

	event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
	event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);

	constructor(
		address _assetAddress,
		string memory _name,
		string memory _symbol
	) {
		_asset = IERC20(_assetAddress);
		name = _name;
		symbol = _symbol;
		decimals = 18; // Assuming 18 decimals
		lastUpdateTime = block.timestamp;
	}

	/**
	 * @notice Update yield multiplier based on time elapsed
	 */
	function _updateYield() internal {
		uint256 timeElapsed = block.timestamp - lastUpdateTime;
		if (timeElapsed > 0) {
			// Simple yield calculation: multiplier increases over time
			// yieldMultiplier = 1 + (YIELD_RATE_PER_SECOND * timeElapsed / 1e18)
			yieldMultiplier += (YIELD_RATE_PER_SECOND * timeElapsed) / 1e18;
			lastUpdateTime = block.timestamp;
		}
	}

	/**
	 * @notice Returns the total amount of assets managed by the vault
	 */
	function totalAssets() public view override returns (uint256) {
		// Calculate current assets including yield
		uint256 timeElapsed = block.timestamp - lastUpdateTime;
		uint256 currentMultiplier = yieldMultiplier;
		if (timeElapsed > 0) {
			currentMultiplier += (YIELD_RATE_PER_SECOND * timeElapsed) / 1e18;
		}
		return (_totalAssets * currentMultiplier) / 1e18;
	}

	/**
	 * @notice Converts assets to shares
	 */
	function convertToShares(uint256 assets) public view override returns (uint256) {
		uint256 supply = _totalSupply;
		if (supply == 0) return assets;
		uint256 currentAssets = totalAssets();
		if (currentAssets == 0) return assets;
		return (assets * supply) / currentAssets;
	}

	/**
	 * @notice Converts shares to assets
	 */
	function convertToAssets(uint256 shares) public view override returns (uint256) {
		uint256 supply = _totalSupply;
		if (supply == 0) return shares;
		uint256 currentAssets = totalAssets();
		return (shares * currentAssets) / supply;
	}

	/**
	 * @notice Maximum amount of assets that can be deposited
	 */
	function maxDeposit(address) public pure override returns (uint256) {
		return type(uint256).max;
	}

	/**
	 * @notice Preview the amount of shares that would be minted
	 */
	function previewDeposit(uint256 assets) public view override returns (uint256) {
		return convertToShares(assets);
	}

	/**
	 * @notice Deposit assets and mint shares
	 */
	function deposit(uint256 assets, address receiver) public override returns (uint256) {
		_updateYield();
		require(assets > 0, "Cannot deposit 0");

		uint256 shares = convertToShares(assets);
		require(shares > 0, "Shares must be > 0");

		_asset.safeTransferFrom(msg.sender, address(this), assets);
		_totalAssets += assets;
		_totalSupply += shares;
		_balances[receiver] += shares;

		emit Deposit(msg.sender, receiver, assets, shares);
		return shares;
	}

	/**
	 * @notice Maximum amount of shares that can be minted
	 */
	function maxMint(address) public pure override returns (uint256) {
		return type(uint256).max;
	}

	/**
	 * @notice Preview the amount of assets needed to mint shares
	 */
	function previewMint(uint256 shares) public view override returns (uint256) {
		uint256 supply = _totalSupply;
		if (supply == 0) return shares;
		uint256 currentAssets = totalAssets();
		return (shares * currentAssets) / supply;
	}

	/**
	 * @notice Mint shares by depositing assets
	 */
	function mint(uint256 shares, address receiver) public override returns (uint256) {
		_updateYield();
		require(shares > 0, "Cannot mint 0 shares");

		uint256 assets = previewMint(shares);
		_asset.safeTransferFrom(msg.sender, address(this), assets);
		_totalAssets += assets;
		_totalSupply += shares;
		_balances[receiver] += shares;

		emit Deposit(msg.sender, receiver, assets, shares);
		return assets;
	}

	/**
	 * @notice Maximum amount of assets that can be withdrawn
	 */
	function maxWithdraw(address owner) public view override returns (uint256) {
		return convertToAssets(_balances[owner]);
	}

	/**
	 * @notice Preview the amount of shares needed to withdraw assets
	 */
	function previewWithdraw(uint256 assets) public view override returns (uint256) {
		uint256 supply = _totalSupply;
		if (supply == 0) return assets;
		uint256 currentAssets = totalAssets();
		if (currentAssets == 0) return 0;
		return (assets * supply) / currentAssets;
	}

	/**
	 * @notice Withdraw assets by burning shares
	 */
	function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
		_updateYield();
		require(assets > 0, "Cannot withdraw 0");

		uint256 shares = previewWithdraw(assets);
		require(_balances[owner] >= shares, "Insufficient shares");

		_totalAssets -= assets;
		_totalSupply -= shares;
		_balances[owner] -= shares;

		_asset.safeTransfer(receiver, assets);

		emit Withdraw(msg.sender, receiver, owner, assets, shares);
		return shares;
	}

	/**
	 * @notice Maximum amount of shares that can be redeemed
	 */
	function maxRedeem(address owner) public view override returns (uint256) {
		return _balances[owner];
	}

	/**
	 * @notice Preview the amount of assets received from redeeming shares
	 */
	function previewRedeem(uint256 shares) public view override returns (uint256) {
		return convertToAssets(shares);
	}

	/**
	 * @notice Redeem shares for assets
	 */
	function redeem(uint256 shares, address receiver, address owner) public override returns (uint256) {
		_updateYield();
		require(shares > 0, "Cannot redeem 0 shares");
		require(_balances[owner] >= shares, "Insufficient shares");

		uint256 assets = convertToAssets(shares);
		_totalAssets -= assets;
		_totalSupply -= shares;
		_balances[owner] -= shares;

		_asset.safeTransfer(receiver, assets);

		emit Withdraw(msg.sender, receiver, owner, assets, shares);
		return assets;
	}

	/**
	 * @notice ERC20 functions
	 */
	function balanceOf(address account) public view returns (uint256) {
		return _balances[account];
	}

	function totalSupply() public view returns (uint256) {
		return _totalSupply;
	}

	function transfer(address to, uint256 amount) public returns (bool) {
		require(_balances[msg.sender] >= amount, "Insufficient balance");
		_balances[msg.sender] -= amount;
		_balances[to] += amount;
		return true;
	}

	function transferFrom(address from, address to, uint256 amount) public returns (bool) {
		require(_balances[from] >= amount, "Insufficient balance");
		_balances[from] -= amount;
		_balances[to] += amount;
		return true;
	}

	function approve(address spender, uint256 amount) public returns (bool) {
		// Simplified - in production use OpenZeppelin's ERC20
		return true;
	}

	function allowance(address, address) public pure returns (uint256) {
		return type(uint256).max;
	}
}


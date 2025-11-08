// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IERC4626
 * @notice Interface for ERC-4626 Tokenized Vault Standard
 * @dev Based on EIP-4626: https://eips.ethereum.org/EIPS/eip-4626
 *      Used for Kalani (Yearn v3) and Aave v3 vault integration
 */
interface IERC4626 is IERC20 {
	/**
	 * @notice Returns the address of the underlying asset used by the vault
	 * @return The address of the underlying asset
	 */
	function asset() external view returns (address);

	/**
	 * @notice Returns the total amount of underlying assets managed by the vault
	 * @return The total amount of assets
	 */
	function totalAssets() external view returns (uint256);

	/**
	 * @notice Converts assets to shares
	 * @param assets Amount of assets
	 * @return Amount of shares
	 */
	function convertToShares(uint256 assets) external view returns (uint256);

	/**
	 * @notice Converts shares to assets
	 * @param shares Amount of shares
	 * @return Amount of assets
	 */
	function convertToAssets(uint256 shares) external view returns (uint256);

	/**
	 * @notice Maximum amount of underlying assets that can be deposited
	 * @param receiver Address that will receive the shares
	 * @return Maximum deposit amount
	 */
	function maxDeposit(address receiver) external view returns (uint256);

	/**
	 * @notice Preview the amount of shares that would be minted for a deposit
	 * @param assets Amount of assets to deposit
	 * @return Amount of shares that would be minted
	 */
	function previewDeposit(uint256 assets) external view returns (uint256);

	/**
	 * @notice Deposit assets and mint shares
	 * @param assets Amount of assets to deposit
	 * @param receiver Address that will receive the shares
	 * @return Amount of shares minted
	 */
	function deposit(uint256 assets, address receiver) external returns (uint256);

	/**
	 * @notice Maximum amount of shares that can be minted
	 * @param receiver Address that will receive the shares
	 * @return Maximum mint amount
	 */
	function maxMint(address receiver) external view returns (uint256);

	/**
	 * @notice Preview the amount of assets needed to mint shares
	 * @param shares Amount of shares to mint
	 * @return Amount of assets needed
	 */
	function previewMint(uint256 shares) external view returns (uint256);

	/**
	 * @notice Mint shares by depositing assets
	 * @param shares Amount of shares to mint
	 * @param receiver Address that will receive the shares
	 * @return Amount of assets deposited
	 */
	function mint(uint256 shares, address receiver) external returns (uint256);

	/**
	 * @notice Maximum amount of underlying assets that can be withdrawn
	 * @param owner Address that owns the shares
	 * @return Maximum withdraw amount
	 */
	function maxWithdraw(address owner) external view returns (uint256);

	/**
	 * @notice Preview the amount of shares needed to withdraw assets
	 * @param assets Amount of assets to withdraw
	 * @return Amount of shares needed
	 */
	function previewWithdraw(uint256 assets) external view returns (uint256);

	/**
	 * @notice Withdraw assets by burning shares
	 * @param assets Amount of assets to withdraw
	 * @param receiver Address that will receive the assets
	 * @param owner Address that owns the shares
	 * @return Amount of shares burned
	 */
	function withdraw(uint256 assets, address receiver, address owner) external returns (uint256);

	/**
	 * @notice Maximum amount of shares that can be redeemed
	 * @param owner Address that owns the shares
	 * @return Maximum redeem amount
	 */
	function maxRedeem(address owner) external view returns (uint256);

	/**
	 * @notice Preview the amount of assets received from redeeming shares
	 * @param shares Amount of shares to redeem
	 * @return Amount of assets received
	 */
	function previewRedeem(uint256 shares) external view returns (uint256);

	/**
	 * @notice Redeem shares for assets
	 * @param shares Amount of shares to redeem
	 * @param receiver Address that will receive the assets
	 * @param owner Address that owns the shares
	 * @return Amount of assets received
	 */
	function redeem(uint256 shares, address receiver, address owner) external returns (uint256);
}


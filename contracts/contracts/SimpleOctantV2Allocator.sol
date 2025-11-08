// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IOctantV2.sol";

/**
 * @title SimpleOctantV2Allocator
 * @notice Simple Octant V2 allocator for testnet deployment
 * @dev Real Octant V2 allocation implementation for Base Sepolia testnet
 *      On mainnet, replace with real Octant V2 allocator contract address
 */
contract SimpleOctantV2Allocator is IOctantV2 {
	using SafeERC20 for IERC20;

	IERC20 public asset; // Can be address(0) for native ETH

	mapping(address => uint256) public allocatedAmounts;
	uint256 public totalAllocated;
	uint256 public availableYield;

	event YieldAllocated(address indexed recipient, uint256 amount);
	event YieldDeposited(uint256 amount);

	constructor(address _asset) {
		// _asset can be address(0) for native ETH
		// For native ETH, asset will remain address(0)
		if (_asset != address(0)) {
			asset = IERC20(_asset);
		}
		// If _asset is address(0), asset remains uninitialized (address(0))
	}

	/**
	 * @notice Deposit yield to the allocator (for testing)
	 * @param amount Amount of yield to deposit
	 */
	function depositYield(uint256 amount) external payable {
		if (msg.value > 0) {
			require(msg.value == amount, "Amount mismatch");
			availableYield += msg.value;
		} else if (address(asset) != address(0)) {
			asset.safeTransferFrom(msg.sender, address(this), amount);
			availableYield += amount;
		} else {
			revert("No asset specified");
		}
		emit YieldDeposited(amount);
	}

	/**
	 * @notice Allocate yield to a recipient address
	 * @param recipient Address to receive the yield allocation
	 * @param amount Amount of yield to allocate
	 */
	function allocate(address recipient, uint256 amount) external payable override {
		require(recipient != address(0), "Invalid recipient");
		require(amount > 0, "Amount must be > 0");
		
		// Handle native ETH if sent
		if (msg.value > 0) {
			require(msg.value == amount, "Amount mismatch");
			availableYield += msg.value;
		} else {
			require(availableYield >= amount, "Insufficient yield available");
			availableYield -= amount;
		}
		
		allocatedAmounts[recipient] += amount;
		totalAllocated += amount;

		// Transfer yield to recipient
		if (address(asset) == address(0) || msg.value > 0) {
			// Native ETH
			uint256 transferAmount = msg.value > 0 ? msg.value : amount;
			(bool success, ) = payable(recipient).call{value: transferAmount}("");
			require(success, "ETH transfer failed");
		} else {
			// ERC20 token
			asset.safeTransfer(recipient, amount);
		}

		emit YieldAllocated(recipient, amount);
	}

	/**
	 * @notice Batch allocate yield to multiple recipients
	 * @param recipients Array of recipient addresses
	 * @param amounts Array of amounts to allocate
	 */
	function batchAllocate(address[] calldata recipients, uint256[] calldata amounts) external override {
		require(recipients.length == amounts.length, "Arrays length mismatch");

		uint256 totalAmount = 0;
		for (uint256 i = 0; i < amounts.length; i++) {
			totalAmount += amounts[i];
		}

		require(availableYield >= totalAmount, "Insufficient yield available");

		for (uint256 i = 0; i < recipients.length; i++) {
			require(recipients[i] != address(0), "Invalid recipient");
			require(amounts[i] > 0, "Amount must be > 0");

			availableYield -= amounts[i];
			allocatedAmounts[recipients[i]] += amounts[i];
			totalAllocated += amounts[i];

			if (address(asset) == address(0)) {
				// Native ETH
				(bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
				require(success, "ETH transfer failed");
			} else {
				// ERC20 token
				asset.safeTransfer(recipients[i], amounts[i]);
			}
			emit YieldAllocated(recipients[i], amounts[i]);
		}
	}

	/**
	 * @notice Get total allocated amount for a recipient
	 * @param recipient Address to check
	 * @return Total allocated amount
	 */
	function getAllocatedAmount(address recipient) external view override returns (uint256) {
		return allocatedAmounts[recipient];
	}

	/**
	 * @notice Get total yield available for allocation
	 * @return Available yield amount
	 */
	function getAvailableYield() external view override returns (uint256) {
		return availableYield;
	}
}


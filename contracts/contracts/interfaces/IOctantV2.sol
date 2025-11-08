// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOctantV2
 * @notice Interface for Octant V2 allocation mechanism
 * @dev Based on Octant V2 documentation: https://docs.v2.octant.build/
 */
interface IOctantV2 {
	/**
	 * @notice Allocate yield to a recipient address
	 * @param recipient Address to receive the yield allocation
	 * @param amount Amount of yield to allocate
	 */
	function allocate(address recipient, uint256 amount) external payable;

	/**
	 * @notice Batch allocate yield to multiple recipients
	 * @param recipients Array of recipient addresses
	 * @param amounts Array of amounts to allocate (must match recipients length)
	 */
	function batchAllocate(address[] calldata recipients, uint256[] calldata amounts) external;

	/**
	 * @notice Get total allocated amount for a recipient
	 * @param recipient Address to check
	 * @return Total allocated amount
	 */
	function getAllocatedAmount(address recipient) external view returns (uint256);

	/**
	 * @notice Get total yield available for allocation
	 * @return Available yield amount
	 */
	function getAvailableYield() external view returns (uint256);
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProjectRegistry
 * @notice Registry for sustainability projects with verification system
 */
contract ProjectRegistry is Ownable, ReentrancyGuard {
	struct Project {
		uint256 id;
		string name;
		string description;
		address payable owner;
		uint256 totalFunds;
		uint256 fundingGoal;
		bool isVerified;
		bool isActive;
		uint256 createdAt;
		uint256 updatedAt;
	}

	uint256 public projectCount;
	mapping(uint256 => Project) public projects;
	mapping(address => uint256[]) public userProjects;
	mapping(address => bool) public verifiers;

	event ProjectCreated(
		uint256 indexed id,
		string name,
		address indexed owner,
		uint256 fundingGoal
	);
	event ProjectVerified(uint256 indexed id, address indexed verifier);
	event ProjectUpdated(uint256 indexed id);
	event VerifierAdded(address indexed verifier);
	event VerifierRemoved(address indexed verifier);

	modifier onlyVerifier() {
		require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
		_;
	}

	modifier validProject(uint256 _id) {
		require(_id > 0 && _id <= projectCount, "Invalid project ID");
		require(projects[_id].isActive, "Project is not active");
		_;
	}

	constructor() Ownable(msg.sender) {
		verifiers[msg.sender] = true;
	}

	/**
	 * @notice Create a new sustainability project
	 * @param _name Project name
	 * @param _description Project description
	 * @param _fundingGoal Funding goal in wei
	 */
	function createProject(
		string memory _name,
		string memory _description,
		uint256 _fundingGoal
	) public returns (uint256) {
		require(bytes(_name).length > 0, "Name cannot be empty");
		require(bytes(_description).length > 0, "Description cannot be empty");
		require(_fundingGoal > 0, "Funding goal must be greater than 0");

		projectCount++;
		uint256 newProjectId = projectCount;

		projects[newProjectId] = Project({
			id: newProjectId,
			name: _name,
			description: _description,
			owner: payable(msg.sender),
			totalFunds: 0,
			fundingGoal: _fundingGoal,
			isVerified: false,
			isActive: true,
			createdAt: block.timestamp,
			updatedAt: block.timestamp
		});

		userProjects[msg.sender].push(newProjectId);

		emit ProjectCreated(newProjectId, _name, msg.sender, _fundingGoal);

		return newProjectId;
	}

	/**
	 * @notice Update project details (only owner)
	 * @param _id Project ID
	 * @param _name New project name
	 * @param _description New project description
	 */
	function updateProject(
		uint256 _id,
		string memory _name,
		string memory _description
	) public validProject(_id) {
		require(projects[_id].owner == msg.sender, "Only project owner can update");
		require(bytes(_name).length > 0, "Name cannot be empty");
		require(bytes(_description).length > 0, "Description cannot be empty");

		projects[_id].name = _name;
		projects[_id].description = _description;
		projects[_id].updatedAt = block.timestamp;

		emit ProjectUpdated(_id);
	}

	/**
	 * @notice Verify a project (only verifiers)
	 * @param _id Project ID
	 */
	function verifyProject(uint256 _id) public onlyVerifier validProject(_id) {
		require(!projects[_id].isVerified, "Project already verified");

		projects[_id].isVerified = true;
		projects[_id].updatedAt = block.timestamp;

		emit ProjectVerified(_id, msg.sender);
	}

	/**
	 * @notice Deactivate a project (only owner)
	 * @param _id Project ID
	 */
	function deactivateProject(uint256 _id) public validProject(_id) {
		require(projects[_id].owner == msg.sender, "Only project owner can deactivate");

		projects[_id].isActive = false;
		projects[_id].updatedAt = block.timestamp;

		emit ProjectUpdated(_id);
	}

	/**
	 * @notice Get project details
	 * @param _id Project ID
	 */
	function getProject(uint256 _id) public view returns (Project memory) {
		require(_id > 0 && _id <= projectCount, "Invalid project ID");
		return projects[_id];
	}

	/**
	 * @notice Get all projects created by a user
	 * @param _user User address
	 */
	function getUserProjects(address _user) public view returns (uint256[] memory) {
		return userProjects[_user];
	}

	/**
	 * @notice Add a verifier (only owner)
	 * @param _verifier Verifier address
	 */
	function addVerifier(address _verifier) public onlyOwner {
		require(_verifier != address(0), "Invalid verifier address");
		require(!verifiers[_verifier], "Already a verifier");

		verifiers[_verifier] = true;
		emit VerifierAdded(_verifier);
	}

	/**
	 * @notice Remove a verifier (only owner)
	 * @param _verifier Verifier address
	 */
	function removeVerifier(address _verifier) public onlyOwner {
		require(verifiers[_verifier], "Not a verifier");
		require(_verifier != owner(), "Cannot remove owner as verifier");

		verifiers[_verifier] = false;
		emit VerifierRemoved(_verifier);
	}
}


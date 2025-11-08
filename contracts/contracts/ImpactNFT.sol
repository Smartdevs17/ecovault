// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ImpactNFT
 * @notice ERC721 NFT contract for minting proof-of-impact tokens
 */
contract ImpactNFT is ERC721URIStorage, Ownable {
	uint256 private _tokenIds;

	struct ImpactData {
		uint256 projectId;
		uint256 contributionAmount;
		uint256 carbonReduced; // in kg
		uint256 timestamp;
		string impactType; // e.g., "tree_planting", "recycling", "energy"
	}

	mapping(uint256 => ImpactData) public impactData;
	mapping(address => uint256[]) public userNFTs;
	mapping(uint256 => uint256) public projectNFTs; // projectId => tokenId

	event ImpactNFTMinted(
		uint256 indexed tokenId,
		address indexed to,
		uint256 indexed projectId,
		uint256 contributionAmount
	);

	modifier onlyMinter() {
		require(msg.sender == owner() || isAuthorizedMinter(msg.sender), "Not authorized to mint");
		_;
	}

	mapping(address => bool) public authorizedMinters;

	constructor() ERC721("EcoVault Impact NFT", "ECOIMPACT") Ownable(msg.sender) {
		authorizedMinters[msg.sender] = true;
	}

	/**
	 * @notice Mint an impact NFT to a contributor
	 * @param _to Recipient address
	 * @param _projectId Associated project ID
	 * @param _contributionAmount Contribution amount in wei
	 * @param _carbonReduced Carbon reduced in kg
	 * @param _impactType Type of impact (e.g., "tree_planting")
	 * @param _tokenURI Metadata URI for the NFT
	 */
	function mintImpactNFT(
		address _to,
		uint256 _projectId,
		uint256 _contributionAmount,
		uint256 _carbonReduced,
		string memory _impactType,
		string memory _tokenURI
	) public onlyMinter returns (uint256) {
		require(_to != address(0), "Cannot mint to zero address");
		require(_contributionAmount > 0, "Contribution amount must be greater than 0");

		_tokenIds++;
		uint256 newTokenId = _tokenIds;

		_safeMint(_to, newTokenId);
		_setTokenURI(newTokenId, _tokenURI);

		impactData[newTokenId] = ImpactData({
			projectId: _projectId,
			contributionAmount: _contributionAmount,
			carbonReduced: _carbonReduced,
			timestamp: block.timestamp,
			impactType: _impactType
		});

		userNFTs[_to].push(newTokenId);
		projectNFTs[_projectId] = newTokenId;

		emit ImpactNFTMinted(newTokenId, _to, _projectId, _contributionAmount);

		return newTokenId;
	}

	/**
	 * @notice Get impact data for a token
	 * @param _tokenId Token ID
	 */
	function getImpactData(uint256 _tokenId) public view returns (ImpactData memory) {
		require(ownerOf(_tokenId) != address(0), "Token does not exist");
		return impactData[_tokenId];
	}

	/**
	 * @notice Get all NFTs owned by a user
	 * @param _user User address
	 */
	function getUserNFTs(address _user) public view returns (uint256[] memory) {
		return userNFTs[_user];
	}

	/**
	 * @notice Get NFT for a project
	 * @param _projectId Project ID
	 */
	function getProjectNFT(uint256 _projectId) public view returns (uint256) {
		return projectNFTs[_projectId];
	}

	/**
	 * @notice Get total supply of NFTs
	 */
	function totalSupply() public view returns (uint256) {
		return _tokenIds;
	}

	/**
	 * @notice Add an authorized minter
	 * @param _minter Address to authorize
	 */
	function addAuthorizedMinter(address _minter) public onlyOwner {
		require(_minter != address(0), "Invalid minter address");
		authorizedMinters[_minter] = true;
	}

	/**
	 * @notice Remove an authorized minter
	 * @param _minter Address to revoke
	 */
	function removeAuthorizedMinter(address _minter) public onlyOwner {
		authorizedMinters[_minter] = false;
	}

	/**
	 * @notice Check if address is authorized to mint
	 * @param _minter Address to check
	 */
	function isAuthorizedMinter(address _minter) public view returns (bool) {
		return authorizedMinters[_minter];
	}

	/**
	 * @notice Override to support interface
	 */
	function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}


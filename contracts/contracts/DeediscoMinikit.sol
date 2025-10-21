// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DeediscoMinikit is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Pack configuration
    uint256 public constant CARDS_PER_PACK = 3;
    uint256 public constant TOTAL_CARDS = 24;
    
    // Events
    event PackMinted(address indexed to, uint256[] tokenIds);
    
    constructor(string memory baseURI) ERC721("Deedisco Minikit Cards", "DMC") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    // Mint a pack of 3 random cards
    function mintPack(address to, uint256 quantity) external onlyOwner returns (uint256[] memory) {
        require(quantity == CARDS_PER_PACK, "Must mint exactly 3 cards");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
        }
        
        emit PackMinted(to, tokenIds);
        return tokenIds;
    }
    
    // Set base URI for metadata
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    // Get base URI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Get token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"));
    }
    
    // Get total supply
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
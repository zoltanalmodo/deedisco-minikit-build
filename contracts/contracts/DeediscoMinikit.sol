// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeediscoMinikit is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    
    constructor(string memory baseURI) ERC721("Deedisco Minikit Cards", "DMC") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function mintPack(address to, uint256 quantity) public onlyOwner returns (uint256[] memory) {
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
        }
        
        return tokenIds;
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
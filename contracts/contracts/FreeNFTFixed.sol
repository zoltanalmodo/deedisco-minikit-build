// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreeNFTFixed is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    
    // Map token ID to card ID (0-23)
    mapping(uint256 => uint256) private _tokenToCard;

    constructor() ERC721("Deedisco Cards", "DDC") Ownable(msg.sender) {
        _baseTokenURI = "https://deedisco-minikit-app.vercel.app/api/nft/";
    }

    // FREE MINTING - NO PAYMENT REQUIRED
    // cardIds: array of card indices (0-23) to mint
    function mintPack(address to, uint256[] memory cardIds) public returns (uint256[] memory) {
        require(cardIds.length > 0 && cardIds.length <= 3, "Invalid card count");
        uint256[] memory tokenIds = new uint256[](cardIds.length);
        
        for (uint256 i = 0; i < cardIds.length; i++) {
            require(cardIds[i] < 24, "Invalid card ID"); // Must be 0-23
            
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            
            // Store the mapping of token ID to card ID
            _tokenToCard[tokenId] = cardIds[i];
            
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
        }
        
        return tokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Get the card ID for a given token ID
    function getCardId(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return _tokenToCard[tokenId];
    }

    // Override tokenURI to return metadata based on card ID, not token ID
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        uint256 cardId = _tokenToCard[tokenId];
        return
            string(
                abi.encodePacked(
                    _baseTokenURI,
                    Strings.toString(cardId) // Use card ID, not token ID!
                )
            );
    }
}


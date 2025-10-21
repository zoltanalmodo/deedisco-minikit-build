// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleNFT {
    string public name = "Deedisco Minikit Cards";
    string public symbol = "DMC";
    string private _baseURI = "https://ipfs.io/ipfs/QmYourMetadataHash/";
    
    uint256 private _tokenIdCounter;
    address public owner;
    
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event PackMinted(address indexed to, uint256[] tokenIds);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function mintPack(address to, uint256 quantity) external onlyOwner returns (uint256[] memory) {
        require(quantity == 3, "Must mint exactly 3 cards");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _owners[tokenId] = to;
            _balances[to]++;
            tokenIds[i] = tokenId;
            emit Transfer(address(0), to, tokenId);
        }
        
        emit PackMinted(to, tokenIds);
        return tokenIds;
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }
    
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }
}

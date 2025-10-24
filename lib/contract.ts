import { config } from './config';

// ERC-721 NFT Contract ABI
export const nftContractAbi = [
  // Standard ERC-721 functions
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }
    ],
    "name": "mintBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256[]", "name": "cardIds", "type": "uint256[]" }
    ],
    "name": "mintPack",
    "outputs": [
      { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "getCardId",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract configuration
export const nftContractConfig = {
  address: config.nftContractAddress as `0x${string}`,
  abi: nftContractAbi,
  chainId: config.chainId,
} as const;

// Random number generation for card selection
export function generateRandomCards(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  for (let i = 0; i < cardsPerPack; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards.splice(randomIndex, 1)[0];
    selectedCards.push(selectedCard);
  }
  
  return selectedCards;
}

// Generate cryptographically secure random numbers
export function getSecureRandomNumber(max: number): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

// Generate random cards using secure random
export function generateSecureRandomCards(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  for (let i = 0; i < cardsPerPack; i++) {
    const randomIndex = getSecureRandomNumber(availableCards.length);
    const selectedCard = availableCards.splice(randomIndex, 1)[0];
    selectedCards.push(selectedCard);
  }
  
  return selectedCards;
}

// Configuration for BASE testnet and NFT contract
export const config = {
  // BASE Testnet Configuration
  chainId: 84532, // BASE Sepolia testnet
  rpcUrl: process.env.NEXT_PUBLIC_BASE_TESTNET_RPC || 'https://sepolia.base.org',
  
  // NFT Contract Configuration
  nftContractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x6033a3773fc901946C63AfACbA390634f104883F', // Deployed on BASE Sepolia with payment
  
  // IPFS Configuration
  ipfsGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  
  // Card Configuration
  totalCards: 24, // 8 cards per carousel × 3 carousels
  cardsPerPack: 3,
  
  // Metadata Configuration
  contractName: 'Deedisco Minikit Cards',
  contractSymbol: 'DMC',
  baseTokenURI: 'https://ipfs.io/ipfs/QmYourMetadataHash/', // Will be updated after deployment
} as const;

// Card metadata structure
export interface CardMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

// Predefined card metadata for all 24 cards
export const cardMetadata: CardMetadata[] = [
  // Carousel 1 (8 cards)
  {
    name: "Card 1-1",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image1.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "1" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-2",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image2.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "2" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-3",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image3.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "3" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-4",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image4.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "4" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-5",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image5.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "5" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-6",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image6.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "6" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-7",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image7.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "7" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 1-8",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel1-image8.jpg",
    attributes: [
      { trait_type: "Carousel", value: "1" },
      { trait_type: "Position", value: "8" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  // Carousel 2 (8 cards)
  {
    name: "Card 2-1",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image1.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "1" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-2",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image2.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "2" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-3",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image3.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "3" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-4",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image4.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "4" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-5",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image5.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "5" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-6",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image6.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "6" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-7",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image7.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "7" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 2-8",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel2-image8.jpg",
    attributes: [
      { trait_type: "Carousel", value: "2" },
      { trait_type: "Position", value: "8" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  // Carousel 3 (8 cards)
  {
    name: "Card 3-1",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image1.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "1" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-2",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image2.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "2" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-3",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image3.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "3" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-4",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image4.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "4" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-5",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image5.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "5" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-6",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image6.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "6" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-7",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image7.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "7" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  {
    name: "Card 3-8",
    description: "A unique collectible card from Deedisco Minikit",
    image: "/carousel3-image8.jpg",
    attributes: [
      { trait_type: "Carousel", value: "3" },
      { trait_type: "Position", value: "8" },
      { trait_type: "Rarity", value: "Common" }
    ]
  }
];

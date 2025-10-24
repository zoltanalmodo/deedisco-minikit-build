import { NextRequest, NextResponse } from 'next/server';
import { config, cardMetadata } from '../../../../lib/config';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    // The tokenId here is the ACTUAL TOKEN ID (1, 2, 3, etc.) from the contract
    const tokenId = parseInt(params.tokenId);
    
    console.log('🔍 NFT Metadata API called with tokenId:', params.tokenId);
    
    if (isNaN(tokenId) || tokenId < 1) {
      console.error('❌ Invalid token ID:', tokenId);
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Call the contract's getCardId function to get the actual cardId
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(config.rpcUrl)
    });
    
    console.log('🔗 Calling contract.getCardId for tokenId:', tokenId);
    
    let cardId: number;
    
    try {
      const contractCardId = await client.readContract({
        address: config.nftContractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
            "name": "getCardId",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: 'getCardId',
        args: [BigInt(tokenId)]
      });
      
      cardId = Number(contractCardId);
      console.log('✅ Contract returned cardId:', cardId, 'for tokenId:', tokenId);
      
    } catch (error) {
      console.error('❌ Failed to call contract.getCardId:', error);
      // Fallback to wrong mapping for debugging
      cardId = tokenId - 1;
      console.log('⚠️ Using fallback mapping: tokenId', tokenId, '-> cardId', cardId);
    }

    // Get the card metadata directly using card ID (0-based index)
    const card = cardMetadata[cardId];
    
    console.log('🎯 Card metadata for cardId', cardId, ':', {
      name: card?.name,
      image: card?.image,
      carousel: Math.floor(cardId / 8) + 1,
      position: (cardId % 8) + 1
    });
    
    if (!card) {
      console.error('❌ Card not found for cardId:', cardId);
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Create the NFT metadata following ERC-721 standard with OpenSea extensions
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://deedisco-minikit-app.vercel.app';
    const imageUrl = `${baseUrl}${card.image}`; // Use direct image URL, not HTML wrapper
    
    console.log('🖼️ Generated metadata for cardId', cardId, ':', {
      name: card.name,
      image: imageUrl,
      originalImage: card.image,
      baseUrl: baseUrl
    });
    
    const metadata = {
      name: card.name,
      description: card.description,
      // Use direct image URL for better wallet compatibility
      image: imageUrl,
      external_url: baseUrl,
      attributes: card.attributes,
      // OpenSea metadata for proper display
      animation_url: null,
      background_color: null,
      // Image properties to maintain aspect ratio (approximately 3:1 - horizontal/rectangular)
      image_data: null,
      image_details: {
        format: "image/jpeg",
        width: 1500,  // Wide rectangular format
        height: 500,  // Maintains horizontal rectangular shape (3:1 ratio)
        bytes: null
      },
      // Add contract metadata
      contract: {
        name: config.contractName,
        symbol: config.contractSymbol,
        address: config.nftContractAddress,
        chainId: config.chainId
      }
    };
    
    console.log('📤 Returning metadata:', JSON.stringify(metadata, null, 2));

    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating NFT metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

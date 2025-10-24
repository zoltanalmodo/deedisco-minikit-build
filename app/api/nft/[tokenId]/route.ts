import { NextRequest, NextResponse } from 'next/server';
import { config, cardMetadata } from '../../../../lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    // The tokenId here is actually the CARD ID (0-23) from our new contract
    const cardId = parseInt(params.tokenId);
    
    if (isNaN(cardId) || cardId < 0 || cardId >= 24) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      );
    }

    // Get the card metadata directly using card ID (0-based index)
    const card = cardMetadata[cardId];
    
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Create the NFT metadata following ERC-721 standard with OpenSea extensions
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://deedisco-minikit-app.vercel.app';
    const metadata = {
      name: card.name,
      description: card.description,
      // Use HTML page that forces horizontal aspect ratio
      image: `${baseUrl}/api/nft/image/${cardId}`,
      external_url: baseUrl,
      attributes: card.attributes,
      // OpenSea metadata for proper display
      animation_url: null,
      background_color: null,
      // Image properties to maintain aspect ratio (approximately 3:1 - horizontal/rectangular)
      image_data: null,
      image_details: {
        format: "image/jpeg",
        width: 600,  // Wide rectangular format
        height: 200,  // Maintains horizontal rectangular shape (3:1 ratio)
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

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;
  
  // Simple metadata for each token
  const metadata = {
    name: `Deedisco Card #${tokenId}`,
    description: "A unique collectible card from Deedisco Minikit Collection",
    image: `https://deedisco-minikit-build.vercel.app/carousel1-image${tokenId}.jpg`,
    attributes: [
      {
        trait_type: "Carousel",
        value: "1"
      },
      {
        trait_type: "Position", 
        value: tokenId
      },
      {
        trait_type: "Rarity",
        value: "Common"
      }
    ]
  };

  return NextResponse.json(metadata);
}

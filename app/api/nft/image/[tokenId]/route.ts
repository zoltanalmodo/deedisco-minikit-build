import { NextRequest, NextResponse } from 'next/server';
import { config, cardMetadata } from '../../../../../lib/config';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = parseInt(params.tokenId);
    
    if (isNaN(tokenId) || tokenId < 1) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Get cardId from contract
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(config.rpcUrl)
    });
    
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
      
    } catch {
      // Fallback mapping
      cardId = tokenId - 1;
    }

    if (isNaN(cardId) || cardId < 0 || cardId >= 24) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      );
    }

    const card = cardMetadata[cardId];
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Detect wallet type from User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const isMetaMask = userAgent.includes('MetaMask') || userAgent.includes('metamask');
    const isCoinbase = userAgent.includes('Coinbase') || userAgent.includes('coinbase');
    
    // Get the original image path
    const originalImagePath = card.image;
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://deedisco-minikit-app.vercel.app';
    
    // Smart image serving based on wallet type
    
    // For MetaMask and Coinbase: Serve square letterboxed version
    // For Warpcast: Serve original rectangular version
    if (isMetaMask || isCoinbase) {
      // Return HTML that forces square display with letterboxing
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>NFT Image</title>
          <style>
            body { 
              margin: 0; 
              background-color: black; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
            }
            .image-container {
              width: 100vw;
              max-width: 858px;
              aspect-ratio: 1 / 1; /* Force square */
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: black;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: contain; /* Maintain aspect ratio within square */
            }
          </style>
        </head>
        <body>
          <div class="image-container">
            <img src="${baseUrl}${originalImagePath}" alt="NFT Image">
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // For Warpcast and others: Return original rectangular image
      return NextResponse.redirect(`${baseUrl}${originalImagePath}`);
    }
    
  } catch (error) {
    console.error('Error serving NFT image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

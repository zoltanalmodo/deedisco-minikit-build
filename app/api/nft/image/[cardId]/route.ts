import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  const cardId = parseInt(params.cardId);
  
  if (isNaN(cardId) || cardId < 0 || cardId >= 24) {
    return NextResponse.json(
      { error: 'Invalid card ID' },
      { status: 400 }
    );
  }

  // Map card ID to image path
  const carousel = Math.floor(cardId / 8) + 1;
  const position = (cardId % 8) + 1;
  const imagePath = `/carousel${carousel}-image${position}.jpg`;
  
  // Return HTML that forces horizontal aspect ratio
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://deedisco-minikit-app.vercel.app';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>NFT Image</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .nft-image {
          width: 600px;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <img src="${baseUrl}${imagePath}" alt="NFT Card" class="nft-image">
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

import { NextResponse } from 'next/server';
import { config } from '../../../lib/config';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export async function GET() {
  try {
    console.log('🧪 TEST CONTRACT - Checking all tokenId mappings');
    
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(config.rpcUrl)
    });
    
    const results = [];
    
    // Test tokenIds 1, 2, 3 (the ones that should be minted)
    for (let tokenId = 1; tokenId <= 3; tokenId++) {
      try {
        console.log(`🔍 Testing tokenId ${tokenId}...`);
        
        const cardId = await client.readContract({
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
        
        const cardIdNumber = Number(cardId);
        const carousel = Math.floor(cardIdNumber / 8) + 1;
        const position = (cardIdNumber % 8) + 1;
        const imagePath = `/carousel${carousel}-image${position}.jpg`;
        
        results.push({
          tokenId,
          cardId: cardIdNumber,
          carousel,
          position,
          imagePath,
          contractResponse: cardId.toString()
        });
        
        console.log(`✅ TokenId ${tokenId} -> CardId ${cardIdNumber} -> ${imagePath}`);
        
      } catch (error) {
        console.error(`❌ Error testing tokenId ${tokenId}:`, error);
        results.push({
          tokenId,
          error: (error as Error).message,
          contractResponse: null
        });
      }
    }
    
    return NextResponse.json({
      contractAddress: config.nftContractAddress,
      rpcUrl: config.rpcUrl,
      results
    });
    
  } catch (error) {
    console.error('❌ Test contract error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

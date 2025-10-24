import { NextResponse } from 'next/server';
import { config } from '../../../lib/config';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export async function GET() {
  try {
    console.log('🧪 TESTING METADATA API - Checking what cardId contract returns for tokenId 1');
    console.log('🔗 Contract address:', config.nftContractAddress);
    console.log('🔗 RPC URL:', config.rpcUrl);
    
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(config.rpcUrl)
    });
    
    // Test tokenId 1
    console.log('🔍 Testing tokenId 1...');
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
        args: [BigInt(1)]
      });
      
      const cardId = Number(contractCardId);
      console.log('✅ Contract returned cardId:', cardId, 'for tokenId: 1');
      console.log('✅ Contract response type:', typeof contractCardId);
      console.log('✅ Contract response value:', contractCardId.toString());
      
      // Map cardId to image
      const carousel = Math.floor(cardId / 8) + 1;
      const position = (cardId % 8) + 1;
      const imagePath = `/carousel${carousel}-image${position}.jpg`;
      
      console.log('🎯 Image mapping for cardId', cardId, ':', {
        carousel,
        position,
        imagePath
      });
      
      return NextResponse.json({
        success: true,
        tokenId: 1,
        cardId: cardId,
        carousel: carousel,
        position: position,
        imagePath: imagePath,
        contractAddress: config.nftContractAddress,
        rpcUrl: config.rpcUrl
      });
      
    } catch (error) {
      console.error('❌ Failed to call contract.getCardId for tokenId 1:', error);
      return NextResponse.json({
        success: false,
        error: (error as Error).message,
        contractAddress: config.nftContractAddress,
        rpcUrl: config.rpcUrl
      });
    }
    
  } catch (error) {
    console.error('❌ Test metadata API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

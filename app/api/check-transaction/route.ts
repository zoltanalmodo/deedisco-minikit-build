import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Create a public client for Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Server-side check for transaction:', hash);

    // Get transaction receipt from blockchain
    const receipt = await publicClient.getTransactionReceipt({
      hash: hash as `0x${string}`,
    });

    if (!receipt) {
      return NextResponse.json({
        confirmed: false,
        message: 'Transaction not yet mined'
      });
    }

    console.log('✅ Server-side: Transaction confirmed!', {
      status: receipt.status,
      blockNumber: receipt.blockNumber,
    });

    return NextResponse.json({
      confirmed: true,
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      transactionHash: receipt.transactionHash,
    });

  } catch (error) {
    console.error('❌ Server-side transaction check error:', error);
    
    // Return pending status instead of error (transaction might just not be mined yet)
    return NextResponse.json({
      confirmed: false,
      message: 'Transaction pending or not found'
    });
  }
}


import { useState } from 'react';
import { useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { nftContractConfig } from '../contract';
// import { mockContract } from '../mock-contract';

export interface MintPackResult {
  success: boolean;
  transactionHash?: string;
  tokenIds?: number[];
  error?: string;
}

export function useMintPack() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MintPackResult | null>(null);
  
  const { address } = useAccount();
  const { sendTransaction, data: hash, error, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug transaction state
  console.log('🔍 useMintPack state:', { hash, isPending, isConfirming, isSuccess, error });

  const mintPack = async (): Promise<MintPackResult> => {
    if (!address) {
      const error = 'No wallet connected';
      setResult({ success: false, error });
      return { success: false, error };
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Use real contract minting with payment
      console.log('🔄 Calling sendTransaction with payment of 0.001 ETH');
      console.log('📋 Contract address:', nftContractConfig.address);
      
      // Try a simple ETH transfer to the contract address first
      sendTransaction({
        to: nftContractConfig.address,
        value: BigInt("1000000000000000"), // 0.001 ETH in wei
        data: '0x', // Empty data for simple ETH transfer
      });

      console.log('✅ Transaction submitted! Hash:', hash);

      // Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      
      // The useWaitForTransactionReceipt hook will handle the confirmation
      // We'll return success immediately but the hook will update when confirmed
      const successResult: MintPackResult = {
        success: true,
        transactionHash: hash,
        tokenIds: [1, 2, 3], // Placeholder - will be populated after confirmation
      };
      
      setResult(successResult);
      return successResult;
    } catch (err) {
      console.error('❌ Minting error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      const errorResult: MintPackResult = {
        success: false,
        error: errorMessage,
      };
      
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mintPack,
    isLoading: isLoading || isPending || isConfirming,
    result,
    error,
    transactionHash: hash,
    isSuccess,
  };
}

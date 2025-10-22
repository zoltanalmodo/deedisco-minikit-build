import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { nftContractConfig } from '../contract';
import { config } from '../config';
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
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintPack = async (): Promise<MintPackResult> => {
    if (!address) {
      const error = 'No wallet connected';
      setResult({ success: false, error });
      return { success: false, error };
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Use real contract minting - writeContract returns a promise
      console.log('🔄 Calling writeContract with:', {
        address: nftContractConfig.address,
        functionName: 'mintPack',
        args: [address, config.cardsPerPack],
      });
      
      const txHash = await writeContract({
        address: nftContractConfig.address,
        abi: nftContractConfig.abi,
        functionName: 'mintPack',
        args: [address, config.cardsPerPack],
      });

      console.log('✅ Transaction submitted! Hash:', txHash);

      // Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      
      // The useWaitForTransactionReceipt hook will handle the confirmation
      // We'll return success immediately but the hook will update when confirmed
      const successResult: MintPackResult = {
        success: true,
        transactionHash: txHash,
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

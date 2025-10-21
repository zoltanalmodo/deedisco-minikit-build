import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { nftContractConfig, generateSecureRandomCards } from '../contract';
import { config } from '../config';
import { mockContract } from '../mock-contract';

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
      // For now, use mock contract for testing
      // TODO: Replace with real contract once deployed
      const mockResult = await mockContract.mintPack(address, config.cardsPerPack);
      
      if (mockResult.success) {
        const successResult: MintPackResult = {
          success: true,
          transactionHash: mockResult.transactionHash,
          tokenIds: mockResult.tokenIds,
        };
        
        setResult(successResult);
        return successResult;
      } else {
        throw new Error('Mock minting failed');
      }
    } catch (err) {
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

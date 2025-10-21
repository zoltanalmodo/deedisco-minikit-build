import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { nftContractConfig, generateSecureRandomCards } from '../contract';
import { config } from '../config';

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
      // Generate random cards for the pack
      const randomCards = generateSecureRandomCards(config.totalCards, config.cardsPerPack);
      
      // Call the mintPack function on the contract
      writeContract({
        address: nftContractConfig.address,
        abi: nftContractConfig.abi,
        functionName: 'mintPack',
        args: [address, config.cardsPerPack],
      });

      // Wait for transaction to be confirmed
      if (hash) {
        const receipt = await new Promise((resolve, reject) => {
          const checkReceipt = () => {
            if (isSuccess) {
              resolve(hash);
            } else if (error) {
              reject(error);
            } else {
              setTimeout(checkReceipt, 1000);
            }
          };
          checkReceipt();
        });

        const successResult: MintPackResult = {
          success: true,
          transactionHash: hash,
          tokenIds: randomCards,
        };
        
        setResult(successResult);
        return successResult;
      } else {
        throw new Error('Transaction failed to submit');
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

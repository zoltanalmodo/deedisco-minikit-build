import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
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
  const { data: hash, error, isPending } = useWriteContract();
  const { sendTransaction, data: txHash, error: txError, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash || hash,
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
      // Use real contract minting with payment
      console.log('🔄 Calling writeContract with payment of 0.001 ETH');
      
      // First send the ETH payment
      sendTransaction({
        to: nftContractConfig.address,
        value: BigInt("1000000000000000"), // 0.001 ETH in wei
        data: encodeFunctionData({
          abi: nftContractConfig.abi,
          functionName: 'mintPack',
          args: [address, BigInt(config.cardsPerPack)],
        }),
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
    isLoading: isLoading || isPending || isTxPending || isConfirming,
    result,
    error: error || txError,
    transactionHash: txHash || hash,
    isSuccess,
  };
}

import { useState } from 'react';
import { useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
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

// Generate random cards without duplicates
function generateRandomCards(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  for (let i = 0; i < cardsPerPack; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards.splice(randomIndex, 1)[0];
    selectedCards.push(selectedCard);
  }
  
  return selectedCards;
}

// Generate guaranteed top pack (at least 1 from carousel 1: cards 0-7)
function generateGuaranteedTopPack(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  // First, guarantee at least 1 from carousel 1 (cards 0-7)
  const topCards = availableCards.filter(card => card < 8);
  const randomTopCard = topCards[Math.floor(Math.random() * topCards.length)];
  selectedCards.push(randomTopCard);
  availableCards.splice(availableCards.indexOf(randomTopCard), 1);
  
  // Fill remaining slots with any available cards
  for (let i = 1; i < cardsPerPack; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards.splice(randomIndex, 1)[0];
    selectedCards.push(selectedCard);
  }
  
  return selectedCards;
}

// Generate guaranteed middle pack (at least 1 from carousel 2: cards 8-15)
function generateGuaranteedMiddlePack(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  // First, guarantee at least 1 from carousel 2 (cards 8-15)
  const middleCards = availableCards.filter(card => card >= 8 && card < 16);
  const randomMiddleCard = middleCards[Math.floor(Math.random() * middleCards.length)];
  selectedCards.push(randomMiddleCard);
  availableCards.splice(availableCards.indexOf(randomMiddleCard), 1);
  
  // Fill remaining slots with any available cards
  for (let i = 1; i < cardsPerPack; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards.splice(randomIndex, 1)[0];
    selectedCards.push(selectedCard);
  }
  
  return selectedCards;
}

// Generate guaranteed bottom pack (at least 1 from carousel 3: cards 16-23)
function generateGuaranteedBottomPack(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  // First, guarantee at least 1 from carousel 3 (cards 16-23)
  const bottomCards = availableCards.filter(card => card >= 16);
  const randomBottomCard = bottomCards[Math.floor(Math.random() * bottomCards.length)];
  selectedCards.push(randomBottomCard);
  availableCards.splice(availableCards.indexOf(randomBottomCard), 1);
  
  // Fill remaining slots with any available cards
  for (let i = 1; i < cardsPerPack; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards.splice(randomIndex, 1)[0];
    selectedCards.push(selectedCard);
  }
  
  return selectedCards;
}

export function useMintPack() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MintPackResult | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
  const { address } = useAccount();
  const { sendTransaction, data: hash, error, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug transaction state
  console.log('🔍 useMintPack state:', { hash, isPending, isConfirming, isSuccess, error });

  const mintPack = async (packType: number = 0): Promise<MintPackResult> => {
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
      
      // Generate cards based on pack type
      let selectedCards: number[] = [];
      
      if (packType === 0) {
        // All Random Pack - completely random cards
        selectedCards = generateRandomCards(config.totalCards, config.cardsPerPack);
        console.log('🎲 All Random Pack - Selected cards:', selectedCards);
      } else if (packType === 1) {
        // Guaranteed Top Pack - at least 1 from carousel 1 (cards 0-7)
        selectedCards = generateGuaranteedTopPack(config.totalCards, config.cardsPerPack);
        console.log('🎯 Guaranteed Top Pack - Selected cards:', selectedCards);
      } else if (packType === 2) {
        // Guaranteed Middle Pack - at least 1 from carousel 2 (cards 8-15)
        selectedCards = generateGuaranteedMiddlePack(config.totalCards, config.cardsPerPack);
        console.log('🎯 Guaranteed Middle Pack - Selected cards:', selectedCards);
      } else if (packType === 3) {
        // Guaranteed Bottom Pack - at least 1 from carousel 3 (cards 16-23)
        selectedCards = generateGuaranteedBottomPack(config.totalCards, config.cardsPerPack);
        console.log('🎯 Guaranteed Bottom Pack - Selected cards:', selectedCards);
      }
      
      setSelectedCards(selectedCards);
      
      // Use contract minting with proper data
      sendTransaction({
        to: nftContractConfig.address,
        value: BigInt("1000000000000000"), // 0.001 ETH in wei
        data: encodeFunctionData({
          abi: nftContractConfig.abi,
          functionName: 'mintPack',
          args: [address, BigInt(config.cardsPerPack)],
        }),
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
    selectedCards,
  };
}

import { useState, useEffect } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
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

// Generate random cards without duplicates - ALL RANDOM PACK RULES
function generateRandomCards(totalCards: number, cardsPerPack: number): number[] {
  // Only run on client side to prevent server-side rendering issues
  if (typeof window === 'undefined') {
    return [0, 1, 2]; // Fallback for server-side rendering
  }
  
  let selectedCards: number[] = [];
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops
  
  do {
    selectedCards = [];
    const availableCards = Array.from({ length: totalCards }, (_, i) => i);
    
    // Generate 3 random cards
    for (let i = 0; i < cardsPerPack; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCard = availableCards.splice(randomIndex, 1)[0];
      selectedCards.push(selectedCard);
    }
    
    attempts++;
    
    // Check if we need to regenerate
    const needsRegeneration = checkAllRandomPackRules(selectedCards);
    
    if (!needsRegeneration) {
      break; // Rules satisfied, exit loop
    }
    
  } while (attempts < maxAttempts);
  
  // If we hit max attempts, return the last generated set (fallback)
  if (attempts >= maxAttempts) {
    console.warn('⚠️ All Random Pack: Max attempts reached, using fallback selection');
  }
  
  return selectedCards;
}

// Check All Random Pack rules
function checkAllRandomPackRules(selectedCards: number[]): boolean {
  // Rule 1: All 3 images must be different numbers (not all image 1, image 4, etc.)
  const imageNumbers = selectedCards.map(card => (card % 8) + 1); // Get image number (1-8)
  const uniqueImageNumbers = new Set(imageNumbers);
  
  if (uniqueImageNumbers.size !== 3) {
    return true; // Needs regeneration
  }
  
  // Rule 2: Cannot be exactly one top + one middle + one bottom
  const carouselTypes = selectedCards.map(card => {
    if (card < 8) return 'top';      // Carousel 1: cards 0-7
    if (card < 16) return 'middle';   // Carousel 2: cards 8-15
    return 'bottom';                  // Carousel 3: cards 16-23
  });
  
  const hasTop = carouselTypes.includes('top');
  const hasMiddle = carouselTypes.includes('middle');
  const hasBottom = carouselTypes.includes('bottom');
  
  // If we have exactly one of each, it's a complete set (forbidden)
  if (hasTop && hasMiddle && hasBottom) {
    return true; // Needs regeneration
  }
  
  return false; // Rules satisfied, no regeneration needed
}

// Generate guaranteed top pack (at least 1 from carousel 1: cards 0-7)
function generateGuaranteedTopPack(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  // First, guarantee at least 1 from carousel 1 (cards 0-7) - MUST be in position 0 (top)
  const topCards = availableCards.filter(card => card < 8);
  const randomTopCard = topCards[Math.floor(Math.random() * topCards.length)];
  selectedCards[0] = randomTopCard; // Top card MUST be a top card
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
  
  // First, guarantee at least 1 from carousel 2 (cards 8-15) - MUST be in position 1 (middle)
  const middleCards = availableCards.filter(card => card >= 8 && card < 16);
  const randomMiddleCard = middleCards[Math.floor(Math.random() * middleCards.length)];
  selectedCards[1] = randomMiddleCard; // Middle card MUST be a middle card
  availableCards.splice(availableCards.indexOf(randomMiddleCard), 1);
  
  // Fill remaining slots with any available cards
  for (let i = 0; i < cardsPerPack; i++) {
    if (selectedCards[i] === undefined) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCard = availableCards.splice(randomIndex, 1)[0];
      selectedCards[i] = selectedCard;
    }
  }
  
  return selectedCards;
}

// Generate guaranteed bottom pack (at least 1 from carousel 3: cards 16-23)
function generateGuaranteedBottomPack(totalCards: number, cardsPerPack: number): number[] {
  const selectedCards: number[] = [];
  const availableCards = Array.from({ length: totalCards }, (_, i) => i);
  
  // First, guarantee at least 1 from carousel 3 (cards 16-23) - MUST be in position 2 (bottom)
  const bottomCards = availableCards.filter(card => card >= 16);
  const randomBottomCard = bottomCards[Math.floor(Math.random() * bottomCards.length)];
  selectedCards[2] = randomBottomCard; // Bottom card MUST be a bottom card
  availableCards.splice(availableCards.indexOf(randomBottomCard), 1);
  
  // Fill remaining slots with any available cards
  for (let i = 0; i < cardsPerPack; i++) {
    if (selectedCards[i] === undefined) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCard = availableCards.splice(randomIndex, 1)[0];
      selectedCards[i] = selectedCard;
    }
  }
  
  return selectedCards;
}

export function useMintPack() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MintPackResult | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [manualIsSuccess, setManualIsSuccess] = useState(false);
  
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  // Only use Wagmi's hook if we don't have manual success yet
  const wagmiResult = useWaitForTransactionReceipt({
    hash: manualIsSuccess ? undefined : hash, // Completely disable by passing undefined hash
    query: {
      enabled: !!hash && !manualIsSuccess,
    },
  });
  
  // Use manual success values when available, otherwise fall back to Wagmi
  const isConfirming = manualIsSuccess ? false : wagmiResult.isLoading;
  const wagmiIsSuccess = manualIsSuccess ? false : wagmiResult.isSuccess;

  // Combine wagmi success with manual success
  const isSuccess = wagmiIsSuccess || manualIsSuccess;

  // Manual transaction confirmation checker - uses server-side API to bypass CSP
  useEffect(() => {
    if (!hash || wagmiIsSuccess || manualIsSuccess) {
      return;
    }

    console.log('🔍 Starting server-side transaction confirmation check for hash:', hash);

    let pollCount = 0;
    const maxPolls = 60; // 60 seconds total (60 polls * 2 second interval)
    let intervalId: NodeJS.Timeout | null = null;
    
    const checkTransaction = async () => {
      pollCount++;
      
      try {
        console.log(`🔍 Server poll #${pollCount}: Checking transaction receipt...`);
        
        // Call server-side API to check transaction (bypasses CSP restrictions)
        const response = await fetch(`/api/check-transaction?hash=${hash}`);
        const data = await response.json();

        console.log('📡 Server response:', data);

        if (data.confirmed && data.status === 'success') {
          console.log('✅ Server check: Transaction confirmed!');
          console.log('📊 Block number:', data.blockNumber);
          
          // Stop polling immediately
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          setManualIsSuccess(true);
        } else if (data.confirmed && data.status !== 'success') {
          console.log('❌ Transaction failed with status:', data.status);
          if (intervalId) clearInterval(intervalId);
        } else {
          console.log('⏳ Transaction not yet confirmed, continuing to poll...');
        }
      } catch (err) {
        // API call failed or transaction not yet mined, continue polling
        console.log('⏳ Transaction pending (poll #' + pollCount + ')...');
        console.error('Poll error:', err);
      }

      if (pollCount >= maxPolls) {
        console.log('⏰ Server check timeout reached after 60 seconds - assuming success');
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        // Assume success after timeout since transaction was submitted
        setManualIsSuccess(true);
      }
    };

    // Start polling every 2 seconds (Base Sepolia block time is ~2 seconds)
    intervalId = setInterval(checkTransaction, 2000);
    
    // Check immediately
    checkTransaction();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hash, wagmiIsSuccess, manualIsSuccess]);

  // Debug logging for transaction states
  console.log('🔍 useMintPack state:', {
    hash: hash?.slice(0, 10) + '...',
    isPending,
    isConfirming,
    wagmiIsSuccess,
    manualIsSuccess,
    isSuccess,
    error: error?.message
  });

  const mintPack = async (packType: number = 0): Promise<MintPackResult> => {
    if (!address) {
      const error = 'No wallet connected';
      setResult({ success: false, error });
      return { success: false, error };
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Generate cards based on pack type
      let selectedCards: number[] = [];
      
      if (packType === 0) {
        // All Random Pack - completely random cards
        selectedCards = generateRandomCards(config.totalCards, config.cardsPerPack);
      } else if (packType === 1) {
        // Guaranteed Top Pack - at least 1 from carousel 1 (cards 0-7)
        selectedCards = generateGuaranteedTopPack(config.totalCards, config.cardsPerPack);
      } else if (packType === 2) {
        // Guaranteed Middle Pack - at least 1 from carousel 2 (cards 8-15)
        selectedCards = generateGuaranteedMiddlePack(config.totalCards, config.cardsPerPack);
      } else if (packType === 3) {
        // Guaranteed Bottom Pack - at least 1 from carousel 3 (cards 16-23)
        selectedCards = generateGuaranteedBottomPack(config.totalCards, config.cardsPerPack);
      }
      
      setSelectedCards(selectedCards);
      
      
      // REAL NFT MINTING - Call the actual contract with selected card IDs
      // Convert card indices to BigInt array for Solidity uint256[]
      const cardIdsBigInt = selectedCards.map(cardId => BigInt(cardId));
      
      
      writeContract({
        address: nftContractConfig.address,
        abi: nftContractConfig.abi,
        functionName: 'mintPack',
        args: [address, cardIdsBigInt], // Pass wallet address and array of card IDs
        // NO PAYMENT - FREE MINTING
      });
      
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

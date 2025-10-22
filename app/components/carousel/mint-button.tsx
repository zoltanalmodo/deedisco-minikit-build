// app/components/carousel/mint-button.tsx
// MiniKit-only implementation for Farcaster Mini App
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../lib/hooks/use-toast";
import { useMintPack } from "../../../lib/hooks/useMintPack";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { CustomModal } from "./custom-modal";

interface MintButtonProps {
  /** Custom button text */
  customButtonText?: string;
}

export default function MintButton({ customButtonText }: MintButtonProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Minting state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    status: string;
    payment: string;
    nftsMinted: string;
    tokenIds: string;
    transactionHash: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const { mintPack, isLoading } = useMintPack();

  // Auto-connect to Farcaster wallet when modal opens
  useEffect(() => {
    if (!isConnected && open && connectors.length > 0) {
      // Connect to first connector (should be Farcaster Mini App connector)
      connect({ connector: connectors[0] });
    }
  }, [isConnected, open, connectors, connect]);

  // Handle minting
  const handleMint = async () => {
    console.log('🎯 Minting NFTs - isConnected:', isConnected, 'address:', address);
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please wait for wallet to connect...",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 Calling mintPack...');
      const mintResult = await mintPack();
      
      if (mintResult.success) {
        setTransactionDetails({
          status: 'Confirmed',
          payment: '0.001 ETH',
          nftsMinted: '3 Cards',
          tokenIds: mintResult.tokenIds?.join(', ') || '1, 2, 3',
          transactionHash: mintResult.transactionHash || 'N/A',
        });
        setShowConfirmation(true);
        
        toast({
          title: "NFTs Minted Successfully!",
          description: `Transaction: ${mintResult.transactionHash}`,
        });
      } else {
        toast({
          title: "Minting Failed",
          description: mintResult.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Minting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Minting Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Reset confirmation when modal opens/closes
  useEffect(() => {
    if (open) {
      setShowConfirmation(false);
      setTransactionDetails(null);
    }
  }, [open]);

  const handleCloseModal = () => {
    setOpen(false);
    setShowConfirmation(false);
    setTransactionDetails(null);
  };

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting wallet and closing modal');
    disconnect();
    setOpen(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors"
          style={{
            borderRadius: '50px',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          {customButtonText || "Buy Pack"}
        </button>
      </div>

      {/* Wallet Selection Modal */}
      <CustomModal open={open} onClose={handleCloseModal} allowClose={true}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto">
          {!showConfirmation ? (
            <>
              {/* Pack Display */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Image
                    src="/pack-all-random.png"
                    alt="3 CARDS PACK"
                    width={120}
                    height={120}
                    className="rounded-lg"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-xs font-semibold text-gray-700">3 CARDS PACK</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {isConnected ? 'Ready to mint!' : 'Connecting wallet...'}
                </h2>
                {isConnected && address && (
                  <p className="text-xs text-gray-600 font-mono truncate px-4">
                    {address}
                  </p>
                )}
              </div>

              {/* Pack Price Display */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700">
                    Pack Price: 0.001 ETH
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Connected to Farcaster Wallet
                  </div>
                </div>
              </div>

              {/* Disconnect Wallet Button - Only show when connected */}
              {isConnected && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full inline-flex items-center justify-center text-sm font-semibold text-red-600 bg-white border-2 border-red-600 hover:bg-red-50 transition-colors"
                    style={{
                      borderRadius: '50px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                    }}
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                  style={{
                    borderRadius: '50px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleMint}
                  disabled={isLoading || !isConnected}
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  style={{
                    borderRadius: '50px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Buy Pack'
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Confirmation View */
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-green-800">NFTs Minted Successfully!</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-green-700 mb-2">Thank you for your purchase!</p>
                <p className="text-sm text-green-600">Your 3 random cards have been minted to your wallet.</p>
              </div>

              {transactionDetails && (
                <div className="bg-white p-3 rounded-lg mb-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Transaction Details:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">{transactionDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="text-gray-800">{transactionDetails.payment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NFTs Minted:</span>
                      <span className="text-gray-800">{transactionDetails.nftsMinted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token IDs:</span>
                      <span className="text-gray-800">{transactionDetails.tokenIds}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Transaction Hash:</span>
                      <span className="text-gray-800 font-mono text-xs break-all">{transactionDetails.transactionHash}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                  style={{
                    borderRadius: '50px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseModal();
                    window.location.href = '/';
                  }}
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors"
                  style={{
                    borderRadius: '50px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  Back to Main
                </button>
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
}


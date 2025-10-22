// app/components/carousel/mint-button.tsx
// Option B: Beautiful UI + Dev-mode wallet selector + MiniKit auto-connect
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../lib/hooks/use-toast";
import { useMintPack } from "../../../lib/hooks/useMintPack";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { CustomModal } from "./custom-modal";

type Wallet = "warpcast" | "coinbase" | "metamask";

interface MintButtonProps {
  customButtonText?: string;
}

export default function MintButton({ customButtonText }: MintButtonProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Detect environment
  // Removed dual-mode logic - use consistent UI everywhere
  const [isMiniApp, setIsMiniApp] = useState(false);
  
  // Detect if running in Farcaster Mini App
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for Farcaster context
      const inFarcaster = window.location !== window.parent.location || 
                         navigator.userAgent.toLowerCase().includes('farcaster') ||
                         navigator.userAgent.toLowerCase().includes('warpcast');
      setIsMiniApp(inFarcaster);
    }
  }, []);
  
  // Modal and minting state
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    status: string;
    payment: string;
    nftsMinted: string;
    tokenIds: string;
    transactionHash: string;
  } | null>(null);
  const [walletType, setWalletType] = useState<Wallet | null>(null);

  const { mintPack, isLoading } = useMintPack();

  // Auto-connect in Mini App mode OR when modal opens in dev mode with selected wallet
  useEffect(() => {
    if (open && !isConnected && connectors.length > 0) {
      if (isMiniApp) {
        // Auto-connect to Farcaster wallet in Mini App
        connect({ connector: connectors[0] });
      } else if (walletType) {
        // Auto-connect to selected wallet in dev mode
        const targetConnector = connectors.find(c => {
          if (walletType === 'coinbase') return c.name.toLowerCase().includes('coinbase');
          if (walletType === 'metamask') return c.name.toLowerCase().includes('metamask');
          return false;
        });
        if (targetConnector) {
          connect({ connector: targetConnector });
        }
      }
    }
  }, [open, isConnected, connectors, connect, isMiniApp, walletType]);

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
          payment: 'Gas fees only',
          nftsMinted: '3 Cards',
          tokenIds: mintResult.tokenIds?.join(', ') || '1, 2, 3',
          transactionHash: mintResult.transactionHash || 'N/A',
        });
        setShowConfirmation(true);
        
        toast({
          title: "✅ NFTs Minted Successfully!",
          description: `Transaction: ${mintResult.transactionHash?.slice(0, 10)}...`,
        });
      } else {
        toast({
          title: "❌ Minting Failed",
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
    setWalletType(null);
    setOpen(false);
  };

  return (
    <>
      {/* Buy Pack Button */}
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="text-white font-bold transition-colors text-base"
          style={{
            backgroundColor: '#000000',
            borderRadius: '25px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 700,
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0a0a0a'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#131312'}
        >
          {customButtonText || "Buy Pack"}
        </button>
      </div>

      {/* Wallet Modal */}
      <CustomModal open={open} onClose={handleCloseModal} allowClose={true}>
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl border border-white/20">
          {!showConfirmation ? (
            <>
              {/* Pack Display */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Image
                    src="/pack-all-random.png"
                    alt="3 CARDS PACK"
                    width={192}
                    height={192}
                    className="rounded-lg shadow-lg"
                    priority
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-md border border-gray-200">
                    <span className="text-xs font-semibold text-gray-800">3 CARDS PACK</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {isConnected ? '🎉 Ready to mint!' : '🔌 Connecting wallet...'}
                </h2>
                {isConnected && address && (
                  <p className="text-xs text-gray-600 font-mono truncate px-4 bg-gray-50 py-2 rounded-lg">
                    {address}
                  </p>
                )}
              </div>

              {/* Wallet Selector - Always show */}
              {!isMiniApp && !isConnected && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-semibold text-yellow-800">🔧 Wallet Selection</span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-3">Select a wallet to continue:</p>
                  
                  <div className="space-y-2">
                    {/* Coinbase Wallet */}
                    <button
                      onClick={() => setWalletType('coinbase')}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        walletType === 'coinbase'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100 rounded-full">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Coinbase Wallet</span>
                      </div>
                    </button>

                    {/* MetaMask */}
                    <button
                      onClick={() => setWalletType('metamask')}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        walletType === 'metamask'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 flex items-center justify-center bg-orange-100 rounded-full">
                          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">MetaMask</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Price Display */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    Pack Price: FREE (Gas only)
                  </div>
                  <div className="text-xs text-gray-600">
                    {isMiniApp ? '🎯 Farcaster Wallet' : 'Base Sepolia Testnet'}
                  </div>
                </div>
              </div>

              {/* Disconnect Button */}
              {isConnected && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full inline-flex items-center justify-center text-base font-semibold text-red-600 bg-white border-2 border-red-600 hover:bg-red-50 transition-colors"
                    style={{
                      borderRadius: '50px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                    }}
                  >
                    🔌 Disconnect Wallet
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 inline-flex items-center justify-center text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
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
                  disabled={isLoading || !isConnected || (!isMiniApp && !walletType)}
                  className="flex-1 inline-flex items-center justify-center text-base font-semibold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
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
                    '🎁 Buy Pack'
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success Confirmation */
            <div className="p-4">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-green-800 mb-3">
                🎉 NFTs Minted Successfully!
              </h3>
              
              {/* Thank You Message */}
              <div className="text-center mb-6">
                <p className="text-base text-green-700 mb-2 font-semibold">Thank you for your purchase!</p>
                <p className="text-sm text-green-600">Your 3 random cards have been minted to your wallet.</p>
              </div>

              {/* Transaction Details */}
              {transactionDetails && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl mb-6 border-2 border-green-200">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Transaction Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className="text-green-600 font-bold">✓ {transactionDetails.status}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-gray-600 font-medium">Payment:</span>
                      <span className="text-gray-800 font-semibold">{transactionDetails.payment}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-gray-600 font-medium">NFTs Minted:</span>
                      <span className="text-gray-800 font-semibold">{transactionDetails.nftsMinted}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-gray-600 font-medium">Token IDs:</span>
                      <span className="text-gray-800 font-mono text-xs">{transactionDetails.tokenIds}</span>
                    </div>
                    <div className="flex flex-col py-2">
                      <span className="text-gray-600 font-medium mb-2">Transaction Hash:</span>
                      <a 
                        href={`https://sepolia.basescan.org/tx/${transactionDetails.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono text-xs break-all underline"
                      >
                        {transactionDetails.transactionHash}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 inline-flex items-center justify-center text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
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
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors shadow-lg"
                  style={{
                    borderRadius: '50px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  🏠 Back to Main
                </button>
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
}

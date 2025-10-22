// app/components/carousel/mint-button.tsx
// Real minting implementation with BASE testnet
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../lib/hooks/use-toast";
import { useMintPack } from "../../../lib/hooks/useMintPack";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { mockContract } from "../../../lib/mock-contract";
import { useMiniAppContext } from "../../../lib/hooks/useMiniAppContext";
import { CustomModal } from "./custom-modal";

type Wallet = "warpcast" | "coinbase" | "metamask";
type Img = { id: number; src: string; alt: string };

interface MintButtonProps {
  /** Pools to draw from: exactly 1 random from each */
  randomFrom: {
    top: Img[];
    mid: Img[];
    bot: Img[];
  };
  /** Custom button text */
  customButtonText?: string;
  /** Show only selected pack (hide mid/bot) */
  showOnlySelected?: boolean;
}

export default function MintButton({ customButtonText }: MintButtonProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Additional check for actual wallet authentication
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  
  // Check if wallet is actually authenticated (not just detected)
  const checkWalletAuthentication = async () => {
    if (!address) {
      setIsWalletAuthenticated(false);
      return false;
    }
    
    try {
      // Check if wallet is actually unlocked and address matches
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const isUnlocked = accounts && accounts.length > 0;
      const addressMatches = accounts && accounts[0] && accounts[0].toLowerCase() === address.toLowerCase();
      
      setIsWalletAuthenticated(isUnlocked && addressMatches);
      return isUnlocked && addressMatches;
    } catch (error) {
      console.error('Wallet authentication check failed:', error);
      setIsWalletAuthenticated(false);
      return false;
    }
  };

  // Check wallet authentication when connection status changes
  useEffect(() => {
    if (isConnected && address) {
      checkWalletAuthentication();
    } else {
      setIsWalletAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  // Mini App context detection
  const { isMiniApp, isLoading: isContextLoading } = useMiniAppContext();
  
  // Minting state
  const [showOverlay, setShowOverlay] = useState(false);
  const [, setClickCount] = useState(0); // Used by reset overlay
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    status: string;
    payment: string;
    nftsMinted: string;
    tokenIds: string;
    transactionHash: string;
    isMock: boolean;
  } | null>(null);
  const [useRealContract, setUseRealContract] = useState(false);
  const [walletType, setWalletType] = useState<Wallet | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  // const [allowModalClose, setAllowModalClose] = useState(true);
  const [open, setOpen] = useState(false);

  const { mintPack, isLoading } = useMintPack();

  // Auto-connect in Mini App context
  useEffect(() => {
    if (isMiniApp && !isContextLoading && !isConnected && open) {
      // Auto-connect to first available connector in Mini App
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    }
  }, [isMiniApp, isContextLoading, isConnected, open, connectors, connect]);

  // Handle minting
  const handleMint = async () => {
    console.log('Mint attempt - isMiniApp:', isMiniApp, 'isConnected:', isConnected, 'useRealContract:', useRealContract, 'walletType:', walletType);
    
    if (!isMiniApp && useRealContract && (!isConnected || !isWalletAuthenticated)) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet to continue with real minting.",
        variant: "destructive",
      });
      return;
    }

    if (!isMiniApp && useRealContract && !walletType) {
      toast({
        title: "No Wallet Selected",
        description: "Please select a wallet option first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatus('Minting NFTs...');
      
      if ((isMiniApp && isConnected) || (!isMiniApp && useRealContract && isConnected)) {
        // Real contract minting
        console.log('🔄 Calling real mintPack...');
        const mintResult = await mintPack();
        
        if (mintResult.success) {
          setConnectionStatus('NFTs minted successfully!');
          setTransactionDetails({
            status: 'Confirmed',
            payment: '0.001 ETH',
            nftsMinted: '3 Cards',
            tokenIds: '1, 2, 3',
            transactionHash: mintResult.transactionHash || 'N/A',
            isMock: false
          });
          setShowConfirmation(true);
          
          toast({
            title: "NFTs Minted Successfully!",
            description: `Transaction: ${mintResult.transactionHash}`,
          });
        } else {
          setConnectionStatus(`Minting failed: ${mintResult.error}`);
          toast({
            title: "Minting Failed",
            description: mintResult.error || "Unknown error occurred",
            variant: "destructive",
          });
        }
      } else if (!isMiniApp && !useRealContract) {
        // Mock minting
        console.log('🔄 Calling mock mintPack...');
        const mockResult = await mockContract.mintPack();
        
        if (mockResult.success) {
          setConnectionStatus('Mock NFTs minted successfully!');
          setTransactionDetails({
            status: 'Mock Confirmed',
            payment: 'Mock payment (testing)',
            nftsMinted: '3 Cards',
            tokenIds: '1, 2, 3',
            transactionHash: mockResult.transactionHash || 'Mock-123456',
            isMock: true
          });
          setShowConfirmation(true);
          
          toast({
            title: "Mock NFTs Minted!",
            description: "This was a test transaction.",
          });
        } else {
          setConnectionStatus(`Mock minting failed: ${mockResult.error}`);
          toast({
            title: "Mock Minting Failed",
            description: mockResult.error || "Unknown error occurred",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Minting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionStatus(`Error: ${errorMessage}`);
      
      toast({
        title: "Minting Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    if (!walletType) {
      toast({
        title: "No Wallet Selected",
        description: "Please select a wallet option first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatus('Connecting to wallet...');
      
      // Find the target connector
      let targetConnector = null;
      
      if (walletType === 'metamask') {
        // Look for MetaMask specifically, exclude Coinbase
        targetConnector = connectors.find(connector => 
          connector.name.toLowerCase().includes('metamask') && 
          !connector.name.toLowerCase().includes('coinbase')
        );
      } else if (walletType === 'coinbase') {
        targetConnector = connectors.find(connector => 
          connector.name.toLowerCase().includes('coinbase')
        );
      } else if (walletType === 'warpcast') {
        targetConnector = connectors.find(connector => 
          connector.name.toLowerCase().includes('warpcast')
        );
      }

      if (!targetConnector) {
        const availableConnectors = connectors.map(c => ({ id: c.id, name: c.name }));
        console.log('Available connectors:', availableConnectors);
        throw new Error(`Wallet not found. Available connectors: ${availableConnectors.map(c => c.name).join(', ')}`);
      }

      console.log('Connecting to:', targetConnector.name);
      await connect({ connector: targetConnector });
      
      // Wait for connection to be established
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts && !isConnected) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (isConnected) {
        setConnectionStatus('✅ Connected to wallet! You can now mint NFTs.');
        toast({
          title: "Wallet Connected!",
          description: "You can now mint NFTs.",
        });
      } else {
        setConnectionStatus('❌ Connection timed out. Please try again.');
        toast({
          title: "Connection Timeout",
          description: "Please try connecting again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionStatus(`❌ Connection failed: ${errorMessage}`);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Reset overlay when modal opens/closes
  useEffect(() => {
    if (open) {
      setShowConfirmation(false);
      setTransactionDetails(null);
    }
  }, [open]);

  // Generate random selection (used by reset overlay)
  // const getRandomSelection = () => {
  //   const top = randomFrom.top[Math.floor(Math.random() * randomFrom.top.length)];
  //   const mid = randomFrom.mid[Math.floor(Math.random() * randomFrom.mid.length)];
  //   const bot = randomFrom.bot[Math.floor(Math.random() * randomFrom.bot.length)];
  //   return [top, mid, bot];
  // };

  // const [selectedPack, setSelectedPack] = useState<Img[]>([]);

  // Update selected pack when randomFrom changes
  // useEffect(() => {
  //   setSelectedPack(getRandomSelection());
  // }, [randomFrom]);

  // const handleClick = () => {
  //   const newCount = clickCount + 1;
  //   setClickCount(newCount);
  //   
  //   if (newCount >= 3) {
  //     setShowOverlay(true);
  //   }
  // };

  const handleReset = () => {
    setClickCount(0);
    setShowOverlay(false);
    // setSelectedPack(getRandomSelection());
  };

  const handleBuyPack = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setShowConfirmation(false);
    setTransactionDetails(null);
    setConnectionStatus('');
  };

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting wallet and closing modal');
    // Disconnect wallet
    disconnect();
    // Reset UI state
    setConnectionStatus('Wallet disconnected');
    setWalletType(null);
    setIsWalletAuthenticated(false);
    // Close modal
    setOpen(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={handleBuyPack}
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

      {/* Reset Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reset</h3>
              <p className="text-sm text-gray-600 mb-6">and explore more!</p>
            </div>
            <button
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center text-sm font-semibold text-white transition-colors"
              style={{
                borderRadius: '50px',
                paddingTop: '12px',
                paddingBottom: '12px',
                backgroundColor: '#E4804A',
                animation: 'pulsateButton 1.5s ease-in-out infinite',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Wallet Selection Modal */}
       <CustomModal open={open} onClose={handleCloseModal} allowClose={true}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose your wallet</h2>
          </div>

          {/* Testing Toggle - Only show in browser mode */}
          {!isMiniApp && (
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useRealContract}
                  onChange={(e) => setUseRealContract(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">☑ Use Real Contract (requires wallet connection)</span>
              </label>
            </div>
          )}

          {/* Pack Price Display */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700">
                Pack Price: 0.001 ETH
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {isMiniApp ? 'Connected to Warpcast wallet' : (useRealContract ? 'Real payment required' : 'Mock payment (testing)')}
              </div>
            </div>
          </div>

          {/* Wallet Selector - Only show in browser mode */}
          {!isMiniApp && (
            <div className="mb-6 space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-3">Wallet Options:</div>
              
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  walletType === 'coinbase' 
                    ? 'border-blue-400 bg-blue-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setWalletType('coinbase')}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Coinbase Wallet</span>
                </div>
              </div>

              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  walletType === 'warpcast' 
                    ? 'border-blue-400 bg-blue-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setWalletType('warpcast')}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Warpcast Wallet</span>
                </div>
              </div>

              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  walletType === 'metamask' 
                    ? 'border-blue-400 bg-blue-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setWalletType('metamask')}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">MetaMask Wallet</span>
                </div>
              </div>
            </div>
          )}

          {/* Disconnect Wallet Button - Only show when connected */}
          {isConnected && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full inline-flex items-center justify-center text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
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
            
            {!isMiniApp && useRealContract && !isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={!walletType || isPending}
                className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                style={{
                  borderRadius: '50px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            ) : (
              <button
                onClick={handleMint}
                disabled={isLoading}
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
                    {useRealContract ? 'Minting...' : 'Processing...'}
                  </>
                ) : (
                  'Buy Pack'
                )}
              </button>
            )}
          </div>

          {/* System Message Display */}
          {connectionStatus && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-medium text-yellow-800 mb-1">System Message:</div>
              <div className="text-xs text-yellow-700">{connectionStatus}</div>
              <div className="text-xs text-yellow-600 mt-1">
                This area will show the actual system messages that appear in the top-right corner.
              </div>
            </div>
          )}

          {/* Confirmation View */}
          {showConfirmation && transactionDetails && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
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

              <div className="bg-white p-3 rounded-lg mb-4">
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Hash:</span>
                    <span className="text-gray-800 font-mono text-xs">{transactionDetails.transactionHash}</span>
                  </div>
                  {transactionDetails.isMock && (
                    <div className="text-yellow-600 text-xs mt-2 p-2 bg-yellow-50 rounded">
                      ⚠️ This was a mock transaction for testing purposes.
                    </div>
                  )}
                </div>
              </div>

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
                    // Navigate to main page
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

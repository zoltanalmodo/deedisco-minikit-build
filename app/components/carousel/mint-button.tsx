// app/components/carousel/mint-button.tsx
// Real minting implementation with BASE testnet
"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../lib/hooks/use-toast";
import { useMintPack } from "../../../lib/hooks/useMintPack";
import { useAccount, useConnect } from "wagmi";
import { mockContract } from "../../../lib/mock-contract";
import { useMiniAppContext } from "../../../lib/hooks/useMiniAppContext";

type Wallet = "warpcast" | "coinbase" | "metamask";
type Img = { id: number; src: string; alt: string };

interface MintButtonProps {
  /** Pools to draw from: exactly 1 random from each */
  randomFrom: {
    top: Img[];
    mid: Img[];
    bot: Img[];
  };
  /** Your mint hook (upload, metadata, contract call, etc.) */
  onMint?: (params: { pack: Img[]; wallet: Wallet }) => Promise<void> | void;
  /** Custom button text */
  customButtonText?: string;
  /** Show only selected pack (hide mid/bot) */
  showOnlySelected?: boolean;
}

export default function MintButton({ randomFrom, onMint, customButtonText, showOnlySelected = false }: MintButtonProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { mintPack, isLoading, result, error } = useMintPack();
  const { isMiniApp, isLoading: isContextLoading } = useMiniAppContext();
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [useRealContract, setUseRealContract] = useState(false); // Toggle for testing
  const [transactionDetails, setTransactionDetails] = useState<{
    success: boolean;
    transactionHash?: string;
    tokenIds?: number[];
    isMock?: boolean;
    paymentAmount?: string;
  } | null>(null);
  const [walletType, setWalletType] = useState<Wallet>("warpcast");
  const [pack, setPack] = useState<Img[]>([]); // the locked random set for this modal open
  const [connectionStatus, setConnectionStatus] = useState<string>("Ready to connect");

  // ---- crypto-safe random helpers (no user shuffle UI) ----
  function cryptoIndex(n: number) {
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      const buf = new Uint32Array(1);
      const max = Math.floor(0xffffffff / n) * n; // rejection sampling, avoid modulo bias
      while (true) {
        window.crypto.getRandomValues(buf);
        const r = buf[0];
        if (r < max) return r % n;
      }
    }
    return Math.floor(Math.random() * n); // fallback
  }
  function pickOne<T>(arr: T[]): T {
    if (!arr || arr.length === 0) throw new Error("Empty image pool");
    return arr[cryptoIndex(arr.length)];
  }

  // Roll exactly once per modal open; no way for user to change it
  useEffect(() => {
    if (open) {
      const rolled = [pickOne(randomFrom.top), pickOne(randomFrom.mid), pickOne(randomFrom.bot)];
      setPack(rolled);
      // Reset confirmation state when modal opens
      setShowConfirmation(false);
      setTransactionDetails(null);
    } else {
      setPack([]); // clear when closed
      // Reset confirmation state when modal closes
      setShowConfirmation(false);
      setTransactionDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-connect in Mini App context
  useEffect(() => {
    if (isMiniApp && !isContextLoading && !isConnected && open) {
      setConnectionStatus("Auto-connecting to Warpcast wallet...");
      // Auto-connect to the first available connector (should be Farcaster Mini App)
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    }
  }, [isMiniApp, isContextLoading, isConnected, open, connect, connectors]);

  const handleMint = async () => {
    if (!isMiniApp && useRealContract && !isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint NFTs.",
        variant: "destructive",
      });
      return;
    }

    try {
      if ((isMiniApp && isConnected) || (!isMiniApp && useRealContract && isConnected)) {
        // Use real contract with actual wallet connection
        const mintResult = await mintPack();
        
        if (mintResult.success) {
          setTransactionDetails({
            success: true,
            transactionHash: mintResult.transactionHash,
            tokenIds: mintResult.tokenIds,
            isMock: false,
            paymentAmount: "0.001 ETH"
          });
          setShowConfirmation(true);
        } else {
          toast({
            title: "Minting Failed",
            description: mintResult.error || "There was an error minting your NFTs. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Use mock contract for testing
        const mockAddress = address || "0x1234567890123456789012345678901234567890";
        const mockResult = await mockContract.mintPack(mockAddress, 3);
        
        if (mockResult.success) {
          setTransactionDetails({
            success: true,
            transactionHash: mockResult.transactionHash,
            tokenIds: mockResult.tokenIds,
            isMock: true,
            paymentAmount: "0.001 ETH"
          });
          setShowConfirmation(true);
        } else {
          toast({
            title: "Minting Failed",
            description: "There was an error minting your NFTs. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFTs. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="text-white font-semibold shadow-lg transition-colors text-sm sm:text-base"
          style={{ 
            backgroundColor: '#131312',
            borderRadius: '50px', // Capsule shape - half the height
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            paddingTop: '16px',
            paddingBottom: '16px',
            paddingLeft: '32px',
            paddingRight: '32px'
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0a0a0a'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#131312'}
        >
          {customButtonText || "Buy a pack of random parts"}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          {showConfirmation ? (
            // Confirmation Content
            <>
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <Dialog.Title className="text-2xl font-bold text-center mb-2" style={{ color: '#131212' }}>
                {transactionDetails?.isMock ? "NFTs Minted Successfully! (Mock)" : "NFTs Minted Successfully!"}
              </Dialog.Title>

              {/* Thank you message */}
              <div className="text-center mb-6">
                <p className="text-lg mb-2" style={{ color: '#131212' }}>
                  Thank you for your purchase!
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
                  Your 3 random cards have been minted to your wallet.
                </p>
              </div>

              {/* Transaction Details */}
              {transactionDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3" style={{ color: '#131212' }}>Transaction Details</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: '#666' }}>Status:</span>
                      <span className="font-semibold text-green-600">Confirmed</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span style={{ color: '#666' }}>Payment:</span>
                      <span className="font-semibold" style={{ color: '#131212' }}>{transactionDetails?.paymentAmount || '0.001 ETH'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span style={{ color: '#666' }}>NFTs Minted:</span>
                      <span className="font-semibold" style={{ color: '#131212' }}>3 Cards</span>
                    </div>
                    
                    {transactionDetails?.tokenIds && (
                      <div className="flex justify-between">
                        <span style={{ color: '#666' }}>Token IDs:</span>
                        <span className="font-mono text-xs" style={{ color: '#131212' }}>
                          {transactionDetails?.tokenIds?.join(', ') || 'N/A'}
                        </span>
                      </div>
                    )}
                    
                    {transactionDetails?.transactionHash && (
                      <div className="flex justify-between">
                        <span style={{ color: '#666' }}>Transaction:</span>
                        <span className="font-mono text-xs" style={{ color: '#131212' }}>
                          {transactionDetails?.transactionHash?.slice(0, 10) || 'N/A'}...
                        </span>
                      </div>
                    )}
                    
                    {transactionDetails?.isMock && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                        ⚠️ This is a mock transaction for testing purposes
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setTransactionDetails(null);
                    setOpen(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderRadius: '50px',
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 900,
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    border: '2px solid #3B82F6',
                    color: '#3B82F6'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setTransactionDetails(null);
                    setOpen(false);
                    // Navigate back to main page
                    window.location.href = '/';
                  }}
                  className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-white shadow"
                  style={{ 
                    backgroundColor: '#131212',
                    borderRadius: '50px',
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 900,
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    paddingLeft: '32px',
                    paddingRight: '32px'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0a0a0a'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#131312'}
                >
                  Back to Main
                </button>
              </div>
            </>
          ) : (
            // Original Wallet Selection Content
            <>
              {/* Selected Pack Image - moved to top */}
              <div className="flex justify-center mb-4">
                <div className={`grid gap-2 ${showOnlySelected ? "" : "grid-cols-3"}`}>
                  {(pack.length ? pack : new Array(showOnlySelected ? 1 : 3).fill(null)).map((img, i) => {
                    // If showOnlySelected is true, only show the first item (top)
                    if (showOnlySelected && i > 0) return null;
                    
                    return (
                      <div
                        key={i}
                        className={`relative ${showOnlySelected ? "aspect-square w-48" : "h-20"} overflow-hidden rounded-lg border border-white/20 ${
                          img ? "" : "animate-pulse bg-white/10"
                        }`}
                      >
                        {img && (
                          <Image
                            src={img.src || "/placeholder.svg"}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes={showOnlySelected ? "192px" : "80px"}
                            priority={i < 3}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Dialog.Description className="text-base text-center mb-4" style={{ color: '#131212' }}>
                Choose your wallet
              </Dialog.Description>

              {/* Testing Toggle - Only show in browser mode */}
              {!isMiniApp && (
                <div className="mb-4 flex items-center justify-center gap-2">
                  <label className="flex items-center gap-2 text-sm" style={{ color: '#131212' }}>
                    <input
                      type="checkbox"
                      checked={useRealContract}
                      onChange={(e) => setUseRealContract(e.target.checked)}
                      className="rounded"
                    />
                    Use Real Contract (requires wallet connection)
                  </label>
                </div>
              )}

              {/* Pack Price Display */}
              <div className="mb-4 text-center">
                <div className="text-lg font-semibold" style={{ color: '#131212' }}>
                  Pack Price: 0.001 ETH
                </div>
                <div className="text-sm" style={{ color: '#666' }}>
                  {isMiniApp ? "Connected to Warpcast wallet" : (useRealContract ? "Real payment required" : "Mock payment (testing)")}
                </div>
              </div>

              {/* Wallet selector - Only show in browser mode */}
              {!isMiniApp && (
                <div className="space-y-3">
                  <WalletCard
                    id="coinbase"
                    label="Coinbase Wallet"
                    desc=""
                    icon="coinbase"
                    selected={walletType === "coinbase"}
                    onSelect={() => setWalletType("coinbase")}
                  />
                  <WalletCard
                    id="warpcast"
                    label="Warpcast Wallet"
                    desc=""
                    icon="warpcast"
                    selected={walletType === "warpcast"}
                    onSelect={() => setWalletType("warpcast")}
                  />
                  <WalletCard
                    id="metamask"
                    label="MetaMask Wallet"
                    desc=""
                    icon="metamask"
                    selected={walletType === "metamask"}
                    onSelect={() => setWalletType("metamask")}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-between gap-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center text-sm font-semibold"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderRadius: '50px',
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 900,
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '32px',
                      paddingRight: '32px',
                      border: '2px solid #3B82F6',
                      color: '#3B82F6'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                </Dialog.Close>

    {(!isMiniApp && useRealContract && !isConnected) ? (
      <button
        onClick={async () => {
          setConnectionStatus(`Attempting to connect ${walletType} wallet...`);
          
          // Debug: Log available connectors
          console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
          
          try {
            let targetConnector;
            
            if (walletType === "metamask") {
              // Find MetaMask connector - be more specific
              targetConnector = connectors.find(connector => {
                const name = connector.name.toLowerCase();
                const id = connector.id.toLowerCase();
                return (
                  name.includes('metamask') || 
                  id.includes('metamask') ||
                  (name.includes('injected') && !name.includes('coinbase')) ||
                  (id.includes('injected') && !id.includes('coinbase'))
                );
              });
              
              // If MetaMask not found, don't fallback to other connectors
              if (!targetConnector) {
                setConnectionStatus("MetaMask connector not found. Please ensure MetaMask extension is installed and enabled.");
                toast({
                  title: "MetaMask Not Found",
                  description: "MetaMask extension not detected. Please install and enable MetaMask.",
                  variant: "destructive",
                });
                return; // Exit early, don't try to connect
              }
            } else if (walletType === "coinbase") {
              // Find Coinbase Wallet connector - be specific
              targetConnector = connectors.find(connector => {
                const name = connector.name.toLowerCase();
                const id = connector.id.toLowerCase();
                return (
                  name.includes('coinbase') ||
                  id.includes('coinbase') ||
                  (name.includes('injected') && name.includes('coinbase'))
                );
              });
            } else if (walletType === "warpcast") {
              // Find Warpcast connector (should use Coinbase)
              targetConnector = connectors.find(connector => {
                const name = connector.name.toLowerCase();
                const id = connector.id.toLowerCase();
                return (
                  name.includes('coinbase') ||
                  id.includes('coinbase') ||
                  (name.includes('injected') && name.includes('coinbase'))
                );
              });
            }
            
            if (targetConnector) {
              setConnectionStatus(`Connecting to ${walletType}...`);
              await connect({ connector: targetConnector });
              setConnectionStatus(`${walletType} wallet connected successfully!`);
            } else {
              const availableConnectors = connectors.map(c => c.name).join(', ');
              setConnectionStatus(`${walletType} not found. Available connectors: ${availableConnectors}`);
              toast({
                title: `${walletType} Not Found`,
                description: `Available connectors: ${availableConnectors}`,
                variant: "destructive",
              });
            }
          } catch (error) {
            setConnectionStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            toast({
              title: "Connection Failed",
              description: `Failed to connect to ${walletType}. Please try again.`,
              variant: "destructive",
            });
          }
        }}
        disabled={isPending}
        className="inline-flex items-center justify-center text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
        style={{ 
          backgroundColor: '#3B82F6',
          borderRadius: '50px', // Stadium shape
          fontFamily: 'Fraunces, serif',
          fontWeight: 900,
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '32px',
          paddingRight: '32px'
        }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B82F6'}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>
    ) : (
                  <button
                    type="button"
                    onClick={handleMint}
                    disabled={isLoading || pack.length !== 3}
                    className="inline-flex items-center justify-center text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ 
                      backgroundColor: '#131212',
                      borderRadius: '50px', // Capsule shape - half the height
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 900,
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '32px',
                      paddingRight: '32px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0a0a0a'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#131312'}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      "Buy Pack"
                    )}
                  </button>
                )}
              </div>

              {/* System Message Display - NEW SECTION BELOW BOTH BUTTONS */}
              <div className="mt-4 text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200" style={{ maxWidth: '100%' }}>
                <div className="text-sm font-medium" style={{ color: '#B45309' }}>
                  System Message:
                </div>
                <div className="text-xs mt-1" style={{ color: '#92400E' }}>
                  {connectionStatus || "Click 'Connect Wallet' to see wallet connection messages here"}
                </div>
                <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  This area will show the actual system messages that appear in the top-right corner
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function WalletCard(props: {
  id: string;
  label: string;
  desc: string;
  icon: "warpcast" | "coinbase" | "metamask";
  selected: boolean;
  onSelect: () => void;
}) {
  const { id, label, desc, icon, selected, onSelect } = props;
  return (
    <label
      htmlFor={id}
      className={[
        "group flex items-center cursor-pointer rounded-lg border p-3 transition-colors",
        selected ? "border-blue-400 bg-blue-100" : "border-gray-300 hover:bg-gray-50",
      ].join(" ")}
      onClick={onSelect}
    >
      <input id={id} type="radio" name="wallet" className="sr-only" checked={selected} readOnly />
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 mr-3">
        {icon === "warpcast" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
        ) : icon === "coinbase" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <circle cx="12" cy="12" r="9" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 18V6" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: '#131212' }}>{label}</p>
      </div>
    </label>
  );
}

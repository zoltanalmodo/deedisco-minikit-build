// app/components/carousel/mint-button.tsx
// after random selection implemented
"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../lib/hooks/use-toast";

type Wallet = "warpcast" | "coinbase";
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
  const [open, setOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [walletType, setWalletType] = useState<Wallet>("warpcast");
  const [pack, setPack] = useState<Img[]>([]); // the locked random set for this modal open

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
    } else {
      setPack([]); // clear when closed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMint = async () => {
    setIsMinting(true);
    try {
      await onMint?.({ pack, wallet: walletType });
      if (!onMint) await new Promise((r) => setTimeout(r, 1000)); // demo delay

      toast({
        title: "NFTs Minted Successfully!",
        description: `${pack.length} NFTs have been minted to your ${
          walletType === "warpcast" ? "Warpcast" : "Coinbase"
        } wallet.`,
      });
      setOpen(false);
    } catch {
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFTs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
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

          {/* Wallet selector */}
          <div className="grid grid-cols-2 gap-3">
            <WalletCard
              id="warpcast"
              label="Option 1"
              desc="Warpcast Wallet"
              icon="warpcast"
              selected={walletType === "warpcast"}
              onSelect={() => setWalletType("warpcast")}
            />
            <WalletCard
              id="coinbase"
              label="Option 2"
              desc="Coinbase Wallet"
              icon="coinbase"
              selected={walletType === "coinbase"}
              onSelect={() => setWalletType("coinbase")}
            />
          </div>


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

            <button
              type="button"
              onClick={handleMint}
              disabled={isMinting || pack.length !== 3}
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
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buying...
                </>
              ) : (
                "Buy Pack"
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function WalletCard(props: {
  id: string;
  label: string;
  desc: string;
  icon: "warpcast" | "coinbase";
  selected: boolean;
  onSelect: () => void;
}) {
  const { id, label, desc, icon, selected, onSelect } = props;
  return (
    <label
      htmlFor={id}
      className={[
        "group block cursor-pointer rounded-lg border p-3 transition-colors",
        selected ? "border-blue-400 bg-blue-100" : "border-gray-300 hover:bg-gray-50",
      ].join(" ")}
      onClick={onSelect}
    >
      <input id={id} type="radio" name="wallet" className="sr-only" checked={selected} readOnly />
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
        {icon === "warpcast" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <circle cx="12" cy="12" r="9" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 18V6" />
          </svg>
        )}
      </div>
      <div className="text-xs">
        <p className="font-semibold text-sm" style={{ color: '#131212' }}>{label}</p>
        <p className="text-xs mt-1" style={{ color: '#666' }}>{desc}</p>
      </div>
    </label>
  );
}

"use client"

import { useState, useEffect } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import PackCarousel from "@/app/components/carousel/pack-carousel"
import MintButton from "@/app/components/carousel/mint-button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

// Pack data - 4 pack options as requested
const packData = [
  { id: 1, src: "/pack-all-random.png", alt: "All Random Pack", name: "All Random Pack" },
  { id: 2, src: "/pack-guaranteed-top.png", alt: "Guaranteed Top Pack", name: "Guaranteed Top Pack" },
  { id: 3, src: "/pack-guaranteed-mid.png", alt: "Guaranteed Mid Pack", name: "Guaranteed Mid Pack" },
  { id: 4, src: "/pack-guaranteed-bot.png", alt: "Guaranteed Bot Pack", name: "Guaranteed Bot Pack" },
]

export default function PackSelection() {
  const { setFrameReady, isFrameReady } = useMiniKit()
  const [selectedPack, setSelectedPack] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFrameReady) {
        setFrameReady()
        console.log("Frame ready signal sent via MiniKit")
      }
    }, 100)

    if (typeof window !== "undefined") {
      const isInIframe = window !== window.parent
      console.log("Is in iframe:", isInIframe)
      window.parent.postMessage({ type: "frame-ready" }, "*")
      console.log("Direct frame ready signal sent (type)")
      window.parent.postMessage({ method: "ready" }, "*")
      console.log("Farcaster SDK ready signal sent (method)")
    }

    return () => clearTimeout(timer)
  }, [setFrameReady, isFrameReady])

  const handlePackSelect = (packIndex: number) => {
    setSelectedPack(packIndex)
  }

  // Get description text based on selected pack
  const getPackDescription = (packIndex: number) => {
    switch (packIndex) {
      case 0: // all random pack
        return "all 3 cards are random"
      case 1: // guaranteed top pack
        return "one guaranteed top card, two random cards"
      case 2: // guaranteed mid pack
        return "one guaranteed mid card, two random cards"
      case 3: // guaranteed bot pack
        return "one guaranteed bot card, two random cards"
      default:
        return "all 3 cards are random"
    }
  }

  return (
    <main
      className="flex flex-col items-center w-full max-w-md mx-auto px-2 py-1 bg-white text-black"
      style={{ minHeight: "100vh", overflowY: "auto" }}
    >
      <header className="text-center mb-1 pt-1 pb-1">
        <h1 className="text-2xl sm:text-2xl font-bold mb-1">
          Pick a pack and make it yours.
        </h1>
      </header>

      {/* Pack Carousel - Same size as 3 combined carousels */}
      <div className="w-full mb-4">
        <PackCarousel
          packs={packData}
          selectedIndex={selectedPack}
          onSelect={handlePackSelect}
        />
      </div>


      {/* Pack Description */}
      <div className="text-center mb-3">
        <p className="text-sm font-medium">
          {getPackDescription(selectedPack)}
        </p>
      </div>

      {/* Buy Button - Links to existing wallet popup */}
      <div className="flex justify-center w-full">
        <MintButton
          randomFrom={{
            top: [packData[selectedPack]], // Selected pack
            mid: [{ id: 0, src: "", alt: "Pack" }], // Dummy data
            bot: [{ id: 0, src: "", alt: "Pack" }], // Dummy data
          }}
          onMint={async ({ pack, wallet }) => {
            // Handle pack purchase here
            console.log("Purchasing pack", {
              requestedPack: pack,
              selectedPack: packData[selectedPack],
              wallet,
            })
          }}
          customButtonText={`Buy ${packData[selectedPack]?.name}`}
          showOnlySelected={true}
        />
      </div>

      {/* Back to Main page button - centered under buy button */}
      <div className="flex justify-center w-full mt-4">
        <Link href="/">
          <button className="flex items-center text-blue-600 hover:text-blue-500 transition-colors text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Main
          </button>
        </Link>
      </div>
    </main>
  )
}

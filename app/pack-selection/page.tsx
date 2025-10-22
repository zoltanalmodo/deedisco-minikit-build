"use client"

import { useState, useEffect } from "react"
import PackCarousel from "@/app/components/carousel/pack-carousel"
import MintButton from "@/app/components/carousel/mint-button"
import Link from "next/link"

// Pack data - 4 pack options as requested
const packData = [
  { id: 1, src: "/pack-all-random.png", alt: "All Random Pack", name: "All Random Pack" },
  { id: 2, src: "/pack-guaranteed-top.png", alt: "Guaranteed Top Pack", name: "Guaranteed Top Pack" },
  { id: 3, src: "/pack-guaranteed-mid.png", alt: "Guaranteed Mid Pack", name: "Guaranteed Mid Pack" },
  { id: 4, src: "/pack-guaranteed-bot.png", alt: "Guaranteed Bot Pack", name: "Guaranteed Bot Pack" },
]

export default function PackSelection() {
  const [selectedPack, setSelectedPack] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isInIframe = window !== window.parent
      console.log("Is in iframe:", isInIframe)
      window.parent.postMessage({ type: "frame-ready" }, "*")
      console.log("Direct frame ready signal sent (type)")
      window.parent.postMessage({ method: "ready" }, "*")
      console.log("Farcaster SDK ready signal sent (method)")
    }
  }, [])

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

      {/* Buy Button - Links to existing wallet popup */}
      <div className="flex justify-center w-full">
        <MintButton
          customButtonText={`Buy ${packData[selectedPack]?.name}`}
        />
      </div>

      {/* Pack Description */}
      <div className="text-center mt-4 mb-3">
        <p className="text-sm font-medium">
          {getPackDescription(selectedPack)}
        </p>
      </div>

      {/* Back button - centered under buy button */}
      <div className="flex justify-center w-full mt-4">
        <Link href="/">
          <button
            type="button"
            className="font-semibold transition-colors text-sm sm:text-base"
            style={{ 
              backgroundColor: 'transparent',
              borderRadius: '50px',
              fontFamily: 'Fraunces, serif',
              fontWeight: 900,
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '32px',
              paddingRight: '32px',
              border: '2px solid #8FC5FF',
              color: '#8FC5FF'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(143, 197, 255, 0.1)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            Back
          </button>
        </Link>
      </div>
    </main>
  )
}

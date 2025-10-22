// app/page.tsx
// after random selection implemented
// before implementing mining function on BASE testnet

"use client"

import { useState, useEffect } from "react"
import ImageCarousel from "@/app/components/carousel/image-carousel"
import Link from "next/link"

// updated with useMiniKit frameready hook and direct frame ready signals!
// back to working OK BUT embed valid is X

type Img = { id: number; src: string; alt: string }

const carouselData: { id: number; images: Img[] }[] = [
  {
    id: 1,
    images: [
      { id: 1, src: "/carousel1-image1.jpg", alt: "Carousel 1 Image 1" },
      { id: 2, src: "/carousel1-image2.jpg", alt: "Carousel 1 Image 2" },
      { id: 3, src: "/carousel1-image3.jpg", alt: "Carousel 1 Image 3" },
      { id: 4, src: "/carousel1-image4.jpg", alt: "Carousel 1 Image 4" },
      { id: 5, src: "/carousel1-image5.jpg", alt: "Carousel 1 Image 5" },
      { id: 6, src: "/carousel1-image6.jpg", alt: "Carousel 1 Image 6" },
      { id: 7, src: "/carousel1-image7.jpg", alt: "Carousel 1 Image 7" },
      { id: 8, src: "/carousel1-image8.jpg", alt: "Carousel 1 Image 8" },
    ],
  },
  {
    id: 2,
    images: [
      { id: 1, src: "/carousel2-image1.jpg", alt: "Carousel 2 Image 1" },
      { id: 2, src: "/carousel2-image2.jpg", alt: "Carousel 2 Image 2" },
      { id: 3, src: "/carousel2-image3.jpg", alt: "Carousel 2 Image 3" },
      { id: 4, src: "/carousel2-image4.jpg", alt: "Carousel 2 Image 4" },
      { id: 5, src: "/carousel2-image5.jpg", alt: "Carousel 2 Image 5" },
      { id: 6, src: "/carousel2-image6.jpg", alt: "Carousel 2 Image 6" },
      { id: 7, src: "/carousel2-image7.jpg", alt: "Carousel 2 Image 7" },
      { id: 8, src: "/carousel2-image8.jpg", alt: "Carousel 2 Image 8" },
    ],
  },
  {
    id: 3,
    images: [
      { id: 1, src: "/carousel3-image1.jpg", alt: "Carousel 3 Image 1" },
      { id: 2, src: "/carousel3-image2.jpg", alt: "Carousel 3 Image 2" },
      { id: 3, src: "/carousel3-image3.jpg", alt: "Carousel 3 Image 3" },
      { id: 4, src: "/carousel3-image4.jpg", alt: "Carousel 3 Image 4" },
      { id: 5, src: "/carousel3-image5.jpg", alt: "Carousel 3 Image 5" },
      { id: 6, src: "/carousel3-image6.jpg", alt: "Carousel 3 Image 6" },
      { id: 7, src: "/carousel3-image7.jpg", alt: "Carousel 3 Image 7" },
      { id: 8, src: "/carousel3-image8.jpg", alt: "Carousel 3 Image 8" },
    ],
  },
]

export default function Home() {

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

  // Preload first pack image for pack selection page
  useEffect(() => {
    const img = new Image()
    img.src = "/pack-all-random.png"
  }, [])

  // Carousels still have their own selection state for browsing,
  // but MintButton will ignore it and mint a random top/mid/bot.
  const [selectedImages, setSelectedImages] = useState([0, 0, 0])
  
  // Overlay state - becomes true after 6 navigation button clicks
  const [showOverlay, setShowOverlay] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [resetTrigger, setResetTrigger] = useState(0)
  const CLICK_THRESHOLD = 6

  const handleImageSelect = (carouselIndex: number, imageIndex: number) => {
    const next = [...selectedImages]
    next[carouselIndex] = imageIndex
    setSelectedImages(next)
  }

  // Handle navigation button clicks - show overlay after 6 clicks
  const handleNavigationClick = () => {
    // Don't increment if we've already reached the threshold
    if (clickCount >= CLICK_THRESHOLD) {
      return
    }
    
    const newClickCount = clickCount + 1
    setClickCount(newClickCount)
    
    if (newClickCount >= CLICK_THRESHOLD) {
      setShowOverlay(true)
    }
  }

  // Reset to original state - clear overlay and reset all carousels to index 0
  const handleReset = () => {
    setShowOverlay(false)
    setClickCount(0)
    setSelectedImages([0, 0, 0])
    setResetTrigger(prev => prev + 1) // Trigger carousel reset
  }

  return (
    <main
      className="flex flex-col items-center w-full max-w-[450px] mx-auto px-0 py-1 bg-white text-black no-scrollbar"
      style={{ 
        minHeight: "100vh", 
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}
    >
      <header className="text-center mb-1">
        <h1 className="text-2xl sm:text-2xl font-bold mb-1">
          Build Your Collection!
        </h1>
        <h2 className="text-xs sm:text-sm font-semibold mb-1">
          Combine 3 Cards - Top, Middle, Bottom
        </h2>
      </header>

      {/* Carousel container with reset button overlay - retry deployment */}
      <div className="relative w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] mt-4 mb-2 p-0 mx-auto">
        <div className="carousel-container w-full h-full">
          {carouselData.map((carousel, index) => (
            <div
              key={carousel.id}
              className="m-0 p-0"
              style={{ 
                margin: "0px", 
                padding: "0px"
              }}
            >
              <ImageCarousel
                images={carousel.images}
                selectedIndex={selectedImages[index]}
                onSelect={(imageIndex) => handleImageSelect(index, imageIndex)}
                onNavigationClick={handleNavigationClick}
                showOverlay={showOverlay}
                resetTrigger={resetTrigger}
              />
            </div>
          ))}
        </div>

        {/* Reset button overlay - shows when threshold reached */}
        {showOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 gap-2">
            <button
              onClick={handleReset}
              className="text-white font-semibold"
              style={{ 
                backgroundColor: '#E4804A',
                borderRadius: '50px',
                fontFamily: 'Fraunces, serif',
                fontWeight: 900,
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '32px',
                paddingRight: '32px',
                animation: 'pulsateButton 1.5s ease-in-out infinite'
              }}
            >
              Reset
            </button>
            <span className="text-xs" style={{ color: '#8B7355' }}>to explore more!</span>
          </div>
        )}
      </div>

      {/* Progress indicator moved below carousel */}
      <div className="mb-1 min-h-[20px] flex items-center justify-center">
        {clickCount < CLICK_THRESHOLD && (
          /* Show progress indicator when clicks < 6 */
          <div className="text-xs flex items-center justify-center gap-2 progress-indicator">
            <div className="flex gap-1">
              {Array.from({ length: CLICK_THRESHOLD }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i >= (CLICK_THRESHOLD - clickCount) ? "border-2 border-gray-300" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 mb-1 flex justify-center w-full">
        <Link href="/pack-selection">
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
            Buy a 3-card pack
          </button>
        </Link>
      </div>

      {/* Description text moved after buy button */}
      <div className="text-center mt-4 mb-2">
        <p className="text-xs sm:text-sm">
          Collect, trade, complete originals or create new sets.<br />
          Earn license fees on every reuse!
        </p>
      </div>

    </main>
  )
}

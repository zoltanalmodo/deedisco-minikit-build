// app/page.tsx
// after random selection implemented
// reverted to commit d692ac7

"use client"

import { useState, useEffect } from "react"
import ImageCarousel from "@/app/components/carousel/image-carousel"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
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
  const { setFrameReady, isFrameReady } = useMiniKit()

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

      {/* Carousel container - retry deployment */}
      <div className="carousel-container w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] m-0 p-0 mx-auto">
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

      {/* Progress indicator and notification moved below carousel */}
      <div className="mb-1 min-h-[20px] flex items-center justify-center">
        {clickCount < CLICK_THRESHOLD ? (
          /* Show progress indicator when clicks < 6 */
          <div className="text-xs flex items-center justify-center gap-2 progress-indicator">
            <span>Explore the collection! </span>
            <div className="flex gap-1">
              {Array.from({ length: CLICK_THRESHOLD }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i >= (CLICK_THRESHOLD - clickCount) ? "bg-gray-300" : "bg-blue-400"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Show notification when clicks >= 6 */
          <div className="text-sm animate-pulse flex items-center justify-center gap-2 notification-text">
            <span>🔒 Cards are hidden - </span>
            <button
              onClick={handleReset}
              className="text-sm px-2 py-1 rounded transition-colors reset-button"
            >
              Reset
            </button>
            <span> to explore more!</span>
          </div>
        )}
      </div>

      <div className="mt-4 mb-2 flex justify-center w-full">
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
      <div className="text-center mb-2">
        <p className="text-xs sm:text-sm">
          Collect, trade, complete originals or create new sets.<br />
          Earn license fees on every reuse!
        </p>
      </div>

    </main>
  )
}

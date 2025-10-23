"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Pack {
  id: number
  src: string
  alt: string
  name: string
}

interface PackCarouselProps {
  packs: Pack[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function PackCarousel({
  packs,
  selectedIndex,
  onSelect,
}: PackCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)

  // Preload all images in the background
  useEffect(() => {
    packs.forEach((pack) => {
      const img = new Image()
      img.src = pack.src
    })
  }, [packs])

  // Reset to selected index when it changes
  useEffect(() => {
    setCurrentIndex(selectedIndex)
  }, [selectedIndex])

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + packs.length) % packs.length
    setCurrentIndex(newIndex)
    onSelect(newIndex)
  }

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % packs.length
    setCurrentIndex(newIndex)
    onSelect(newIndex)
  }

  return (
    <div className="relative w-full m-0 p-0" style={{ margin: "0px", padding: "0px" }}>
      <div className="overflow-hidden m-0 p-0" style={{ margin: "0px", padding: "0px" }}>
        {/* Single carousel with same dimensions as 3 combined carousels */}
        <div 
          className="relative w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] bg-black m-0 p-0 mx-auto" 
          style={{ 
            margin: "0px", 
            padding: "0px"
          }}
        >
          {packs.map((pack, index) => (
            <div
              key={pack.id}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 flex items-center justify-center ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative h-full w-full">
                <Image
                  src={pack.src}
                  alt={pack.alt}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', pack.src, e);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={handlePrevious}
        className="absolute top-1/2 -translate-y-1/2 z-10 p-6 rounded-full"
        style={{ left: '-20px', background: 'transparent' }}
        aria-label="Previous pack"
      >
        <ChevronLeft className="h-5 w-5 text-black" />
      </button>

      <button
        onClick={handleNext}
        className="absolute top-1/2 -translate-y-1/2 z-10 p-6 rounded-full"
        style={{ right: '-20px', background: 'transparent' }}
        aria-label="Next pack"
      >
        <ChevronRight className="h-5 w-5 text-black" />
      </button>
    </div>
  )
}

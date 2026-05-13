"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

interface Slide {
  id: string
  imageUrl: string
  gameSlug: string | null
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [slides.length, next])

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <>
      {/* Background images layer */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Clickable link - stays behind content (z-10) but above overlay */}
      {slide.gameSlug && (
        <Link
          href={`/games/${slide.gameSlug}`}
          className="absolute inset-0 z-[2]"
          aria-label={`查看游戏: ${slide.gameSlug}`}
        />
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`切换到第 ${i + 1} 张`}
            />
          ))}
        </div>
      )}
    </>
  )
}
